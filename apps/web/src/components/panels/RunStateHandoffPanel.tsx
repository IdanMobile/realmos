"use client";

import { useCallback, useEffect, useState } from "react";
import type { HandoffSummaryObject } from "@realmos/contracts";
import {
  createRunStateFromPacket,
  fetchLatestHandoffSummary,
  fetchRunStateStatus,
  markRunStateHandoffUpdatedApi
} from "@/lib/api/run-state-handoff";

type RunStateHandoffPanelProps = {
  dataSource: "api" | "mock";
  selectedPacketId?: string | null;
};

export function RunStateHandoffPanel({ dataSource, selectedPacketId }: RunStateHandoffPanelProps) {
  const [summary, setSummary] = useState<HandoffSummaryObject | null>(null);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof fetchRunStateStatus>>>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (dataSource !== "api") {
      setSummary(null);
      setStatus(null);
      return;
    }
    setStatus(await fetchRunStateStatus());
    setSummary(await fetchLatestHandoffSummary());
  }, [dataSource]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreateRunState() {
    if (!selectedPacketId) {
      setError("Select a lifecycle packet first.");
      return;
    }
    setError(null);
    setMessage(null);
    const result = await createRunStateFromPacket(selectedPacketId);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setMessage(`Run state ${result.data.id} created.`);
    await refresh();
  }

  async function handleMarkHandoffUpdated() {
    if (!summary?.runStateId) return;
    setError(null);
    const result = await markRunStateHandoffUpdatedApi(summary.runStateId);
    if (!result.ok) {
      setError(result.message ?? "Failed to mark handoff updated.");
      return;
    }
    setMessage("Handoff marked updated.");
    await refresh();
  }

  return (
    <section className="card lg:col-span-2" aria-label="Run state handoff panel">
      <h3 className="panel-title">Self-Handoff / Run State</h3>
      <p className="mb-3 text-xs text-textSecondary">
        Durable handoff stored in operational state — no arbitrary file writes. Cursor CLI not invoked.
      </p>

      {dataSource === "mock" ? (
        <p className="text-sm text-amber-200">Live API required for run-state handoff.</p>
      ) : (
        <>
          <div className="mb-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-border/70 bg-surface p-2 text-xs">
              Run states: {status?.totalCount ?? 0}
            </div>
            <div className="rounded-lg border border-border/70 bg-surface p-2 text-xs">
              Handoff required: {status?.handoffRequiredCount ?? 0}
            </div>
            <div className="rounded-lg border border-border/70 bg-surface p-2 text-xs">
              Handoff updated: {status?.handoffUpdatedCount ?? 0}
            </div>
          </div>

          {summary ? (
            <article className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
              <p className="font-semibold">Latest handoff summary</p>
              <p className="mt-1 text-xs text-textSecondary">
                Run state {summary.runStateId} · packet {summary.sourcePacketId}
                {summary.sourceDispatchId ? ` · dispatch ${summary.sourceDispatchId}` : ""}
              </p>
              <p className="mt-2 text-xs">
                Lifecycle: {summary.lifecycleStatus} · Result: {summary.resultStatus} · Verify:{" "}
                {summary.verificationStatus}
              </p>
              <p className="mt-2 text-xs text-cyan-200">
                Next recommended: {summary.nextRecommendedInitiative}
              </p>
              {summary.knownRisks.length ? (
                <p className="mt-2 text-xs text-amber-200">Risks: {summary.knownRisks.join("; ")}</p>
              ) : null}
              {summary.blockedReasons.length ? (
                <p className="mt-1 text-xs text-rose-200">Blocked: {summary.blockedReasons.join("; ")}</p>
              ) : null}
              <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap text-xs text-textSecondary">
                {summary.handoffTextSummary}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {summary.handoffRequired && !summary.handoffUpdated ? (
                  <button
                    type="button"
                    className="rounded-lg bg-emerald-600/80 px-2 py-1 text-xs font-medium text-white"
                    onClick={() => void handleMarkHandoffUpdated()}
                  >
                    Mark handoff updated
                  </button>
                ) : null}
              </div>
            </article>
          ) : (
            <p className="text-sm text-textSecondary">No run-state handoff recorded yet.</p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-border px-2 py-1 text-xs"
              onClick={() => void handleCreateRunState()}
              disabled={!selectedPacketId}
            >
              Create run state from selected packet
            </button>
          </div>

          {error ? (
            <p className="mt-2 text-xs text-rose-200" role="alert">
              {error}
            </p>
          ) : null}
          {message ? <p className="mt-2 text-xs text-emerald-200">{message}</p> : null}
        </>
      )}
    </section>
  );
}
