export type MemoryScope = "global" | "business" | "agent" | "task" | "run";
export type MemoryKind = "decision" | "preference" | "knowledge" | "summary" | "artifact" | "event" | "risk" | "metric" | "lesson";
export type MemorySensitivity = "normal" | "private" | "sensitive";
export type MemoryRetention = "keep" | "review" | "expire";

export type MemoryPermission = {
  scope: MemoryScope;
  access: "none" | "read" | "write" | "read_write";
  allowedScopeIds?: string[];
};

export type Memory = {
  id: string;
  scope: MemoryScope;
  scopeId: string;
  kind: MemoryKind;
  title: string;
  content: string;
  source: "conversation" | "file" | "agent" | "tool" | "manual";
  sensitivity: MemorySensitivity;
  retention: MemoryRetention;
  createdAt: string;
  updatedAt: string;
};
