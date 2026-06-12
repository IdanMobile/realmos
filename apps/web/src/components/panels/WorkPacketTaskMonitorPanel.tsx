"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LocalExecutorDispatch, WorkPacketLifecycle } from "@realmos/contracts";
import { fetchExecutorBridgeStatus, fetchExecutorDispatches } from "@/lib/api/executor-bridge";
import type { HealthReport } from "@/lib/api/fetchHealth";
import {
  approveLifecyclePacket,
  attachLifecycleVerification,
  closeLifecyclePacket,
  dispatchLifecyclePacket,
  fetchLifecyclePackets,
  markLifecyclePacketReady,
  recordLifecyclePacketResult
} from "@/lib/api/work-packet-lifecycle";
import {
  availableLifecycleActions,
  filterMonitorPackets,
  LIFECYCLE_SAFETY_FLAGS,
  summarizeLifecyclePackets
} from "@/lib/lifecycle/mappers";

type WorkPacketTaskMonitorPanelProps = {
  dataSource: "api" | "mock";
  health?: HealthReport | null;
};

function statusBadgeClass(status: string): string {
  if (["completed", "verified", "approved"].includes(status)) {
    return "bg-emerald-500/15 text-emerald-200";
  }
  if (["failed", "blocked", "cancelled"].includes(status)) {
    return "bg-rose-500/15 text-rose-200";
  }
  if (["ready_for_approval", "verification_pending"].includes(status)) {
    return "bg-amber-500/15 text-amber-200";
  }
  return "bg-slate-500/15 text-slate-200";
}

