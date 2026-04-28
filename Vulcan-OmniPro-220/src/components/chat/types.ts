export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  imagePreview?: string | null;
  artifactType?: string | null;
  clarificationChips?: string[] | null;
};

export type Artifact = {
  type: string;
  html: string;
  ts: number;
};
