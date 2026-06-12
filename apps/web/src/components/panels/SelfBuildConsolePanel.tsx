import type {
  ContinuousWorkPolicy,
  CursorCompletionReport,
  CursorWorkPacket,
  NextBestWorkDecision,
  WorkItem
} from "@realmos/contracts";

export type WorkLoopConsoleData = {
  policy: ContinuousWorkPolicy;
  workItems: WorkItem[];
  cursorWorkPackets: CursorWorkPacket[];
  cursorCompletionReports: CursorCompletionReport[];
  latestDecision: NextBestWorkDecision | null;
  pendingHumanItems: WorkItem[];
};

export function SelfBuildConsolePanel({
  policy,
  workItems,
  cursorWorkPackets,
  latestDecision,
  pendingHumanItems
}: WorkLoopConsoleData) {
  return (
    <section className="card lg:col-span-2" aria-label="Self-build console panel">
      <h3 className="panel-title">Self-Build Console</h3>
      <p className="mb-3 text-sm text-textSecondary">
        Autonomy: <span className="badge bg-slate-500/15 text-slate-200">{policy.autonomyLevel}</span>
        {policy.safeWorkEnabled ? (
          <span className="ml-2 badge bg-emerald-500/15 text-emerald-200">Safe work on</span>
        ) : (
          <span className="ml-2 badge bg-amber-500/15 text-amber-200">Safe work paused</span>
        )}
      </p>

      <div className="mb-4">
        <h4 className="mb-2 text-sm font-semibold">Next best work</h4>
        {!latestDecision ? (
          <p className="text-sm text-textSecondary">No decision yet. POST /api/work-loop/next-best</p>
        ) : (
          <article className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{latestDecision.decision}</span>
              <span className="badge bg-cyan-500/15 text-cyan-200">{latestDecision.selectedWorkItemId ?? "none"}</span>
            </div>
            <p className="mt-1 text-textSecondary">{latestDecision.rationale}</p>
          </article>
        )}
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold">Work queue</h4>
          <ul className="space-y-2">
            {workItems.slice(0, 6).map((item) => (
              <li key={item.id} className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{item.title}</span>
                  <span className="badge bg-slate-500/15 text-slate-200">{item.status}</span>
                </div>
                <p className="mt-1 text-textSecondary">
                  {item.executionMode} · risk {item.riskLevel}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">Cursor packets</h4>
          {cursorWorkPackets.length === 0 ? (
            <p className="text-sm text-textSecondary">No packets generated yet.</p>
          ) : (
            <ul className="space-y-2">
              {cursorWorkPackets.slice(0, 4).map((packet) => (
                <li key={packet.id} className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{packet.title}</span>
                    <span className="badge bg-violet-500/15 text-violet-200">{packet.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {pendingHumanItems.length > 0 ? (
        <div>
          <h4 className="mb-2 text-sm font-semibold">Needs operator</h4>
          <ul className="space-y-2">
            {pendingHumanItems.map((item) => (
              <li key={item.id} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
