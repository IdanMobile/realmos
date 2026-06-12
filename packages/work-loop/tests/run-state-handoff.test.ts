import { describe, expect, it } from "vitest";
import type { WorkPacketLifecycle } from "@realmos/contracts";
import {
  buildHandoffSummaryObject,
  buildNextChatPromptObject,
  buildRunStateFromWorkPacket,
  DEFAULT_NEXT_INITIATIVE,
  markRunStateHandoffUpdated,
  updateRunStateFromVerification,
  validateNextRecommendedInitiative,
  validateRunStateTextContent
} from "../src/run-state-handoff";

const basePacket = (): WorkPacketLifecycle => ({
  id: "wpl_handoff_test",
  packetId: "wpl_handoff_test",
  realmId: "realm_realmos",
  repositoryId: "repo_realmos",
  allowedPaths: ["packages/**"],
  forbiddenPaths: [".env"],
  objective: "Self-handoff test",
  instructions: "Dry-run only.",
  verificationCommands: ["pnpm test"],
  expectedArtifacts: ["run-state record"],
  approvalRequired: true,
  verificationStatus: "pending",
  handoffRequired: false,
  handoffUpdated: false,
  status: "draft",
  auditEvents: [],
  createdAt: "2026-06-12T12:00:00.000Z",
  updatedAt: "2026-06-12T12:00:00.000Z"
});

describe("run state handoff", () => {
  it("creates run state from work packet", () => {
    const { state, errors } = buildRunStateFromWorkPacket(basePacket(), {
      initiativeId: "0.27",
      taskLabel: "Handoff test"
    });
    expect(errors).toHaveLength(0);
    expect(state.sourcePacketId).toBe("wpl_handoff_test");
    expect(state.nextRecommendedInitiative).toBe(DEFAULT_NEXT_INITIATIVE);
    expect(state.handoffTextSummary).toContain("Self-handoff test");
    expect(state.newChatPromptText).toContain("Do not start GUING");
  });

  it("blocks GUING in next recommended initiative", () => {
    const errors = validateNextRecommendedInitiative("Start GUING bootstrap");
    expect(errors.some((e) => e.message.includes("GUING"))).toBe(true);
  });

  it("rejects secret-like content in handoff text", () => {
    const errors = validateRunStateTextContent("api_key: leaked-value", "handoffTextSummary");
    expect(errors.length).toBeGreaterThan(0);
  });

  it("updates run state after verification pass", () => {
    const packet = {
      ...basePacket(),
      status: "verified" as const,
      verificationStatus: "pass" as const,
      verification: {
        id: "verify_1",
        expectedCommands: ["pnpm test"],
        reportedStatus: "pass" as const,
        outputSummary: "All tests passed",
        artifactsSummary: "run-state module",
        recordedAt: "2026-06-12T13:00:00.000Z"
      }
    };
    const { state: created } = buildRunStateFromWorkPacket(packet);
    const { state: updated } = updateRunStateFromVerification(created, packet);
    expect(updated.verificationStatus).toBe("pass");
    expect(updated.handoffRequired).toBe(true);
  });

  it("produces handoff summary and next-chat prompt objects", () => {
    const { state } = buildRunStateFromWorkPacket(basePacket());
    const summary = buildHandoffSummaryObject(state);
    const prompt = buildNextChatPromptObject(state);
    expect(summary.runStateId).toBe(state.id);
    expect(prompt.promptText).toContain("CURSOR_SSOT.md");
  });

  it("marks handoff updated", () => {
    const { state } = buildRunStateFromWorkPacket({ ...basePacket(), handoffRequired: true });
    const updated = markRunStateHandoffUpdated(state);
    expect(updated.handoffUpdated).toBe(true);
    expect(updated.handoffRequired).toBe(false);
  });
});
