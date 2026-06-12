"use client";

import { useMemo, useState } from "react";
import type { Artifact } from "@realmos/contracts";

function dedupeArtifacts(artifacts: Artifact[]): Artifact[] {
  const byKey = new Map<string, Artifact>();
  for (const artifact of artifacts) {
    const key = `${artifact.businessId ?? ""}:${artifact.path ?? artifact.id}`;
    const existing = byKey.get(key);
    if (!existing || artifact.createdAt >= existing.createdAt) {
      byKey.set(key, artifact);
    }
  }
  return [...byKey.values()].sort((a, b) => (a.path ?? "").localeCompare(b.path ?? ""));
}

export function SpecKitArtifactsPanel({ artifacts }: { artifacts: Artifact[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const uniqueArtifacts = useMemo(() => dedupeArtifacts(artifacts), [artifacts]);

  return (
    <section className="card" aria-label="SpecKit artifacts panel">
      <h3 className="panel-title">SpecKit Artifacts</h3>
      {uniqueArtifacts.length === 0 ? (
        <p className="text-sm text-textSecondary">No SpecKit artifacts generated yet.</p>
      ) : (
        <ul className="space-y-2">
          {uniqueArtifacts.slice(0, 12).map((artifact) => {
            const expanded = expandedId === artifact.id;
            return (
              <li key={`${artifact.businessId}:${artifact.path ?? artifact.id}`} className="rounded-lg border border-border/70 bg-surface p-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="text-left font-semibold hover:text-accent"
                    onClick={() => setExpandedId(expanded ? null : artifact.id)}
                  >
                    {artifact.path ?? artifact.title}
                  </button>
                  <span className="badge bg-emerald-500/15 text-emerald-200">{artifact.kind}</span>
                </div>
                {artifact.content ? (
                  expanded ? (
                    <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-textSecondary">
                      {artifact.content}
                    </pre>
                  ) : (
                    <p className="mt-2 line-clamp-2 text-sm text-textSecondary">
                      {artifact.content.split("\n").slice(0, 2).join(" ")}
                    </p>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
