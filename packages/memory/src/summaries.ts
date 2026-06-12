import type { Memory, MemoryScope } from "@realmos/contracts";

export type MemorySummary = {
  scope: MemoryScope;
  scopeId: string;
  count: number;
  latestTitle: string;
  latestUpdatedAt: string;
  sensitiveCount: number;
  preview: string;
};

function buildPreview(memories: Memory[]): string {
  const latest = memories[0];
  if (!latest) return "";
  const snippet = latest.content.slice(0, 160);
  return snippet.length < latest.content.length ? `${snippet}…` : snippet;
}

export function buildMemorySummaries(memories: Memory[]): MemorySummary[] {
  const groups = new Map<string, Memory[]>();

  for (const memory of memories) {
    const key = `${memory.scope}:${memory.scopeId}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(memory);
    groups.set(key, bucket);
  }

  const summaries: MemorySummary[] = [];

  for (const [, group] of groups) {
    const sorted = [...group].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const latest = sorted[0];
    if (!latest) continue;

    summaries.push({
      scope: latest.scope,
      scopeId: latest.scopeId,
      count: sorted.length,
      latestTitle: latest.title,
      latestUpdatedAt: latest.updatedAt,
      sensitiveCount: sorted.filter((memory) => memory.sensitivity === "sensitive").length,
      preview: buildPreview(sorted)
    });
  }

  return summaries.sort((a, b) => b.latestUpdatedAt.localeCompare(a.latestUpdatedAt));
}

export function buildSummaryKindMemories(
  storeMemories: Memory[],
  scope: MemoryScope,
  scopeId: string
): Memory[] {
  return storeMemories.filter(
    (memory) => memory.scope === scope && memory.scopeId === scopeId && memory.kind === "summary"
  );
}
