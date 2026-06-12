import type {
  Fleet,
  FleetCapacityPolicy,
  FleetRun,
  ParallelWorkPlan,
  Squad,
  WorkConflict
} from "@realmos/contracts";

export type FleetConsoleData = {
  fleet: Fleet;
  capacityPolicy: FleetCapacityPolicy;
  squads: Squad[];
  fleetRuns: FleetRun[];
  parallelWorkPlans: ParallelWorkPlan[];
  workConflicts: WorkConflict[];
  activeRunCount: number;
  latestPlan: ParallelWorkPlan | null;
  executionEnabled: boolean;
};

export function FleetControlPanel({
  fleet,
  capacityPolicy,
  squads,
  fleetRuns,
  parallelWorkPlans,
  workConflicts,
  activeRunCount,
  latestPlan,
  executionEnabled
}: FleetConsoleData) {
  return (
    <section className="card lg:col-span-2" aria-label="Fleet control panel">
      <h3 className="panel-title">Fleet / Swarm Control</h3>
      <p className="mb-3 text-sm text-textSecondary">
        Fleet: <span className="font-medium text-textPrimary">{fleet.name}</span>
        {executionEnabled ? (
          <span className="ml-2 badge bg-rose-500/15 text-rose-200">Execution enabled</span>
        ) : (
          <span className="ml-2 badge bg-amber-500/15 text-amber-200">Planning only</span>
        )}
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Active runs</p>
          <p className="text-lg font-semibold">
            {activeRunCount} / {capacityPolicy.maxConcurrentRuns}
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Squads</p>
          <p className="text-lg font-semibold">{squads.length}</p>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
          <p className="text-textSecondary">Conflicts</p>
          <p className="text-lg font-semibold">{workConflicts.length}</p>
        </div>
      </div>

      {latestPlan ? (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold">Latest parallel plan</h4>
          <article className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{latestPlan.title}</span>
              <span className="badge bg-violet-500/15 text-violet-200">{latestPlan.coordinationMode}</span>
            </div>
            <p className="mt-1 text-textSecondary">{latestPlan.rationale}</p>
            {latestPlan.approvalRequired ? (
              <p className="mt-2 text-amber-200">Approval required before execution.</p>
            ) : null}
          </article>
        </div>
      ) : null}

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold">Squads & lanes</h4>
          <ul className="space-y-2">
            {squads.map((squad) => (
              <li key={squad.id} className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{squad.name}</span>
                  <span className="badge bg-slate-500/15 text-slate-200">{squad.lane}</span>
                </div>
                <p className="mt-1 text-textSecondary">{squad.agentIds.length} agent(s)</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">Fleet runs</h4>
          {fleetRuns.length === 0 ? (
            <p className="text-sm text-textSecondary">No fleet runs planned yet.</p>
          ) : (
            <ul className="space-y-2">
              {fleetRuns.slice(0, 6).map((run) => (
                <li key={run.id} className="rounded-lg border border-border/70 bg-surface p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{run.workItemId}</span>
                    <span className="badge bg-cyan-500/15 text-cyan-200">{run.status}</span>
                  </div>
                  <p className="mt-1 text-textSecondary">
                    {run.lane} · {run.coordinationMode}
                    {run.conflicts.length > 0 ? ` · ${run.conflicts.length} conflict(s)` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {parallelWorkPlans.length > 0 ? (
        <p className="text-xs text-textSecondary">{parallelWorkPlans.length} plan(s) stored · POST /api/fleet/plans/build</p>
      ) : null}
    </section>
  );
}
