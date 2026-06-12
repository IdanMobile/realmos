import { describe, expect, it } from "vitest";
import type { WorkItem } from "@realmos/contracts";
import {
  createDefaultContinuousWorkPolicy,
  evaluateHumanOnlyGate,
  generateCursorWorkPacket,
  importCursorCompletionReport,
  selectNextBestWork
} from "../src/index";

function workItem(patch: Partial<WorkItem>): WorkItem {
  const timestamp = new Date().toISOString();
  return {
    id: "work_test",
    title: "Safe task",
    businessId: "realm_os",
    status: "ready",
    priority: "normal",
    riskLevel: "low",
    executionMode: "cursor",
    createdAt: timestamp,
    updatedAt: timestamp,
    ...patch
  };
}

describe("@realmos/work-loop", () => {
  it("continues safe low-risk work without user start", () => {
    const policy = createDefaultContinuousWorkPolicy();
    const decision = selectNextBestWork(
      [workItem({ id: "work_safe", title: "Add unit tests" })],
      policy
    );

    expect(decision.decision).toBe("continue");
    expect(decision.selectedWorkItemId).toBe("work_safe");
  });

  it("pauses for approval on high-risk work", () => {
    const policy = createDefaultContinuousWorkPolicy();
    const decision = selectNextBestWork(
      [workItem({ id: "work_risky", title: "Run destructive schema migration", riskLevel: "high" })],
      policy
    );

    expect(decision.decision).toBe("request_approval");
  });

  it("pauses for user on human-only keywords", () => {
    const gate = evaluateHumanOnlyGate(
      workItem({ title: "Configure billing subscription" }),
      createDefaultContinuousWorkPolicy()
    );
    expect(gate.outcome).toBe("pause_for_user");
  });

  it("generates cursor work packet for ready item", () => {
    const item = workItem({ id: "work_packet", title: "Implement work loop API" });
    const packet = generateCursorWorkPacket({ workItem: item });

    expect(packet.workItemId).toBe("work_packet");
    expect(packet.status).toBe("ready_for_cursor");
    expect(packet.filesToRead).toContain("CURSOR_SSOT.md");
  });

  it("imports completion report and updates packet status", () => {
    const packet = generateCursorWorkPacket({
      workItem: workItem({ id: "work_import" })
    });

    const result = importCursorCompletionReport({
      packet,
      rawReport: "Implemented work loop routes. Tests pass.",
      testStatus: "passed",
      changedFiles: ["apps/api/src/work-loop-routes.ts"]
    });

    expect(result.report.workPacketId).toBe(packet.id);
    expect(result.packet.status).toBe("report_received");
    expect(result.report.testStatus).toBe("passed");
  });

  it("waits when work item is waiting for report", () => {
    const decision = selectNextBestWork(
      [
        workItem({ id: "work_waiting", status: "waiting_for_report", title: "In flight" }),
        workItem({ id: "work_ready", status: "ready", title: "Next task" })
      ],
      createDefaultContinuousWorkPolicy()
    );

    expect(decision.decision).toBe("wait_for_report");
    expect(decision.selectedWorkItemId).toBe("work_waiting");
  });
});
