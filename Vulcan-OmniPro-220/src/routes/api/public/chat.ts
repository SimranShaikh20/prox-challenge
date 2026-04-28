import { createFileRoute } from "@tanstack/react-router";
import { SYSTEM_PROMPT } from "@/server/welder-prompt";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
// Vision-capable, fast, generous output limits — perfect for the embedded JSON artifact responses
const MODEL = "google/gemini-2.5-flash";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type RequestBody = {
  message: string;
  history?: ChatMessage[];
  image_base64?: string | null;
  image_mime?: string | null;
};

type AgentResponse = {
  text: string;
  artifact_type: string | null;
  artifact_html: string | null;
  clarification_chips: string[] | null;
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

// Robust JSON extractor — model occasionally wraps output in code fences despite instructions
function extractJson(raw: string): AgentResponse {
  let s = raw.trim();
  // Strip ```json ... ``` fences
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  // Find first { and last } to be safe
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }
  try {
    const parsed = JSON.parse(s);
    return {
      text: typeof parsed.text === "string" ? parsed.text : "",
      artifact_type: parsed.artifact_type ?? null,
      artifact_html:
        typeof parsed.artifact_html === "string" && parsed.artifact_html.length > 50
          ? parsed.artifact_html
          : null,
      clarification_chips: Array.isArray(parsed.clarification_chips)
        ? parsed.clarification_chips.filter((c: unknown) => typeof c === "string")
        : null,
    };
  } catch {
    return {
      text: raw,
      artifact_type: null,
      artifact_html: null,
      clarification_chips: null,
    };
  }
}

export const Route = createFileRoute("/api/public/chat")({
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
          const history = Array.isArray(body.history) ? body.history.slice(-10) : [];

          // Build user content — include image if provided
          const userContent: Array<Record<string, unknown>> = [];
          if (body.message && body.message.trim()) {
            userContent.push({ type: "text", text: body.message });
          }
          if (body.image_base64) {
            const mime = body.image_mime || "image/jpeg";
            const dataUrl = body.image_base64.startsWith("data:")
              ? body.image_base64
              : `data:${mime};base64,${body.image_base64}`;
            userContent.push({
              type: "image_url",
              image_url: { url: dataUrl },
            });
            // Nudge the agent to diagnose
            if (!body.message || !body.message.trim()) {
              userContent.unshift({
                type: "text",
                text: "Diagnose what is in this photo (weld bead, welder display, or setup) and produce a diagnosis artifact.",
              });
            }
          }

          if (userContent.length === 0) {
            return jsonResponse({ error: "Empty message" }, 400);
          }

          const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userContent },
          ];

          const aiRes = await fetch(GATEWAY_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: MODEL,
              messages,
              // Generous to fit big artifact_html strings
              max_tokens: 8000,
            }),
          });

          if (!aiRes.ok) {
            const errText = await aiRes.text();
            console.error("AI gateway error:", aiRes.status, errText);
            if (aiRes.status === 429) {
              return jsonResponse(
                { error: "Rate limited. Please wait a moment and try again." },
                429,
              );
            }
            if (aiRes.status === 402) {
              return jsonResponse(
                { error: "AI credits exhausted. Add credits in workspace settings." },
                402,
              );
            }
            return jsonResponse({ error: "AI gateway error" }, 500);
          }

          const data = await aiRes.json();
          const raw: string = data?.choices?.[0]?.message?.content ?? "";
          const parsed = extractJson(raw);
          return jsonResponse(parsed);
        } catch (err) {
          console.error("chat handler error", err);
          return jsonResponse(
            { error: err instanceof Error ? err.message : "Unknown error" },
            500,
          );
        }
      },
    },
  },
});
