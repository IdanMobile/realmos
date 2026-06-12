import type { ContextPack, Memory } from "@realmos/contracts";

function estimateMemoryTokens(memory: Memory): number {
  return Math.max(40, Math.ceil((memory.content.length + memory.title.length) / 4));
}

export function estimateFullMemoryTokens(memories: Memory[]): number {
  return memories.reduce((sum, memory) => sum + estimateMemoryTokens(memory), 0);
}

export function buildContextPack(input: {
  purpose: string;
  memories: Memory[];
  maxTokens?: number;
  businessId?: string;
  agentId?: string;
}): { pack: ContextPack; baselineTokens: number; savingsTokens: number } {
  const maxTokens = input.maxTokens ?? 800;
  const scoped = input.memories.filter((memory) => {
    if (input.businessId && memory.scope === "business" && memory.scopeId !== input.businessId) {
      return false;
    }
    if (input.agentId && memory.scope === "agent" && memory.scopeId !== input.agentId) {
      return false;
    }
    if (memory.sensitivity === "sensitive") {
      return false;
    }
    return true;
  });

  const ranked = [...scoped].sort(
    (a, b) => estimateMemoryTokens(b) - estimateMemoryTokens(a)
  );

  const selected: Memory[] = [];
  let tokenEstimate = 0;
  for (const memory of ranked) {
    const next = estimateMemoryTokens(memory);
    if (tokenEstimate + next > maxTokens) continue;
    selected.push(memory);
    tokenEstimate += next;
  }

  const baselineTokens = estimateFullMemoryTokens(scoped);
  const savingsTokens = Math.max(0, baselineTokens - tokenEstimate);

  const pack: ContextPack = {
    id: `ctx_${Date.now()}`,
    purpose: input.purpose,
    memoryRefs: selected.map((memory) => memory.id),
    summary: selected.map((memory) => `- ${memory.title}: ${memory.content.slice(0, 120)}`).join("\n"),
    tokenEstimate,
    includedScopes: [...new Set(selected.map((memory) => memory.scope))],
    excludedReasons:
      scoped.length > selected.length
        ? ["token_budget", "sensitive_memory_filtered"]
        : undefined,
    createdAt: new Date().toISOString()
  };

  return { pack, baselineTokens, savingsTokens };
}
