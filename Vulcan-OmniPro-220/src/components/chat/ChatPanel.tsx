import { useEffect, useRef, useState } from "react";
import type { ChatMessage, Artifact } from "./types";

const QUICK_CHIPS = [
  "What polarity for TIG welding?",
  "Duty cycle at 200A on 240V?",
  "Why am I getting porosity?",
  "Settings for 1/4 inch steel MIG?",
  "Wire keeps bird-nesting — help",
  "How do I set up flux-cored?",
  "Show me pre-weld checklist for MIG",
  "What wire size for 3/16 inch steel?",
];

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text:
    "Hey! I know everything about your Vulcan OmniPro 220. Ask me anything — polarity setup, duty cycles, troubleshooting, or upload a photo of your weld for instant diagnosis. I'll show you diagrams, not just text.",
};

type Props = {
  onArtifact: (a: Artifact) => void;
};

export function ChatPanel({ onArtifact }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<{
    base64: string;
    mime: string;
    preview: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text && !pendingImage) return;
    if (isLoading) return;

    setErrorMsg(null);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: text || "(image)",
      imagePreview: pendingImage?.preview ?? null,
    };

    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const imageToSend = pendingImage;
    setPendingImage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          image_base64: imageToSend?.base64 ?? null,
          image_mime: imageToSend?.mime ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.text || "Done.",
        artifactType: data.artifact_type ?? null,
        clarificationChips: data.clarification_chips ?? null,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.artifact_html && typeof data.artifact_html === "string") {
        onArtifact({
          type: data.artifact_type || "visual",
          html: data.artifact_html,
          ts: Date.now(),
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(message);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: `⚠️ ${message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1] || "";
      setPendingImage({ base64, mime: file.type, preview: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className="flex h-full flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              onChipClick={(chip) => handleSend(chip)}
            />
          ))}
          {isLoading && <LoadingBubble />}
        </div>
      </div>

      {/* Quick chips */}
      <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur">
        <div className="scrollbar-hide overflow-x-auto px-4 pt-3">
          <div className="flex gap-2 pb-2">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                disabled={isLoading}
                className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:bg-card/80 hover:text-foreground disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Pending image preview */}
        {pendingImage && (
          <div className="px-4 pt-1">
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card p-1.5 pr-3">
              <img
                src={pendingImage.preview}
                alt="upload preview"
                className="h-10 w-10 rounded object-cover"
              />
              <span className="mono text-xs text-muted-foreground">image attached</span>
              <button
                onClick={() => setPendingImage(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="remove image"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="px-4 pt-2">
            <p className="text-xs text-[#f85149]">{errorMsg}</p>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 focus-within:border-primary/50">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-background hover:text-foreground disabled:opacity-50"
              aria-label="upload photo"
              title="Upload photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.822 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask anything about your Vulcan OmniPro 220…"
              rows={1}
              disabled={isLoading}
              className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-1 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isLoading || (!input.trim() && !pendingImage)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="send"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0-7 7m7-7 7 7" />
              </svg>
            </button>
          </div>
          <p className="mono mt-1.5 px-2 text-[10px] text-muted-foreground">
            Enter to send · Shift+Enter for newline · Drag image to upload
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onChipClick,
}: {
  message: ChatMessage;
  onChipClick: (chip: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.imagePreview && (
            <img
              src={message.imagePreview}
              alt="uploaded"
              className="mb-2 max-h-48 rounded-lg"
            />
          )}
          <div className="whitespace-pre-wrap">{message.text}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <span className="text-base">⚡</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-md border border-border bg-card px-4 py-2.5 text-sm text-foreground">
          <div className="whitespace-pre-wrap">{message.text}</div>
        </div>
        {message.clarificationChips && message.clarificationChips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.clarificationChips.map((c) => (
              <button
                key={c}
                onClick={() => onChipClick(c)}
                className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary transition hover:bg-primary/20"
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <span className="text-base">⚡</span>
      </div>
      <div className="rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="bounce-dot h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="bounce-dot h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="bounce-dot h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
