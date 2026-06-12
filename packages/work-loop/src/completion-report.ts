import type { CursorCompletionReport, CursorWorkPacket } from "@realmos/contracts";
import { makeWorkLoopId, nowIso } from "./id";

export type ImportCompletionReportInput = {
  packet: CursorWorkPacket;
  rawReport: string;
  summary?: string;
  changedFiles?: string[];
  testsRun?: string[];
  testStatus?: CursorCompletionReport["testStatus"];
  blockers?: string[];
  risks?: string[];
  nextRecommendation?: string;
};

export function importCursorCompletionReport(
  input: ImportCompletionReportInput
): { report: CursorCompletionReport; packet: CursorWorkPacket } {
  const timestamp = nowIso();
  const report: CursorCompletionReport = {
    id: makeWorkLoopId("report"),
    workPacketId: input.packet.id,
    summary: input.summary ?? input.rawReport.slice(0, 240),
    changedFiles: input.changedFiles ?? [],
    testsRun: input.testsRun ?? [],
    testStatus: input.testStatus ?? "not_run",
    blockers: input.blockers ?? [],
    risks: input.risks ?? [],
    nextRecommendation: input.nextRecommendation ?? "Select next safe work item.",
    rawReport: input.rawReport,
    createdAt: timestamp
  };

  const packet: CursorWorkPacket = {
    ...input.packet,
    status: "report_received",
    reportReceivedAt: timestamp
  };

  return { report, packet };
}