export function WorkPacketTaskMonitorPanel({ dataSource, health }: WorkPacketTaskMonitorPanelProps) {
  const [packets, setPackets] = useState<WorkPacketLifecycle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [executorStatus, setExecutorStatus] = useState<Awaited<ReturnType<typeof fetchExecutorBridgeStatus>>>(null);
  const [dispatches, setDispatches] = useState<LocalExecutorDispatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [resultSummary, setResultSummary] = useState("");
  const [verifyOutput, setVerifyOutput] = useState("");
  const [verifyArtifacts, setVerifyArtifacts] = useState("");

  const refresh = useCallback(async () => {
    if (dataSource !== "api") {
      setLoadError("Lifecycle monitor requires live API. Start API on :4100.");
      setPackets([]);
      setExecutorStatus(null);
      setDispatches([]);
      return;
    }

    setLoading(true);
    setLoadError(null);

    const [packetResult, execStatus, execDispatches] = await Promise.all([
      fetchLifecyclePackets(),
      fetchExecutorBridgeStatus(),
      fetchExecutorDispatches()
    ]);

    if (!packetResult.ok) {
      setLoadError(packetResult.message);
      setPackets([]);
    } else {
      setPackets(packetResult.data);
      setSelectedId((current) => current ?? packetResult.data[0]?.id ?? null);
    }

    setExecutorStatus(execStatus);
    setDispatches(execDispatches);
    setLoading(false);
  }, [dataSource]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary = useMemo(() => summarizeLifecyclePackets(packets), [packets]);
  const monitorGroups = useMemo(() => filterMonitorPackets(packets), [packets]);
  const selected = packets.find((packet) => packet.id === selectedId) ?? null;
  const linkedDispatch =
    selected?.dispatchId != null
      ? dispatches.find((dispatch) => dispatch.id === selected.dispatchId) ?? null
      : null;

  async function runAction(label: string, action: () => Promise<{ ok: boolean; message?: string }>) {
    setActionError(null);
    setActionMessage(null);
    const result = await action();
    if (!result.ok) {
      setActionError(result.message ?? `${label} failed`);
      return;
    }
    setActionMessage(`${label} succeeded`);
    await refresh();
  }

  const healthLifecycle = health?.checks.lifecycle;

  return (
    <section className="card lg:col-span-2" aria-label="Work packet task monitor panel">
      <h3 className="panel-title">Work Packet Task Approval + Run Monitor</h3>

      <div className="mb-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 text-xs text-textSecondary">
        <p className="font-semibold text-textPrimary">Dry-run only · No shell execution · Cursor CLI not invoked</p>
        <p className="mt-1">
          Human approval required before dispatch. GUING and side projects blocked.{" "}
          <span className="font-mono">shellExecution={String(LIFECYCLE_SAFETY_FLAGS.shellExecution)}</span> ·{" "}
          <span className="font-mono">automaticExecution={String(LIFECYCLE_SAFETY_FLAGS.automaticExecution)}</span>
        </p>
      </div>

      {dataSource === "mock" ? (
        <p className="mb-3 text-sm text-amber-200" role="alert">
          Mock data mode — lifecycle actions disabled. Set <code className="text-xs">NEXT_PUBLIC_API_BASE_URL</code> and
          run the API for live packet management.
        </p>
      ) : null}

      {loading ? <p className="text-sm text-textSecondary">Loading lifecycle packets…</p> : null}
      {loadError ? (
        <p className="mb-3 text-sm text-rose-200" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Total packets</p>
          <p className="text-lg font-semibold">{healthLifecycle?.totalCount ?? summary.totalCount}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Awaiting approval</p>
          <p className="text-lg font-semibold">{healthLifecycle?.approvalNeededCount ?? summary.approvalNeededCount}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Awaiting result</p>
          <p className="text-lg font-semibold">{healthLifecycle?.awaitingResultCount ?? summary.awaitingResultCount}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Verification pending</p>
          <p className="text-lg font-semibold">
            {healthLifecycle?.verificationPendingCount ?? summary.verificationPendingCount}
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-border/70 bg-surface p-3">
        <h4 className="mb-2 text-sm font-semibold">Run monitor (dry-run queue)</h4>
        {executorStatus ? (
          <ul className="space-y-1 text-xs text-textSecondary">
            <li>
              Executor bridge:{" "}
              <span className="badge bg-emerald-500/15 text-emerald-200">{executorStatus.mode}</span> · queue{" "}
              {executorStatus.queueRoot}
            </li>
            <li>
              Queued {executorStatus.queuedCount} · Dispatched {executorStatus.dispatchedCount} · Running{" "}
              {executorStatus.runningCount} · Completed {executorStatus.completedCount}
            </li>
            {executorStatus.lastDispatch ? (
              <li>
                Latest dispatch: {executorStatus.lastDispatch.id} ({executorStatus.lastDispatch.status})
                {executorStatus.lastDispatch.queueArtifactPath
                  ? ` · artifact ${executorStatus.lastDispatch.queueArtifactPath}`
                  : null}
              </li>
            ) : (
              <li>No executor dispatches yet.</li>
            )}
          </ul>
        ) : (
          <p className="text-xs text-textSecondary">Executor status unavailable.</p>
        )}
        {monitorGroups.awaitingResult.length > 0 ? (
          <p className="mt-2 text-xs text-textSecondary">
            Packets awaiting operator result: {monitorGroups.awaitingResult.map((p) => p.id).join(", ")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold">Lifecycle packets</h4>
          {packets.length === 0 ? (
            <p className="text-sm text-textSecondary">No work packets yet. Create via POST /api/lifecycle/packets.</p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {packets.map((packet) => (
                <li key={packet.id}>
                  <button
                    type="button"
                    className={`w-full rounded-lg border p-3 text-left text-sm ${
                      selectedId === packet.id ? "border-cyan-500/50 bg-cyan-500/5" : "border-border/70 bg-surface"
                    }`}
                    onClick={() => setSelectedId(packet.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{packet.objective}</span>
                      <span className={`badge ${statusBadgeClass(packet.status)}`}>{packet.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-textSecondary">
                      {packet.realmId} · {packet.repositoryId}
                      {packet.dispatchId ? ` · dispatch ${packet.dispatchId}` : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Packet detail</h4>
          {!selected ? (
            <p className="text-sm text-textSecondary">Select a packet to view details and operator actions.</p>
          ) : (
            <article className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={`badge ${statusBadgeClass(selected.status)}`}>{selected.status}</span>
                {selected.handoffRequired ? (
                  <span className="badge bg-violet-500/15 text-violet-200">
                    handoff {selected.handoffUpdated ? "updated" : "required"}
                  </span>
                ) : null}
                {selected.verificationStatus ? (
                  <span className="badge bg-slate-500/15 text-slate-200">verify {selected.verificationStatus}</span>
                ) : null}
              </div>

              <p className="font-semibold">{selected.objective}</p>
              <p className="mt-2 text-textSecondary">{selected.instructions}</p>

              <dl className="mt-3 space-y-1 text-xs text-textSecondary">
                <div>
                  <dt className="inline font-semibold text-textPrimary">Repository boundary: </dt>
                  <dd className="inline">
                    {selected.realmId} / {selected.repositoryId}
                  </dd>
                </div>
                {selected.branchTarget ? (
                  <div>
                    <dt className="inline font-semibold text-textPrimary">Branch: </dt>
                    <dd className="inline">{selected.branchTarget}</dd>
                  </div>
                ) : null}
                {selected.dispatchId ? (
                  <div>
                    <dt className="inline font-semibold text-textPrimary">Dispatch ID: </dt>
                    <dd className="inline">{selected.dispatchId}</dd>
                  </div>
                ) : null}
                {linkedDispatch?.queueArtifactPath ? (
                  <div>
                    <dt className="inline font-semibold text-textPrimary">Queue artifact: </dt>
                    <dd className="inline font-mono">{linkedDispatch.queueArtifactPath}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-3">
                <p className="text-xs font-semibold">Allowed paths</p>
                <p className="text-xs text-textSecondary">{selected.allowedPaths.join(", ")}</p>
                <p className="mt-1 text-xs font-semibold">Forbidden paths</p>
                <p className="text-xs text-textSecondary">{selected.forbiddenPaths.join(", ")}</p>
                <p className="mt-1 text-xs font-semibold">Verification commands</p>
                <p className="text-xs text-textSecondary">{selected.verificationCommands.join(" · ")}</p>
              </div>

              {selected.auditEvents.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-semibold">Audit events</p>
                  <ul className="mt-1 max-h-24 space-y-1 overflow-y-auto text-xs text-textSecondary">
                    {selected.auditEvents.slice(-5).map((event, index) => (
                      <li key={`${event.timestamp}-${index}`}>
                        {event.eventType}: {event.summary}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {actionError ? (
                <p className="mt-3 text-xs text-rose-200" role="alert">
                  {actionError}
                </p>
              ) : null}
              {actionMessage ? <p className="mt-3 text-xs text-emerald-200">{actionMessage}</p> : null}

              {dataSource === "api" ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold">Operator actions</p>
                  <div className="flex flex-wrap gap-2">
                    {availableLifecycleActions(selected.status).includes("markReady") ? (
                      <button
                        type="button"
                        className="rounded-lg border border-border px-2 py-1 text-xs"
                        onClick={() =>
                          void runAction("Mark ready", async () => {
                            const result = await markLifecyclePacketReady(selected.id);
                            return result.ok
                              ? { ok: true }
                              : { ok: false, message: result.message };
                          })
                        }
                      >
                        Mark ready
                      </button>
                    ) : null}
                    {availableLifecycleActions(selected.status).includes("approve") ? (
                      <button
                        type="button"
                        className="rounded-lg bg-emerald-600/80 px-2 py-1 text-xs font-medium text-white"
                        onClick={() =>
                          void runAction("Approve", async () => {
                            const result = await approveLifecyclePacket(selected.id);
                            return result.ok ? { ok: true } : { ok: false, message: result.message };
                          })
                        }
                      >
                        Approve
                      </button>
                    ) : null}
                    {availableLifecycleActions(selected.status).includes("dispatch") ? (
                      <button
                        type="button"
                        className="rounded-lg bg-cyan-600/80 px-2 py-1 text-xs font-medium text-white"
                        onClick={() =>
                          void runAction("Dispatch (dry-run queue)", async () => {
                            const result = await dispatchLifecyclePacket(selected.id);
                            return result.ok ? { ok: true } : { ok: false, message: result.message };
                          })
                        }
                      >
                        Dispatch (dry-run)
                      </button>
                    ) : null}
                  </div>

                  {availableLifecycleActions(selected.status).includes("recordResult") ? (
                    <div className="rounded-lg border border-border/70 p-2">
                      <p className="mb-1 text-xs font-semibold">Record result (manual)</p>
                      <input
                        className="mb-2 w-full rounded border border-border bg-background px-2 py-1 text-xs"
                        placeholder="Result summary"
                        value={resultSummary}
                        onChange={(event) => setResultSummary(event.target.value)}
                      />
                      <div className="flex flex-wrap gap-2">
                        {(["completed", "running", "failed", "blocked"] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            className="rounded-lg border border-border px-2 py-1 text-xs"
                            onClick={() =>
                              void runAction(`Record ${status}`, async () => {
                                const result = await recordLifecyclePacketResult(selected.id, {
                                  status,
                                  resultSummary: resultSummary || undefined
                                });
                                return result.ok ? { ok: true } : { ok: false, message: result.message };
                              })
                            }
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {availableLifecycleActions(selected.status).includes("attachVerification") ? (
                    <div className="rounded-lg border border-border/70 p-2">
                      <p className="mb-1 text-xs font-semibold">Attach verification (reported)</p>
                      <input
                        className="mb-1 w-full rounded border border-border bg-background px-2 py-1 text-xs"
                        placeholder="Output summary"
                        value={verifyOutput}
                        onChange={(event) => setVerifyOutput(event.target.value)}
                      />
                      <input
                        className="mb-2 w-full rounded border border-border bg-background px-2 py-1 text-xs"
                        placeholder="Artifacts summary"
                        value={verifyArtifacts}
                        onChange={(event) => setVerifyArtifacts(event.target.value)}
                      />
                      <div className="flex flex-wrap gap-2">
                        {(["pass", "fail", "blocked"] as const).map((reportedStatus) => (
                          <button
                            key={reportedStatus}
                            type="button"
                            className="rounded-lg border border-border px-2 py-1 text-xs"
                            onClick={() =>
                              void runAction(`Verification ${reportedStatus}`, async () => {
                                if (!verifyOutput.trim() || !verifyArtifacts.trim()) {
                                  return { ok: false, message: "Output and artifacts summaries required." };
                                }
                                const result = await attachLifecycleVerification(selected.id, {
                                  reportedStatus,
                                  outputSummary: verifyOutput,
                                  artifactsSummary: verifyArtifacts
                                });
                                return result.ok ? { ok: true } : { ok: false, message: result.message };
                              })
                            }
                          >
                            {reportedStatus}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {availableLifecycleActions(selected.status).includes("closeCompleted") ? (
                      <button
                        type="button"
                        className="rounded-lg border border-emerald-500/40 px-2 py-1 text-xs"
                        onClick={() =>
                          void runAction("Close completed", async () => {
                            const result = await closeLifecyclePacket(selected.id, {
                              status: "completed",
                              handoffUpdated: selected.handoffRequired
                            });
                            return result.ok ? { ok: true } : { ok: false, message: result.message };
                          })
                        }
                      >
                        Close completed
                      </button>
                    ) : null}
                    {availableLifecycleActions(selected.status).includes("closeFailed") ? (
                      <button
                        type="button"
                        className="rounded-lg border border-rose-500/40 px-2 py-1 text-xs"
                        onClick={() =>
                          void runAction("Close failed", async () => {
                            const result = await closeLifecyclePacket(selected.id, { status: "failed" });
                            return result.ok ? { ok: true } : { ok: false, message: result.message };
                          })
                        }
                      >
                        Close failed
                      </button>
                    ) : null}
                    {availableLifecycleActions(selected.status).includes("closeBlocked") ? (
                      <button
                        type="button"
                        className="rounded-lg border border-amber-500/40 px-2 py-1 text-xs"
                        onClick={() =>
                          void runAction("Close blocked", async () => {
                            const result = await closeLifecyclePacket(selected.id, { status: "blocked" });
                            return result.ok ? { ok: true } : { ok: false, message: result.message };
                          })
                        }
                      >
                        Close blocked
                      </button>
                    ) : null}
                    {availableLifecycleActions(selected.status).includes("closeCancelled") ? (
                      <button
                        type="button"
                        className="rounded-lg border border-border px-2 py-1 text-xs"
                        onClick={() =>
                          void runAction("Cancel", async () => {
                            const result = await closeLifecyclePacket(selected.id, { status: "cancelled" });
                            return result.ok ? { ok: true } : { ok: false, message: result.message };
                          })
                        }
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
