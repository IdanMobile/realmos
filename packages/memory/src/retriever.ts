import type { Agent, Memory } from "@realmos/contracts";
import { filterMemoriesForAgent, type AgentMemoryContext } from "./access";
import type { MemoryQuery, MemoryStore } from "./types";

function matchesQuery(memory: Memory, query: MemoryQuery): boolean {
  if (query.scope && memory.scope !== query.scope) {
    return false;
  }
  if (query.scopeId && memory.scopeId !== query.scopeId) {
    return false;
  }
  if (query.kind && memory.kind !== query.kind) {
    return false;
  }
  if (!query.includeSensitive && memory.sensitivity === "sensitive") {
    return false;
  }
  return true;
}

export async function retrieveMemories(store: MemoryStore, query: MemoryQuery = {}): Promise<Memory[]> {
  const memories = await store.listMemories();
  return memories
    .filter((memory) => matchesQuery(memory, query))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function retrieveMemoriesForAgent(
  store: MemoryStore,
  context: AgentMemoryContext,
  query: MemoryQuery = {}
): Promise<Memory[]> {
  const scoped = await retrieveMemories(store, query);
  return filterMemoriesForAgent(context, scoped, {
    includeSensitive: query.includeSensitive
  });
}

export async function getMemoryById(
  store: MemoryStore,
  id: string,
  context?: AgentMemoryContext
): Promise<Memory | null> {
  const memory = await store.getMemory(id);
  if (!memory) return null;

  if (context && !filterMemoriesForAgent(context, [memory], { includeSensitive: true }).length) {
    return null;
  }

  return memory;
}

export function buildAgentMemoryContext(
  agent: Agent,
  businessMemoryScopeId?: string
): AgentMemoryContext {
  return { agent, businessMemoryScopeId };
}
