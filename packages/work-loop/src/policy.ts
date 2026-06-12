import type { ContinuousWorkPolicy } from "@realmos/contracts";
import { nowIso } from "./id";

export function createDefaultContinuousWorkPolicy(
  patch: Partial<ContinuousWorkPolicy> = {}
): ContinuousWorkPolicy {
  const timestamp = nowIso();
  return {
    id: "policy_default",
    autonomyLevel: "auto_prepare",
    safeWorkEnabled: true,
    maxRiskWithoutApproval: "low",
    requireApprovalForCost: true,
    requireApprovalForExternalActions: true,
    requireApprovalForDestructiveActions: true,
    requireStopCheckBeforePhaseAdvance: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...patch
  };
}
