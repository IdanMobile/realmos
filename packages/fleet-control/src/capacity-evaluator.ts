import type {
  FleetCapacityPolicy,
  FleetLane,
  FleetRun,
  FleetRunStatus
} from "@realmos/contracts";

export type CapacityEvaluation = {
  allowed: boolean;
  reason: string;
  activeRuns: number;
  laneCounts: Partial<Record<FleetLane, number>>;
};

const ACTIVE_STATUSES: FleetRunStatus[] = ["queued", "ready", "running", "waiting_for_report"];

export function evaluateFleetCapacity(input: {
  policy: FleetCapacityPolicy;
  existingRuns: FleetRun[];
  proposedLane: FleetLane;
  businessId?: string;
}): CapacityEvaluation {
  const activeRuns = input.existingRuns.filter((run) => ACTIVE_STATUSES.includes(run.status));
  const laneCounts: Partial<Record<FleetLane, number>> = {};

  for (const run of activeRuns) {
    laneCounts[run.lane] = (laneCounts[run.lane] ?? 0) + 1;
  }

  if (activeRuns.length >= input.policy.maxConcurrentRuns) {
    return {
      allowed: false,
      reason: `Global concurrent run limit reached (${input.policy.maxConcurrentRuns}).`,
      activeRuns: activeRuns.length,
      laneCounts
    };
  }

  if (input.businessId) {
    const businessRuns = activeRuns.filter((run) => run.fleetId.includes(input.businessId!));
    if (businessRuns.length >= input.policy.maxConcurrentRunsPerBusiness) {
      return {
        allowed: false,
        reason: `Business concurrent run limit reached (${input.policy.maxConcurrentRunsPerBusiness}).`,
        activeRuns: activeRuns.length,
        laneCounts
      };
    }
  }

  const laneLimit = input.policy.maxConcurrentRunsPerLane[input.proposedLane];
  const laneActive = laneCounts[input.proposedLane] ?? 0;
  if (typeof laneLimit === "number" && laneActive >= laneLimit) {
    return {
      allowed: false,
      reason: `Lane ${input.proposedLane} limit reached (${laneLimit}).`,
      activeRuns: activeRuns.length,
      laneCounts
    };
  }

  return {
    allowed: true,
    reason: "Capacity available for planned run.",
    activeRuns: activeRuns.length,
    laneCounts
  };
}

export function countPlannableRuns(input: {
  policy: FleetCapacityPolicy;
  existingRuns: FleetRun[];
  proposedCount: number;
}): { allowed: boolean; maxAdditional: number; reason: string } {
  const activeRuns = input.existingRuns.filter((run) => ACTIVE_STATUSES.includes(run.status));
  const remaining = Math.max(0, input.policy.maxConcurrentRuns - activeRuns.length);

  if (input.proposedCount <= remaining) {
    return {
      allowed: true,
      maxAdditional: remaining,
      reason: "Proposed parallel batch fits capacity."
    };
  }

  return {
    allowed: false,
    maxAdditional: remaining,
    reason: `Only ${remaining} additional run(s) allowed; proposed ${input.proposedCount}.`
  };
}
