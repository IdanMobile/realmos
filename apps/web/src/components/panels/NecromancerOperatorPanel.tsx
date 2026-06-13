"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchNecromancerActions,
  fetchNecromancerCandidate,
  fetchNecromancerCandidates,
  fetchNecromancerStatus,
  prepareNecromancerCandidate,
  runNecromancerCandidateAction,
  type NecromancerActionRecord,
  type NecromancerCandidate,
  type NecromancerPersistenceStatus,
  type NecromancerRecommendation
} from "@/lib/api/necromancer";

type NecromancerOperatorPanelProps = {
  dataSource: "api" | "mock";
};

function riskBadgeClass(risk: NecromancerCandidate["riskLevel"]): string {
  if (risk === "high") return "bg-rose-500/15 text-rose-200";
  if (risk === "medium") return "bg-amber-500/15 text-amber-200";
  return "bg-slate-500/15 text-slate-200";
}

export function NecromancerOperatorPanel({ dataSource }: NecromancerOperatorPanelProps) {
  const [candidates, setCandidates] = useState<NecromancerCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<NecromancerRecommendation | null>(null);
  const [actions, setActions] = useState<NecromancerActionRecord[]>([]);
  const [persistence, setPersistence] = useState<NecromancerPersistenceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [operatorId, setOperatorId] = useState("operator");
  const [evidenceId, setEvidenceId] = useState("");

  const refresh = useCallback(async () => {
    if (dataSource !== "api") {
      setLoadError("Necromancer operator flow requires live API.");
      setCandidates([]);
      setActions([]);
      setPersistence(null);
      return;
    }

    setLoading(true);
    setLoadError(null);

    const [candidateResult, actionResult, statusResult] = await Promise.all([
      fetchNecromancerCandidates(),
      fetchNecromancerActions(),
      fetchNecromancerStatus()
    ]);

    if (!candidateResult.ok) {
      setLoadError(candidateResult.message);
      setCandidates([]);
    } else {
      setCandidates(candidateResult.data.items);
      setSelectedId((current) => current ?? candidateResult.data.items[0]?.id ?? null);
      if (statusResult.ok) {
        setPersistence(statusResult.data);
      } else {
        setPersistence({
          persistenceMode: candidateResult.data.persistenceMode,
          durable: candidateResult.data.durable,
          safetyNotice: candidateResult.data.safetyNotice
        });
      }
    }

    if (actionResult.ok) {
      setActions(actionResult.data.items);
      if (!statusResult.ok) {
        setPersistence({
          persistenceMode: actionResult.data.persistenceMode,
          durable: actionResult.data.durable,
          safetyNotice: "No autonomous destructive actions. Approval required for pause/retire/protect."
        });
      }
    }

    if (statusResult.ok) {
      setPersistence(statusResult.data);
    }

    setLoading(false);
  }, [dataSource]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    async function loadRecommendation() {
      if (!selectedId || dataSource !== "api") {
        setRecommendation(null);
        return;
      }

      const result = await fetchNecromancerCandidate(selectedId);
      if (result.ok) {
        setRecommendation(result.data.recommendation);
      } else {
        setRecommendation(null);
      }
    }

    void loadRecommendation();
  }, [selectedId, dataSource]);

  const selected = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedId) ?? null,
    [candidates, selectedId]
  );

  async function runAction(
    label: string,
    action: "prepare" | "pause" | "retire" | "protect"
  ) {
    if (!selectedId) return;

    setActionError(null);
    setActionMessage(null);

    if (action !== "prepare" && (!approved || !operatorId.trim())) {
      setActionError("Operator approval and ID are required.");
      return;
    }

    if (action === "prepare") {
      const result = await prepareNecromancerCandidate(selectedId);
      if (!result.ok) {
        setActionError(result.message);
        return;
      }
      setRecommendation(result.data.recommendation);
      setActionMessage(`${label} succeeded`);
      await refresh();
      return;
    }

    const result = await runNecromancerCandidateAction(selectedId, action, {
      approved: true,
      operatorId: operatorId.trim(),
      evidenceId: evidenceId.trim() || undefined
    });

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setActionMessage(`${label} succeeded`);
    await refresh();
  }

  return (
    <section className="card" aria-label="Necromancer operator panel">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="panel-title">Necromancer Operator</h3>
          <p className="text-sm text-textSecondary">
            Review stale, failed, or orphaned agents, tasks, and work packets.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="badge bg-amber-500/15 text-amber-200">Approval required</span>
          {persistence ? (
            <span className={`badge ${persistence.durable ? "bg-emerald-500/15 text-emerald-200" : "bg-slate-500/15 text-slate-200"}`}>
              {persistence.durable ? "Durable Postgres" : "Memory demo"}
            </span>
          ) : null}
        </div>
      </div>

      <p className="mb-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
        No autonomous cleanup or destructive delete. Necromancer never deletes data, runs shell, or invokes Cursor CLI.
      </p>

      {loading ? <p className="text-sm text-textSecondary">Loading candidates…</p> : null}
      {loadError ? <p className="text-sm text-rose-300">{loadError}</p> : null}
      {actionError ? <p className="text-sm text-rose-300">{actionError}</p> : null}
      {actionMessage ? <p className="text-sm text-emerald-300">{actionMessage}</p> : null}

      {!loading && !loadError && candidates.length === 0 ? (
        <p className="text-sm text-textSecondary">
          No Necromancer candidates detected. Stale, failed, orphaned, or blocked items will appear here when
          present.
        </p>
      ) : null}

      {candidates.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Candidates</h4>
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                className={`w-full rounded-lg border p-3 text-left ${
                  selectedId === candidate.id ? "border-accent bg-accent/10" : "border-border/70 bg-surface"
                }`}
                onClick={() => setSelectedId(candidate.id)}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-medium">{candidate.title}</span>
                  <span className={`badge ${riskBadgeClass(candidate.riskLevel)}`}>{candidate.riskLevel}</span>
                </div>
                <p className="text-xs text-textSecondary">
                  {candidate.kind} · {candidate.classification} · {candidate.currentStatus}
                </p>
                {candidate.protected ? (
                  <p className="mt-1 text-xs text-emerald-200">Protected (durable registry)</p>
                ) : null}
                {candidate.sideProjectBlocked ? (
                  <p className="mt-1 text-xs text-amber-200">Side-project scope blocked</p>
                ) : null}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {selected ? (
              <>
                <h4 className="text-sm font-semibold">Recommendation</h4>
                <p className="text-sm text-textSecondary">{selected.reason}</p>
                {recommendation ? (
                  <p className="rounded-md border border-border/70 bg-surface p-3 text-sm">
                    {recommendation.recommendation}
                  </p>
                ) : null}
                {selected.realmId ? (
                  <p className="text-xs text-textSecondary">Realm: {selected.realmId}</p>
                ) : null}
                {selected.repositoryId ? (
                  <p className="text-xs text-textSecondary">Repository: {selected.repositoryId}</p>
                ) : null}

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={approved}
                    onChange={(event) => setApproved(event.target.checked)}
                  />
                  I approve this Necromancer action
                </label>
                <label className="block text-sm">
                  Operator ID
                  <input
                    className="mt-1 w-full rounded-md border border-border/70 bg-surface px-2 py-1"
                    value={operatorId}
                    onChange={(event) => setOperatorId(event.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  Verification evidence ID (optional)
                  <input
                    className="mt-1 w-full rounded-md border border-border/70 bg-surface px-2 py-1 font-mono text-xs"
                    value={evidenceId}
                    onChange={(event) => setEvidenceId(event.target.value)}
                    placeholder="Link 0.33 evidence record"
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-secondary" onClick={() => void runAction("Prepare", "prepare")}>
                    Prepare
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={selected.protected || selected.sideProjectBlocked}
                    onClick={() => void runAction("Pause", "pause")}
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={selected.protected || selected.sideProjectBlocked}
                    onClick={() => void runAction("Retire", "retire")}
                  >
                    Retire
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => void runAction("Protect", "protect")}>
                    Protect
                  </button>
                </div>
              </>
            ) : null}

            {actions.length > 0 ? (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Recent actions (persisted)</h4>
                <ul className="space-y-1 text-xs text-textSecondary">
                  {actions.slice(0, 5).map((item) => (
                    <li key={item.id}>
                      {item.createdAt ?? item.timestamp} · {item.action} · {item.outcome} · {item.summary}
                      {item.evidenceId ? ` · evidence:${item.evidenceId}` : ""}
                      {item.evidenceStatus ? ` (${item.evidenceStatus})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
