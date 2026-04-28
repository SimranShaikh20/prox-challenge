import { useState } from "react";

type Step = {
  title: string;
  instruction: string;
  artifact_type?: string | null;
  artifact_html?: string | null;
  tip?: string | null;
};

type Plan = {
  title: string;
  summary: string;
  steps: Step[];
  final_note: string;
};

type Selections = {
  process: string;
  material: string;
  thickness: string;
};

const PROCESSES = [
  { id: "MIG", label: "MIG", desc: "Easiest. Solid wire + gas." },
  { id: "Flux-Cored", label: "Flux-Cored", desc: "No gas. Outdoor / windy." },
  { id: "TIG", label: "TIG", desc: "Most precise. Slow." },
  { id: "Stick", label: "Stick", desc: "Rusty / dirty metal." },
];

const MATERIALS = [
  { id: "Mild Steel", label: "Mild Steel", desc: "Most common." },
  { id: "Stainless Steel", label: "Stainless", desc: "Corrosion resistant." },
  { id: "Aluminum", label: "Aluminum", desc: "Lightweight. Tricky." },
];

const THICKNESSES = [
  "24 gauge",
  "18 gauge",
  "16 gauge",
  "14 gauge",
  '1/8"',
  '3/16"',
  '1/4"',
  '3/8"',
  '1/2"',
];

type Props = {
  onClose: () => void;
};

