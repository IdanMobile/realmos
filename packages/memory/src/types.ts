import type { Memory, MemoryScope } from "@realmos/contracts";

export type MemoryStore = {
  listMemories(): Promise<Memory[]>;
  getMemory(id: string): Promise<Memory | null>;
  createMemory(memory: Memory): Promise<Memory>;
  updateMemory(id: string, patch: Partial<Memory>): Promise<Memory | null>;
  deleteMemory(id: string): Promise<boolean>;
};

export type WriteMemoryInput = {
  scope: MemoryScope;
  scopeId: string;
  kind: Memory["kind"];
  title: string;
  content: string;
  source?: Memory["source"];
  sensitivity?: Memory["sensitivity"];
  retention?: Memory["retention"];
  id?: string;
};

export type MemoryQuery = {
  scope?: MemoryScope;
  scopeId?: string;
  kind?: Memory["kind"];
  includeSensitive?: boolean;
};
