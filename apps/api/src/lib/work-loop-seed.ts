import type {
  ContinuousWorkPolicy,
  CursorCompletionReport,
  CursorWorkPacket,
  NextBestWorkDecision,
  WorkItem
} from "@realmos/contracts";
import { createDefaultContinuousWorkPolicy } from "@realmos/work-loop";

export function createDefaultWorkLoopSeed(): {
  continuousWorkPolicy: ContinuousWorkPolicy;
  workItems: WorkItem[];
  cursorWorkPackets: CursorWorkPacket[];
  cursorCompletionReports: CursorCompletionReport[];
  nextBestWorkDecisions: NextBestWorkDecision[];
} {
  const timestamp = new Date().toISOString();
  const policy = createDefaultContinuousWorkPolicy();

  const workItems: WorkItem[] = [
    {
      id: "work_phase_6_8",
      title: "Phase 6.8 — Parallel Agent Fleet contracts",
      businessId: "realm_os",
      status: "ready",
      priority: "high",
      riskLevel: "low",
      executionMode: "cursor",
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "work_online_models",
      title: "Configure billing for online model providers",
      businessId: "realm_os",
      status: "candidate",
      priority: "normal",
      riskLevel: "medium",
      requiredApproval: true,
      executionMode: "human",
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];

  return {
    continuousWorkPolicy: policy,
    workItems,
    cursorWorkPackets: [],
    cursorCompletionReports: [],
    nextBestWorkDecisions: []
  };
}
