import { useEffect, useRef } from "react";
import type { Artifact } from "./types";

const TYPE_LABELS: Record<string, string> = {
  polarity: "Wiring Diagram",
  duty_cycle: "Duty Cycle Calculator",
  troubleshoot: "Troubleshooting Flowchart",
  settings: "Settings Configurator",
  checklist: "Pre-Weld Checklist",
  diagnosis: "Photo Diagnosis",
};

export function ArtifactPanel({ artifact }: { artifact: Artifact | null }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Force fresh srcdoc render on each new artifact (key remount handles this too)
  useEffect(() => {
    if (artifact && iframeRef.current) {
      // no-op, srcdoc re-applies via key
    }
  }, [artifact]);

  if (!artifact) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card opacity-60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-10 w-10 text-muted-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.166-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.383.93-.78.165-.398.143-.854-.108-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Visual Reference Panel</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Diagrams, calculators, flowcharts, and settings configurators appear here as you ask questions.
        </p>

        <div className="mt-8 grid w-full max-w-md gap-3 text-left">
          <HintRow icon="⚡" label="Polarity questions" arrow="wiring diagram" />
          <HintRow icon="📊" label="Duty cycle questions" arrow="live calculator" />
          <HintRow icon="🔧" label="Troubleshooting" arrow="visual flowchart" />
          <HintRow icon="⚙️" label="Settings questions" arrow="configurator" />
        </div>
      </div>
    );
  }

  const label = TYPE_LABELS[artifact.type] || "Visual Reference";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4">
        <div className="flex items-center gap-2">
          <span className="mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[oklch(var(--success))]" style={{ background: "#3fb950" }} />
          <span className="mono text-[10px] uppercase tracking-wider text-muted-foreground">Live</span>
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden bg-[#0a0c10]">
        <iframe
          key={artifact.ts}
          ref={iframeRef}
          title={label}
          srcDoc={artifact.html}
          sandbox="allow-scripts"
          className="fade-in absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}

function HintRow({ icon, label, arrow }: { icon: string; label: string; arrow: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-3 py-2.5 text-sm">
      <span className="text-base">{icon}</span>
      <span className="text-foreground">{label}</span>
      <span className="ml-auto text-xs text-muted-foreground">→ {arrow}</span>
    </div>
  );
}
