import { createFileRoute } from "@tanstack/react-router";
import { GUIDED_SYSTEM_PROMPT } from "@/server/guided-prompt";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

type RequestBody = {
  process: string;
  material: string;
  thickness: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function extractJson(raw: string): unknown {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) s = s.slice(first, last + 1);
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/public/guided-plan")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        try {
          const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
          if (!LOVABLE_API_KEY) {
            return jsonResponse({ error: "LOVABLE_API_KEY not configured" }, 500);
          }

          const body = (await request.json()) as RequestBody;
          if (!body.process || !body.material || !body.thickness) {
            return jsonResponse({ error: "Missing process/material/thickness" }, 400);
          }

          const userPrompt = `Generate a complete guided setup plan for:
- Process: ${body.process}
- Material: ${body.material}
- Thickness: ${body.thickness}

Walk me through every step from "machine is off in my garage" to "I am ready to strike my first arc". Include visual artifacts on the polarity step, the machine settings step, the duty cycle step, and at least one wire/gas/torch diagram step. Use real numbers from the Vulcan OmniPro 220 knowledge base.`;

          const aiRes = await fetch(GATEWAY_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: MODEL,
              messages: [
                { role: "system", content: GUIDED_SYSTEM_PROMPT },
                { role: "user", content: userPrompt },
              ],
              max_tokens: 16000,
            }),
          });

          if (!aiRes.ok) {
            const errText = await aiRes.text();
            console.error("AI gateway error:", aiRes.status, errText);
            if (aiRes.status === 429) {
              return jsonResponse({ error: "Rate limited. Please wait a moment." }, 429);
            }
            if (aiRes.status === 402) {
              return jsonResponse({ error: "AI credits exhausted." }, 402);
            }
            return jsonResponse({ error: "AI gateway error" }, 500);
          }

          const data = await aiRes.json();
          const raw: string = data?.choices?.[0]?.message?.content ?? "";
          const parsed = extractJson(raw);
          if (!parsed) {
            return jsonResponse({ error: "Could not parse AI response", raw }, 500);
          }
          return jsonResponse(parsed);
        } catch (err) {
          console.error("guided-plan handler error", err);
          return jsonResponse(
            { error: err instanceof Error ? err.message : "Unknown error" },
            500,
          );
        }
      },
    },
  },
});
