import type { ContinuousWorkPolicy, WorkItem } from "@realmos/contracts";

export type HumanGateResult =
  | { outcome: "allow"; reason: string }
  | { outcome: "pause_for_user"; reason: string }
  | { outcome: "pause_for_approval"; reason: string };

const HUMAN_ONLY_KEYWORDS = [
  "deploy",
  "production",
  "billing",
  "payment",
  "secret",
  "credential",
  "firebase connect",
  "github oauth"
];

export function evaluateHumanOnlyGate(
  workItem: WorkItem,
  policy: ContinuousWorkPolicy
): HumanGateResult {
  if (!policy.safeWorkEnabled) {
    return { outcome: "pause_for_user", reason: "Safe work auto-continuation is disabled." };
  }

  const titleLower = workItem.title.toLowerCase();
  if (HUMAN_ONLY_KEYWORDS.some((keyword) => titleLower.includes(keyword))) {
    return { outcome: "pause_for_user", reason: "Work item matches human-only keyword gate." };
  }

  if (workItem.requiredApproval || workItem.stopCheckRequired) {
    return { outcome: "pause_for_approval", reason: "Work item requires explicit approval or stop check." };
  }

  if (workItem.riskLevel === "critical") {
    return { outcome: "pause_for_approval", reason: "Critical risk work cannot auto-continue." };
  }

  if (
    workItem.riskLevel === "high" &&
    (policy.requireApprovalForDestructiveActions || policy.maxRiskWithoutApproval === "low")
  ) {
    return { outcome: "pause_for_approval", reason: "High-risk work exceeds policy threshold." };
  }

  if (workItem.riskLevel === "medium" && policy.maxRiskWithoutApproval === "low") {
    return { outcome: "pause_for_approval", reason: "Medium risk exceeds maxRiskWithoutApproval=low." };
  }

  if (workItem.status === "waiting_for_user" || workItem.status === "waiting_for_approval") {
    return { outcome: "pause_for_user", reason: "Work item is already waiting on operator." };
  }

  return { outcome: "allow", reason: "Work item is safe to continue under current policy." };
}
