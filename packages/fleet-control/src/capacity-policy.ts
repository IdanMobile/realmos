import type { FleetCapacityPolicy } from "@realmos/contracts";
import { nowIso } from "./id";

export function createDefaultFleetCapacityPolicy(
  patch: Partial<FleetCapacityPolicy> = {}
): FleetCapacityPolicy {
  const timestamp = nowIso();
  return {
    id: "fleet_policy_default",
    maxConcurrentRuns: 4,
    maxConcurrentRunsPerBusiness: 3,
    maxConcurrentRunsPerLane: {
      backend: 2,
      frontend: 2,
      qa: 1,
      governance: 1,
      docs: 2
    },
    maxCostPerHourUsd: 5,
    maxTokensPerHour: 500_000,
    requireApprovalAboveRisk: "medium",
    createdAt: timestamp,
    updatedAt: timestamp,
    ...patch
  };
}
