import type { Artifact } from "@realmos/contracts";

export function dedupeArtifacts(artifacts: Artifact[]): Artifact[] {
  const byKey = new Map<string, Artifact>();
  for (const artifact of artifacts) {
    const key = `${artifact.businessId ?? ""}:${artifact.path ?? artifact.id}`;
    const existing = byKey.get(key);
    if (!existing || artifact.createdAt >= existing.createdAt) {
      byKey.set(key, artifact);
    }
  }
  return [...byKey.values()];
}
