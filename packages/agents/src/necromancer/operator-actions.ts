import type { NecromancerCandidate } from "./candidates";

export type NecromancerOperatorAction = "pause" | "retire" | "protect";

export type NecromancerActionValidation = {
  allowed: boolean;
  reason?: string;
};

const BLOCKED_ACTION_PATTERN = /\b(delete|destroy|purge|drop|shell|cursor\s*cli|auto.?dispatch)\b/i;

export function isBlockedNecromancerActionText(action: string): boolean {
  return BLOCKED_ACTION_PATTERN.test(action);
}

export function validateNecromancerOperatorAction(input: {
  candidate: NecromancerCandidate;
  action: NecromancerOperatorAction;
  approved: boolean;
  operatorId?: string;
}): NecromancerActionValidation {
  if (isBlockedNecromancerActionText(input.action)) {
    return { allowed: false, reason: "Destructive or autonomous actions are blocked." };
  }

  if (!input.approved) {
    return { allowed: false, reason: "Operator approval is required before Necromancer actions." };
  }

  if (!input.operatorId?.trim()) {
    return { allowed: false, reason: "Operator ID is required for audit logging." };
  }

  if (input.candidate.protected && input.action !== "protect") {
    return { allowed: false, reason: "Candidate is protected — remove protection before other actions." };
  }

  if (input.candidate.sideProjectBlocked && (input.action === "pause" || input.action === "retire")) {
    return {
      allowed: false,
      reason: "GUING and side-project scopes are blocked from pause/retire via Necromancer."
    };
  }

  if (input.action === "protect" && input.candidate.protected) {
    return { allowed: false, reason: "Candidate is already protected." };
  }

  return { allowed: true };
}
