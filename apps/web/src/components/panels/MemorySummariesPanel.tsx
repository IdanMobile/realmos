"use client";

import { useMemo, useState } from "react";
import type { Memory, MemoryScope } from "@realmos/contracts";

type MemoryPanelProps = {
  memories: Memory[];
  onEdit?: (id: string, patch: Pick<Memory, "title" | "content">) => void;
  onDelete?: (id: string) => void;
};

const SCOPE_OPTIONS: Array<MemoryScope | "all"> = ["all", "global", "business", "agent", "task"];

function sensitivityLabel(sensitivity: Memory["sensitivity"]): string {
  if (sensitivity === "sensitive") return "Sensitive";
  if (sensitivity === "private") return "Private";
  return "Normal";
}

export function MemoryPanel({ memories, onEdit, onDelete }: MemoryPanelProps) {
  const [scopeFilter, setScopeFilter] = useState<MemoryScope | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const filtered = useMemo(() => {
    if (scopeFilter === "all") return memories;
    return memories.filter((memory) => memory.scope === scopeFilter);
  }, [memories, scopeFilter]);

  const summaries = useMemo(() => {
    const groups = new Map<string, Memory[]>();
    for (const memory of memories) {
      const key = `${memory.scope}:${memory.scopeId}`;
      const bucket = groups.get(key) ?? [];
      bucket.push(memory);
      groups.set(key, bucket);
    }
    return [...groups.entries()].map(([key, group]) => {
      const latest = [...group].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
      return {
        key,
        scope: latest?.scope ?? "global",
        count: group.length,
        latestTitle: latest?.title ?? "Untitled",
        sensitiveCount: group.filter((memory) => memory.sensitivity === "sensitive").length
      };
    });
  }, [memories]);

  const selected = filtered.find((memory) => memory.id === selectedId) ?? null;

  function startEdit(memory: Memory) {
    setSelectedId(memory.id);
    setDraftTitle(memory.title);
    setDraftContent(memory.content);
  }

  function saveEdit() {
    if (!selectedId || !onEdit) return;
    onEdit(selectedId, { title: draftTitle.trim(), content: draftContent.trim() });
  }

  return (
    <section className="card" aria-label="Memory panel">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="panel-title">Memory</h3>
        <label className="text-sm text-textSecondary">
          Scope
          <select
            className="ml-2 rounded border border-border/70 bg-surface px-2 py-1 text-sm text-textPrimary"
            value={scopeFilter}
            onChange={(event) => setScopeFilter(event.target.value as MemoryScope | "all")}
            aria-label="Filter memory by scope"
          >
            {SCOPE_OPTIONS.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
          </select>
        </label>
      </div>

      {summaries.length > 0 ? (
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          {summaries.map((summary) => (
            <article
              key={summary.key}
              className="rounded-lg border border-border/70 bg-surface p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{summary.latestTitle}</span>
                <span className="badge bg-violet-500/15 text-violet-200">{summary.scope}</span>
              </div>
              <p className="mt-1 text-textSecondary">
                {summary.count} entries
                {summary.sensitiveCount > 0 ? ` · ${summary.sensitiveCount} sensitive` : ""}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-textSecondary">No memory entries for this scope.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((memory) => (
            <li key={memory.id}>
              <article className="rounded-lg border border-border/70 bg-surface p-3">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold">{memory.title}</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-violet-500/15 text-violet-200">{memory.scope}</span>
                    <span
                      className={`badge ${
                        memory.sensitivity === "sensitive"
                          ? "bg-rose-500/15 text-rose-200"
                          : "bg-slate-500/15 text-slate-200"
                      }`}
                    >
                      {sensitivityLabel(memory.sensitivity)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-textSecondary">{memory.content}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="rounded border border-border/70 px-2 py-1 text-xs"
                    onClick={() => startEdit(memory)}
                  >
                    Edit
                  </button>
                  {onDelete ? (
                    <button
                      type="button"
                      className="rounded border border-rose-500/40 px-2 py-1 text-xs text-rose-200"
                      onClick={() => onDelete(memory.id)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {selected && onEdit ? (
        <form
          className="mt-4 rounded-lg border border-cyan-400/40 bg-cyan-500/5 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            saveEdit();
          }}
        >
          <h4 className="mb-2 font-semibold">Edit memory</h4>
          <label className="mb-2 block text-sm">
            Title
            <input
              className="mt-1 w-full rounded border border-border/70 bg-surface px-2 py-1"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
            />
          </label>
          <label className="mb-2 block text-sm">
            Content
            <textarea
              className="mt-1 w-full rounded border border-border/70 bg-surface px-2 py-1"
              rows={3}
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
            />
          </label>
          <button type="submit" className="rounded border border-border/70 px-3 py-1 text-sm">
            Save changes
          </button>
        </form>
      ) : null}
    </section>
  );
}

/** @deprecated Use MemoryPanel */
export function MemorySummariesPanel(props: MemoryPanelProps) {
  return <MemoryPanel {...props} />;
}
