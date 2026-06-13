"use client";

import { useCallback, useEffect, useState } from "react";
import type { VerificationEvidenceSummary, VerificationGateStatus } from "@realmos/contracts";
import {
  attachCiVerificationEvidence,
  attachVerificationEvidence,
  fetchVerificationEvidenceSummary
} from "@/lib/api/verification-evidence";

type VerificationEvidencePanelProps = {
  dataSource: "api" | "mock";
  initiativeId?: string;
  workPacketId?: string | null;
  runStateId?: string | null;
};

function gateBadgeClass(status: VerificationGateStatus["status"]): string {
  if (status === "pass_with_evidence") return "bg-emerald-500/15 text-emerald-200";
  if (status === "fail_with_evidence") return "bg-rose-500/15 text-rose-200";
  if (status === "pass_reported_missing_evidence") return "bg-amber-500/15 text-amber-200";
  if (status === "manual_only") return "bg-slate-500/15 text-slate-200";
  return "bg-slate-500/15 text-slate-300";
}

function formatGateStatus(status: VerificationGateStatus["status"]): string {
  return status.replaceAll("_", " ");
}

export function VerificationEvidencePanel({
  dataSource,
  initiativeId = "0.33",
  workPacketId,
  runStateId
}: VerificationEvidencePanelProps) {
  const [summary, setSummary] = useState<VerificationEvidenceSummary | null>(null);
  const [selectedGateId, setSelectedGateId] = useState("pnpm_test");
  const [outputText, setOutputText] = useState("");
  const [ciRunUrl, setCiRunUrl] = useState("");
  const [commitSha, setCommitSha] = useState("");
  const [operatorId, setOperatorId] = useState("operator");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (dataSource !== "api") {
      setLoadError("Verification evidence requires live API.");
      setSummary(null);
      return;
    }

    if (!workPacketId && !runStateId) {
      setLoadError("Select a lifecycle packet or run state to attach evidence.");
      setSummary(null);
      return;
    }

    setLoading(true);
    setLoadError(null);

    const result = await fetchVerificationEvidenceSummary({
      initiativeId,
      workPacketId: workPacketId ?? undefined,
      runStateId: runStateId ?? undefined
    });

    if (!result.ok) {
      setLoadError(result.message);
      setSummary(null);
    } else {
      setSummary(result.data);
    }

    setLoading(false);
  }, [dataSource, initiativeId, workPacketId, runStateId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function submitOutputEvidence() {
    if (!workPacketId && !runStateId) return;

    setActionError(null);
    setActionMessage(null);

    const result = await attachVerificationEvidence({
      workPacketId: workPacketId ?? undefined,
      runStateId: runStateId ?? undefined,
      initiativeId,
      gateId: selectedGateId,
      commandName: selectedGateId,
      expectedCommand: summary?.gates.find((gate) => gate.gateId === selectedGateId)?.expectedCommand,
      reportedStatus: "pass",
      outputText,
      environment: "local",
      operatorId: operatorId.trim()
    });

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setActionMessage(`Evidence attached for ${selectedGateId}`);
    setOutputText("");
    setSummary(result.data.summary);
    await refresh();
  }

  async function submitCiEvidence() {
    if (!workPacketId && !runStateId) return;

    setActionError(null);
    setActionMessage(null);

    const result = await attachCiVerificationEvidence({
      workPacketId: workPacketId ?? undefined,
      runStateId: runStateId ?? undefined,
      initiativeId,
      gateId: selectedGateId,
      ciRunUrl: ciRunUrl.trim(),
      commitSha: commitSha.trim() || undefined,
      operatorId: operatorId.trim()
    });

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    setActionMessage(`CI evidence linked for ${selectedGateId}`);
    setCiRunUrl("");
    setSummary(result.data.summary);
    await refresh();
  }

  return (
    <section className="card" aria-label="Verification evidence panel">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="panel-title">Verification Evidence</h3>
          <p className="text-sm text-textSecondary">
            Attach command output or CI metadata. No automatic shell execution.
          </p>
        </div>
        {summary ? (
          <span className={`badge ${gateBadgeClass(summary.overallStatus === "partial" ? "not_run" : summary.overallStatus)}`}>
            {formatGateStatus(summary.overallStatus === "partial" ? "not_run" : summary.overallStatus)}
          </span>
        ) : null}
      </div>

      <p className="mb-3 rounded-md border border-border/70 bg-surface px-3 py-2 text-xs text-textSecondary">
        Evidence is operator-provided or CI-linked only. Secrets are redacted or blocked before storage.
      </p>

      {loading ? <p className="text-sm text-textSecondary">Loading evidence summary…</p> : null}
      {loadError ? <p className="text-sm text-rose-300">{loadError}</p> : null}
      {actionError ? <p className="text-sm text-rose-300">{actionError}</p> : null}
      {actionMessage ? <p className="text-sm text-emerald-300">{actionMessage}</p> : null}

      {summary ? (
        <div className="mb-4 space-y-2">
          <p className="text-xs text-textSecondary">
            Attached {summary.attachedCount} gate(s). Missing required:{" "}
            {summary.missingRequiredGateIds.length ? summary.missingRequiredGateIds.join(", ") : "none"}
          </p>
          <ul className="space-y-1">
            {summary.gates.map((gate) => (
              <li key={gate.gateId} className="flex items-center justify-between gap-2 rounded border border-border/60 px-2 py-1 text-xs">
                <span>{gate.label}</span>
                <span className={`badge ${gateBadgeClass(gate.status)}`}>{formatGateStatus(gate.status)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {dataSource === "api" && (workPacketId || runStateId) ? (
        <div className="space-y-3 border-t border-border/60 pt-3">
          <label className="block text-sm">
            Gate
            <select
              className="mt-1 w-full rounded-md border border-border/70 bg-surface px-2 py-1"
              value={selectedGateId}
              onChange={(event) => setSelectedGateId(event.target.value)}
            >
              {(summary?.gates ?? [{ gateId: "pnpm_test", label: "pnpm test", expectedCommand: "pnpm test", required: true, status: "not_run", evidenceIds: [] }]).map(
                (gate) => (
                  <option key={gate.gateId} value={gate.gateId}>
                    {gate.label}
                  </option>
                )
              )}
            </select>
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
            Paste command output (redacted before save)
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-border/70 bg-surface px-2 py-1 font-mono text-xs"
              value={outputText}
              onChange={(event) => setOutputText(event.target.value)}
              placeholder="Paste pnpm test output summary..."
            />
          </label>

          <button type="button" className="btn-secondary" onClick={() => void submitOutputEvidence()}>
            Attach output evidence
          </button>

          <label className="block text-sm">
            CI run URL
            <input
              className="mt-1 w-full rounded-md border border-border/70 bg-surface px-2 py-1"
              value={ciRunUrl}
              onChange={(event) => setCiRunUrl(event.target.value)}
              placeholder="https://github.com/.../actions/runs/..."
            />
          </label>

          <label className="block text-sm">
            Commit SHA (optional)
            <input
              className="mt-1 w-full rounded-md border border-border/70 bg-surface px-2 py-1 font-mono text-xs"
              value={commitSha}
              onChange={(event) => setCommitSha(event.target.value)}
            />
          </label>

          <button type="button" className="btn-secondary" onClick={() => void submitCiEvidence()}>
            Attach CI metadata
          </button>
        </div>
      ) : null}
    </section>
  );
}
