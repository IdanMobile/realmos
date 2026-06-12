import type { Memory, MemoryScope } from "@realmos/contracts";
import { writeMemory } from "./writer";
import type { MemoryStore, WriteMemoryInput } from "./types";

export const GLOBAL_MEMORY_SCOPE_ID = "global";

type ScopedWriteInput = Omit<WriteMemoryInput, "scope" | "scopeId">;

export async function writeGlobalMemory(store: MemoryStore, input: ScopedWriteInput): Promise<Memory> {
  return writeMemory(store, {
    ...input,
    scope: "global",
    scopeId: GLOBAL_MEMORY_SCOPE_ID
  });
}

export async function writeBusinessMemory(
  store: MemoryStore,
  memoryScopeId: string,
  input: ScopedWriteInput
): Promise<Memory> {
  return writeMemory(store, {
    ...input,
    scope: "business",
    scopeId: memoryScopeId
  });
}

export async function writeAgentMemory(
  store: MemoryStore,
  agentId: string,
  input: ScopedWriteInput
): Promise<Memory> {
  return writeMemory(store, {
    ...input,
    scope: "agent",
    scopeId: agentId
  });
}

export async function writeTaskMemory(
  store: MemoryStore,
  taskId: string,
  input: ScopedWriteInput
): Promise<Memory> {
  return writeMemory(store, {
    ...input,
    scope: "task",
    scopeId: taskId
  });
}

export async function listMemoriesByScope(
  store: MemoryStore,
  scope: MemoryScope,
  scopeId?: string
): Promise<Memory[]> {
  const memories = await store.listMemories();
  return memories
    .filter((memory) => memory.scope === scope && (scopeId ? memory.scopeId === scopeId : true))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listGlobalMemories(store: MemoryStore): Promise<Memory[]> {
  return listMemoriesByScope(store, "global", GLOBAL_MEMORY_SCOPE_ID);
}

export async function listBusinessMemories(store: MemoryStore, memoryScopeId: string): Promise<Memory[]> {
  return listMemoriesByScope(store, "business", memoryScopeId);
}

export async function listAgentMemories(store: MemoryStore, agentId: string): Promise<Memory[]> {
  return listMemoriesByScope(store, "agent", agentId);
}

export async function listTaskMemories(store: MemoryStore, taskId: string): Promise<Memory[]> {
  return listMemoriesByScope(store, "task", taskId);
}
