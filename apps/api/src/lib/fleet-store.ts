import type {
  Fleet,
  FleetCapacityPolicy,
  FleetRun,
  ParallelWorkPlan,
  Squad,
  WorkConflict
} from "@realmos/contracts";
export { fleetStore } from "./persistence/configure-operational-stores";

export async function buildFleetConsole(db: {
  getFleet(): Promise<Fleet>;
  getCapacityPolicy(): Promise<FleetCapacityPolicy>;
  listSquads(): Promise<Squad[]>;
  listFleetRuns(): Promise<FleetRun[]>;
  listParallelWorkPlans(): Promise<ParallelWorkPlan[]>;
  listWorkConflicts(): Promise<WorkConflict[]>;
}) {
  const [fleet, capacityPolicy, squads, fleetRuns, parallelWorkPlans, workConflicts] =
    await Promise.all([
      db.getFleet(),
      db.getCapacityPolicy(),
      db.listSquads(),
      db.listFleetRuns(),
      db.listParallelWorkPlans(),
      db.listWorkConflicts()
    ]);

  const activeRuns = fleetRuns.filter((run) =>
    ["queued", "ready", "running", "waiting_for_report"].includes(run.status)
  );

  return {
    fleet,
    capacityPolicy,
    squads,
    fleetRuns,
    parallelWorkPlans,
    workConflicts,
    activeRunCount: activeRuns.length,
    latestPlan: parallelWorkPlans.at(-1) ?? null,
    executionEnabled: false
  };
}
