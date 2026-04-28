import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ArtifactPanel } from "@/components/chat/ArtifactPanel";
import { GuidedMode } from "@/components/guided/GuidedMode";
import type { Artifact } from "@/components/chat/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vulcan OmniPro 220 — Expert Support" },
      {
        name: "description",
        content:
          "Instant visual help for your Vulcan OmniPro 220 multiprocess welder — polarity diagrams, duty cycle calculator, troubleshooting flowcharts, and photo diagnosis.",
      },
      { property: "og:title", content: "Vulcan OmniPro 220 — Expert Support" },
      {
        property: "og:description",
        content: "Visual diagrams, calculators, and instant photo diagnosis for the Vulcan OmniPro 220 welder.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [guidedOpen, setGuidedOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold tracking-tight text-foreground">
              Vulcan OmniPro 220
            </h1>
            <p className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Expert Support · Powered by Prox
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGuidedOpen(true)}
            className="group flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-md transition hover:opacity-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 12 3l9 4.5-9 4.5L3 7.5Zm0 0v9l9 4.5m0-13.5v13.5m0 0 9-4.5v-9" />
            </svg>
            <span>Guided Mode</span>
            <span className="mono ml-1 hidden rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider md:inline">
              New
            </span>
          </button>
          <div className="hidden items-center gap-2 md:flex">
            <span
              className="pulse-dot h-2 w-2 rounded-full"
              style={{ background: "#3fb950" }}
            />
            <span className="mono text-xs text-muted-foreground">Online</span>
          </div>
        </div>
      </header>

      {/* Split panels */}
      <main className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section className="flex h-1/2 min-h-0 w-full flex-col border-b border-border md:h-full md:w-1/2 md:border-b-0 md:border-r">
          <ChatPanel onArtifact={setArtifact} />
        </section>
        <section className="h-1/2 min-h-0 w-full md:h-full md:w-1/2">
          <ArtifactPanel artifact={artifact} />
        </section>
      </main>

      {guidedOpen && <GuidedMode onClose={() => setGuidedOpen(false)} />}
    </div>
  );
}
