import type { NecromancerCandidate, NecromancerRecommendedAction } from "./candidates";

export type NecromancerRecommendation = {
  candidateId: string;
  summary: string;
  recommendation: string;
  allowedActions: Array<"prepare" | "pause" | "retire" | "protect">;
  requiresApproval: boolean;
  safetyNotes: string[];
  blockedActions: string[];
};

const BASE_SAFETY_NOTES = [
  "No autonomous destructive actions — operator approval is required.",
  "Necromancer does not delete data; pause/retire/cancel are reversible review states.",
  "GUING and side projects remain blocked until base-system verification completes."
];

export function prepareNecromancerRecommendation(candidate: NecromancerCandidate): NecromancerRecommendation {
  const blockedActions: string[] = ["delete", "shell", "cursor_cli", "auto_dispatch"];

  if (candidate.sideProjectBlocked) {
    blockedActions.push("pause", "retire");
  }

  if (candidate.protected) {
    blockedActions.push("pause", "retire");
  }

  const allowedActions = buildAllowedActions(candidate, blockedActions);
  const recommendation = buildRecommendationText(candidate);

  return {
    candidateId: candidate.id,
    summary: `${candidate.classification} ${candidate.kind}: ${candidate.title}`,
    recommendation,
    allowedActions,
    requiresApproval: true,
    safetyNotes: [...BASE_SAFETY_NOTES],
    blockedActions
  };
}

function buildAllowedActions(
  candidate: NecromancerCandidate,
  blockedActions: string[]
): Array<"prepare" | "pause" | "retire" | "protect"> {
  const actions = new Set<"prepare" | "pause" | "retire" | "protect">(["prepare", "protect"]);

  if (!candidate.protected && !candidate.sideProjectBlocked) {
    if (candidate.recommendedAction === "pause" || candidate.recommendedAction === "observe") {
      actions.add("pause");
    }
    if (candidate.recommendedAction === "retire" || candidate.recommendedAction === "review") {
      actions.add("retire");
    }
    if (candidate.kind === "agent") {
      actions.add("pause");
      actions.add("retire");
    }
  }

  if (blockedActions.includes("pause")) actions.delete("pause");
  if (blockedActions.includes("retire")) actions.delete("retire");

  return [...actions];
}

function buildRecommendationText(candidate: NecromancerCandidate): string {
  if (candidate.sideProjectBlocked) {
    return `Mark protected and do not modify. ${candidate.reason} Side-project/GUING scope is blocked.`;
  }

  if (candidate.protected) {
    return `Candidate is protected. Review only — no pause or retire without removing protection first.`;
  }

  const actionText: Record<NecromancerRecommendedAction, string> = {
    observe: "Monitor and gather context before any lifecycle change.",
    pause: "Prepare to pause after operator approval to stop new work safely.",
    retire: "Prepare to retire or cancel after operator approval; no deletion occurs.",
    protect: "Mark protected to prevent accidental lifecycle changes.",
    review: "Review lifecycle state and verification evidence before acting."
  };

  return `${actionText[candidate.recommendedAction]} ${candidate.reason}`;
}
