import type {
  CoordinationMode,
  Fleet,
  FleetCapacityPolicy,
  FleetRun,
  ParallelWorkPlan,
  WorkConflict
} from "@realmos/contracts";
import { evaluateFleetCapacity, countPlannableRuns } from "./capacity-evaluator";
import { detectWorkConflicts, hasBlockingConflicts } from "./conflict-detection";
import { assignFleetLane, type FleetPlanWorkItem } from "./lane-assignment";
import { makeFleetId, nowIso } from "./id";

export type BuildParallelWorkPlanInput = {
  fleet: Fleet;
  policy: FleetCapacityPolicy;
  title: string;
  items: FleetPlanWorkItem[];
  existingRuns?: FleetRun[];
  dependencyEdges?: Array<{ fromWorkItemId: string; toWorkItemId: string }>;
};

export type FleetPlanResult = {
  plan: ParallelWorkPlan;
  proposedRuns: FleetRun[];
  conflicts: WorkConflict[];
  coordinationMode: CoordinationMode;
  capacityAllowed: boolean;
  executionBlocked: boolean;
  blockReason?: string;
};

function resolveCoordinationMode(
  conflicts: WorkConflict[],
  capacityAllowed: boolean,
  items: FleetPlanWorkItem[]
): CoordinationMode {
  if (!capacityAllowed || hasBlockingConflicts(conflicts)) return "serial";
  if (items.length <= 1) return "serial";
  return "parallel";
}

function requiresApproval(items: FleetPlanWorkItem[], policy: FleetCapacityPolicy): boolean {
  const riskRank = { low: 1, medium: 2, high: 3, critical: 4 };
  const threshold = riskRank[policy.requireApprovalAboveRisk];
  return items.some(
    (item) =>
      riskRank[item.workItem.riskLevel] >= threshold ||
      item.workItem.requiredApproval ||
      item.workItem.stopCheckRequired
  );
}

export function buildParallelWorkPlan(input: BuildParallelWorkPlanInput): FleetPlanResult {
  const timestamp = nowIso();
  const existingRuns = input.existingRuns ?? [];
  const conflicts = detectWorkConflicts(input.items);
  const capacityCheck = countPlannableRuns({
    policy: input.policy,
    existingRuns,
    proposedCount: input.items.length
  });

  const coordinationMode = resolveCoordinationMode(
    conflicts,
    capacityCheck.allowed,
    input.items
  );

  const executionBlocked =
    hasBlockingConflicts(conflicts) ||
    !capacityCheck.allowed ||
    coordinationMode === "serial";

  const plan: ParallelWorkPlan = {
    id: makeFleetId("plan"),
    title: input.title,
    businessId: input.fleet.businessId,
    fleetId: input.fleet.id,
    coordinationMode,
    workItemIds: input.items.map((item) => item.workItem.id),
    dependencyEdges: input.dependencyEdges ?? [],
    conflictIds: conflicts.map((conflict) => conflict.id),
    approvalRequired: requiresApproval(input.items, input.policy),
    rationale: executionBlocked
      ? "Unsafe parallel execution blocked; serialize or resolve conflicts first."
      : "Parallel plan is safe under current capacity and conflict checks.",
    createdAt: timestamp
  };

  const withLanes = input.items.map((item) => ({
    item,
    lane: assignFleetLane(item)
  }));

  const proposedRuns: FleetRun[] = [];
  for (const { item, lane } of withLanes) {
    const laneCapacity = evaluateFleetCapacity({
      policy: input.policy,
      existingRuns: [...existingRuns, ...proposedRuns],
      proposedLane: lane,
      businessId: input.fleet.businessId
    });

    const itemConflicts = conflicts.filter((conflict) =>
      conflict.workItemIds.includes(item.workItem.id)
    );

    proposedRuns.push({
      id: makeFleetId("fleet_run"),
      fleetId: input.fleet.id,
      workItemId: item.workItem.id,
      lane,
      coordinationMode,
      status: executionBlocked || !laneCapacity.allowed ? "blocked" : "queued",
      assignedAgentIds: item.workItem.assignedAgentId ? [item.workItem.assignedAgentId] : [],
      conflicts: itemConflicts,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }

  return {
    plan,
    proposedRuns,
    conflicts,
    coordinationMode,
    capacityAllowed: capacityCheck.allowed,
    executionBlocked,
    blockReason: executionBlocked
      ? capacityCheck.allowed
        ? "Conflicts require serialization before parallel execution."
        : capacityCheck.reason
      : undefined
  };
}

export function registerPlannedRuns(runs: FleetRun[]): FleetRun[] {
  return runs.map((run) => ({
    ...run,
    status: run.status === "queued" ? "ready" : run.status,
    updatedAt: nowIso()
  }));
}
