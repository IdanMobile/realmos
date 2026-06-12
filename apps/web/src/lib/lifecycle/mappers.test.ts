import { describe, expect, it } from "vitest";
import type { WorkPacketLifecycle } from "@realmos/contracts";
import {
  availableLifecycleActions,
  filterMonitorPackets,
  LIFECYCLE_SAFETY_FLAGS,
  summarizeLifecyclePackets
} from "./mappers";

function samplePacket(overrides: Partial<WorkPacketLifecycle> = {}): WorkPacketLifecycle {
  const timestamp = "2026-06-12T12:00:00.000Z";
  return {
    id: "wpl_test",
    packetId: "wpl_test",
    realmId: "realm_realmos",
    repositoryId: "repo_realmos",
    allowedPaths: ["packages/**"],
    forbiddenPaths: [".env"],
    objective: "Test packet",
    instructions: "Dry-run only.",
    verificationCommands: ["pnpm test"],
    expectedArtifacts: ["panel"],
    approvalRequired: true,
    verificationStatus: "pending",
    handoffRequired: false,
    handoffUpdated: false,
    status: "draft",
    auditEvents: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides
  };
}

describe("lifecycle mappers", () => {
  it("summarizes packet counts by status", () => {
    const summary = summarizeLifecyclePackets([
      samplePacket({ id: "a", status: "ready_for_approval" }),
      samplePacket({ id: "b", status: "awaiting_result" }),
      samplePacket({ id: "c", status: "verification_pending" })
    ]);

    expect(summary.totalCount).toBe(3);
    expect(summary.approvalNeededCount).toBe(1);
    expect(summary.awaitingResultCount).toBe(1);
    expect(summary.verificationPendingCount).toBe(1);
  });

  it("groups monitor packets", () => {
    const groups = filterMonitorPackets([
      samplePacket({ id: "a", status: "ready_for_approval" }),
      samplePacket({ id: "b", status: "awaiting_result", dispatchId: "exec_1" }),
      samplePacket({ id: "c", status: "approved" })
    ]);

    expect(groups.awaitingApproval).toHaveLength(1);
    expect(groups.awaitingResult).toHaveLength(1);
    expect(groups.queuedOrDispatched).toHaveLength(2);
  });

  it("exposes safe lifecycle actions per status", () => {
    expect(availableLifecycleActions("draft")).toContain("markReady");
    expect(availableLifecycleActions("ready_for_approval")).toContain("approve");
    expect(availableLifecycleActions("approved")).toContain("dispatch");
    expect(availableLifecycleActions("awaiting_result")).toContain("recordResult");
    expect(availableLifecycleActions("verification_pending")).toContain("attachVerification");
    expect(availableLifecycleActions("verified")).toContain("closeCompleted");
    expect(availableLifecycleActions("completed")).toHaveLength(0);
  });

  it("keeps safety flags false for automatic execution", () => {
    expect(LIFECYCLE_SAFETY_FLAGS.shellExecution).toBe(false);
    expect(LIFECYCLE_SAFETY_FLAGS.automaticExecution).toBe(false);
    expect(LIFECYCLE_SAFETY_FLAGS.cursorCliInvoked).toBe(false);
  });
});