export function GuidedMode({ onClose }: Props) {
  const [selections, setSelections] = useState<Selections>({
    process: "",
    material: "",
    thickness: "",
  });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const startGuide = async () => {
    if (!selections.process || !selections.material || !selections.thickness) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/guided-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selections),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to build guide");
      if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
        throw new Error("Guide came back empty. Try again.");
      }
      setPlan(data);
      setStepIdx(0);
      setCompleted(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    if (!plan) return;
    setCompleted((prev) => new Set(prev).add(stepIdx));
    if (stepIdx < plan.steps.length - 1) {
      setStepIdx(stepIdx + 1);
    }
  };

  const handleBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const reset = () => {
    setPlan(null);
    setStepIdx(0);
    setCompleted(new Set());
    setSelections({ process: "", material: "", thickness: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2 4 14h6l-2 8 10-13h-6l2-7Z" />
            </svg>
          </div>
          <div className="leading-tight">
            <h2 className="text-sm font-bold text-foreground">Guided Setup</h2>
            <p className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {plan ? plan.title : "Vulcan OmniPro 220"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          <span>✕</span> <span>Exit Guide</span>
        </button>
      </header>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {!plan ? (
          <SelectionWizard
            selections={selections}
            setSelections={setSelections}
            onStart={startGuide}
            loading={loading}
            error={error}
          />
        ) : (
          <StepView
            plan={plan}
            stepIdx={stepIdx}
            completed={completed}
            onDone={handleDone}
            onBack={handleBack}
            onJump={(i) => setStepIdx(i)}
            onReset={reset}
            helpOpen={helpOpen}
            setHelpOpen={setHelpOpen}
          />
        )}
      </div>
    </div>
  );
}

function SelectionWizard({
  selections,
  setSelections,
  onStart,
  loading,
  error,
}: {
  selections: Selections;
  setSelections: (s: Selections) => void;
  onStart: () => void;
  loading: boolean;
  error: string | null;
}) {
  const ready = selections.process && selections.material && selections.thickness;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 text-center">
          <p className="mono mb-2 text-xs uppercase tracking-[0.2em] text-primary">
            Setup Wizard
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            What are you welding today?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Three quick questions, then I'll walk you through every step.
          </p>
        </div>

        {/* 1. Process */}
        <SectionLabel num="1" title="Pick your process" />
        <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
          {PROCESSES.map((p) => (
            <OptionCard
              key={p.id}
              label={p.label}
              desc={p.desc}
              selected={selections.process === p.id}
              onClick={() => setSelections({ ...selections, process: p.id })}
            />
          ))}
        </div>

        {/* 2. Material */}
        <SectionLabel num="2" title="Pick your material" />
        <div className="mb-6 grid grid-cols-1 gap-2 md:grid-cols-3">
          {MATERIALS.map((m) => (
            <OptionCard
              key={m.id}
              label={m.label}
              desc={m.desc}
              selected={selections.material === m.id}
              onClick={() => setSelections({ ...selections, material: m.id })}
            />
          ))}
        </div>

        {/* 3. Thickness */}
        <SectionLabel num="3" title="Pick the thickness" />
        <div className="mb-8 grid grid-cols-3 gap-2 md:grid-cols-5">
          {THICKNESSES.map((t) => (
            <button
              key={t}
              onClick={() => setSelections({ ...selections, thickness: t })}
              className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                selections.thickness === t
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[#f85149]/40 bg-[#f85149]/10 p-3 text-sm text-[#f85149]">
            {error}
          </div>
        )}

        <button
          onClick={onStart}
          disabled={!ready || loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {loading ? (
            <>
              <span className="bounce-dot h-2 w-2 rounded-full bg-primary-foreground" />
              <span className="bounce-dot h-2 w-2 rounded-full bg-primary-foreground" />
              <span className="bounce-dot h-2 w-2 rounded-full bg-primary-foreground" />
              <span className="ml-2">Building your guide…</span>
            </>
          ) : (
            <>
              Start Guided Setup
              <span>→</span>
            </>
          )}
        </button>
        <p className="mono mt-3 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
          Powered by Vulcan OmniPro 220 expert knowledge
        </p>
      </div>
    </div>
  );
}

function SectionLabel({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="mono flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
        {num}
      </span>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h3>
    </div>
  );
}

function OptionCard({
  label,
  desc,
  selected,
  onClick,
}: {
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <span className={`text-base font-semibold ${selected ? "text-foreground" : "text-foreground"}`}>
        {label}
      </span>
      <span className="mt-1 text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}

function StepView({
  plan,
  stepIdx,
  completed,
  onDone,
  onBack,
  onJump,
  onReset,
  helpOpen,
  setHelpOpen,
}: {
  plan: Plan;
  stepIdx: number;
  completed: Set<number>;
  onDone: () => void;
  onBack: () => void;
  onJump: (i: number) => void;
  onReset: () => void;
  helpOpen: boolean;
  setHelpOpen: (b: boolean) => void;
}) {
  const step = plan.steps[stepIdx];
  const total = plan.steps.length;
  const isFinalCompleted = completed.size === total;
  const progressPct = (completed.size / total) * 100;

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Steps sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card/30 md:flex">
        <div className="border-b border-border p-4">
          <p className="mono mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            Progress
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mono mt-2 text-xs text-muted-foreground">
            {completed.size} of {total} done
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {plan.steps.map((s, i) => {
            const isDone = completed.has(i);
            const isActive = i === stepIdx;
            return (
              <button
                key={i}
                onClick={() => onJump(i)}
                className={`mb-1 flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition ${
                  isActive
                    ? "bg-primary/15"
                    : "hover:bg-card"
                }`}
              >
                <span
                  className={`mono mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                    isDone
                      ? "bg-[#3fb950] text-[#0a0c10]"
                      : isActive
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span
                  className={`text-xs leading-tight ${
                    isActive ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
        <div className="border-t border-border p-3">
          <button
            onClick={onReset}
            className="mono w-full rounded-lg border border-border px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            ↺ Restart Wizard
          </button>
        </div>
      </aside>

      {/* Main step */}
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8 md:px-10 md:py-10">
          {/* Step header */}
          <div className="mb-6">
            <div className="mono mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
              <span>Step {stepIdx + 1} of {total}</span>
              <span className="h-1 w-1 rounded-full bg-primary/60" />
              <span className="text-muted-foreground">{plan.title}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              {step.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-foreground md:text-lg">
              {step.instruction}
            </p>
            {step.tip && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#d29922]/30 bg-[#d29922]/5 p-3">
                <span className="text-base">💡</span>
                <p className="text-sm text-[#d29922]">{step.tip}</p>
              </div>
            )}
          </div>

          {/* Artifact */}
          {step.artifact_html && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-[#0a0c10]">
              <div className="flex h-9 items-center justify-between border-b border-border bg-card/60 px-4">
                <span className="mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {step.artifact_type || "Visual"} reference
                </span>
                <span className="mono text-[10px] uppercase tracking-wider text-[#3fb950]">
                  ● Live
                </span>
              </div>
              <iframe
                key={`${stepIdx}-${step.title}`}
                title={step.title}
                srcDoc={step.artifact_html}
                sandbox="allow-scripts"
                className="block h-[480px] w-full border-0"
              />
            </div>
          )}

          {/* Final note */}
          {stepIdx === total - 1 && (
            <div className="mb-6 rounded-2xl border border-primary/40 bg-primary/10 p-5">
              <div className="mono mb-1 text-[10px] uppercase tracking-wider text-primary">
                Final Reminder
              </div>
              <p className="text-base text-foreground">{plan.final_note}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="sticky bottom-0 -mx-6 mt-8 border-t border-border bg-background/95 px-6 py-4 backdrop-blur md:-mx-10 md:px-10">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onBack}
                disabled={stepIdx === 0}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← Back
              </button>
              <button
                onClick={() => setHelpOpen(!helpOpen)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/40"
              >
                ? Help
              </button>
              <div className="flex-1" />
              {stepIdx < total - 1 ? (
                <button
                  onClick={onDone}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-90"
                >
                  ✓ Done — Next Step
                </button>
              ) : (
                <button
                  onClick={onDone}
                  className="flex items-center gap-2 rounded-xl bg-[#3fb950] px-6 py-3 text-sm font-semibold text-[#0a0c10] shadow-lg transition hover:opacity-90"
                >
                  ✓ Finish — I'm Ready to Weld
                </button>
              )}
            </div>
            {isFinalCompleted && stepIdx === total - 1 && (
              <div className="mt-3 rounded-lg border border-[#3fb950]/40 bg-[#3fb950]/10 p-3 text-sm text-[#3fb950]">
                🔥 You're set up. Strike that arc — and respect the duty cycle.
              </div>
            )}
          </div>

          {/* Help sub-chat */}
          {helpOpen && (
            <HelpPanel
              context={`I'm in Guided Mode setup for ${plan.title}. Step ${stepIdx + 1} of ${total}: "${step.title}". Instruction: "${step.instruction}".`}
              onClose={() => setHelpOpen(false)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

type HelpMsg = { role: "user" | "assistant"; text: string };

function HelpPanel({ context, onClose }: { context: string; onClose: () => void }) {
  const [messages, setMessages] = useState<HelpMsg[]>([
    {
      role: "assistant",
      text: "What are you stuck on? Describe what you're seeing or what's confusing.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: HelpMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${context}\n\nUser question: ${text}`,
          history: [],
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.text || "Got it." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry — couldn't reach the assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center">
      <div className="flex h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="mono text-[10px] uppercase tracking-wider text-primary">Help</p>
            <h3 className="text-sm font-semibold text-foreground">Stuck on this step?</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-tl-md border border-border bg-background text-foreground"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-1">
              <span className="bounce-dot h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="bounce-dot h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="bounce-dot h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
          )}
        </div>
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Describe what you see…"
              rows={1}
              className="max-h-24 min-h-[28px] flex-1 resize-none bg-transparent px-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-30"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
