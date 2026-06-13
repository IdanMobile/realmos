import { describe, expect, it } from "vitest";
import type { NecromancerCandidate } from "../src/necromancer/candidates";
import {
  isBlockedNecromancerActionText,
  validateNecromancerOperatorAction
} from "../src/necromancer/operator-actions";
import { prepareNecromancerRecommendation } from "../src/necromancer/recommendations";

const candidate: NecromancerCandidate = {
  id: "agent:agent_test",
  kind: "agent",
  entityId: "agent_test",
  classification: "stale",
  riskLevel: "low",
  title: "Test Agent",
  currentStatus: "testing",
  reason: "Stale testing agent.",
  protected: false,
  sideProjectBlocked: false,
  recommendedAction: "observe"
};

describe("Necromancer operator action validation", () => {
  it("requires approval and operator id", () => {
    expect(
      validateNecromancerOperatorAction({
        candidate,
        action: "pause",
        approved: false,
        operatorId: "operator"
      }).allowed
    ).toBe(false);

    expect(
      validateNecromancerOperatorAction({
        candidate,
        action: "pause",
        approved: true,
        operatorId: ""
      }).allowed
    ).toBe(false);
  });

  it("blocks pause/retire on protected candidates", () => {
    const protectedCandidate = { ...candidate, protected: true };
    expect(
      validateNecromancerOperatorAction({
        candidate: protectedCandidate,
        action: "pause",
        approved: true,
        operatorId: "operator"
      }).allowed
    ).toBe(false);
  });

  it("blocks pause/retire on side-project scope", () => {
    const blocked = { ...candidate, sideProjectBlocked: true, recommendedAction: "protect" as const };
    expect(
      validateNecromancerOperatorAction({
        candidate: blocked,
        action: "retire",
        approved: true,
        operatorId: "operator"
      }).allowed
    ).toBe(false);
  });

  it("blocks destructive action language", () => {
    expect(isBlockedNecromancerActionText("delete all agents")).toBe(true);
    expect(isBlockedNecromancerActionText("run shell deploy")).toBe(true);
  });
});

describe("Necromancer recommendations", () => {
  it("requires approval and lists safety notes", () => {
    const recommendation = prepareNecromancerRecommendation(candidate);
    expect(recommendation.requiresApproval).toBe(true);
    expect(recommendation.safetyNotes.some((note) => note.includes("No autonomous"))).toBe(true);
    expect(recommendation.blockedActions).toContain("delete");
  });
});
