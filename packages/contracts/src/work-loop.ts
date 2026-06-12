export type AutonomyLevel =
  | "manual_only"
  | "auto_plan"
  | "auto_prepare"
  | "auto_execute_safe"
  | "auto_execute_with_review"
  | "fully_autonomous_guarded";

export type WorkItemStatus =
  | "candidate"
  | "ready"
  | "running"
  | "waiting_for_report"
  | "blocked"
  | "waiting_for_user"
  | "waiting_for_approval"
  | "done"
  | "failed"
  | "cancelled";

export type ExecutionMode =
  | "human"
  | "cursor"
  | "internal_agent"
  | "deterministic_worker";

import type { ScopeLevel } from "./realm";
import type { CursorRepositoryContext } from "./repository";

export type CursorWorkPacketStatus =
  | "draft"
  | "ready_for_cursor"
  | "sent_to_cursor"
  | "running_in_cursor"
  | "report_received"
  | "verified"
  | "accepted"
  | "needs_fix";

export type WorkItem = {
  id: string;
  title: string;
  businessId: string;
  phaseId?: string;
  taskId?: string;
  status: WorkItemStatus;
  priority: "low" | "normal" | "high" | "critical";
  riskLevel: "low" | "medium" | "high" | "critical";
  requiredApproval?: boolean;
  blockedBy?: string[];
  dependencies?: string[];
  stopCheckRequired?: boolean;
  assignedAgentId?: string;
  executionMode: ExecutionMode;
  createdAt: string;
  updatedAt: string;
};

export type CursorWorkPacket = {
  id: string;
  workItemId: string;
  title: string;
  status: CursorWorkPacketStatus;
  goal: string;
  filesToRead: string[];
  filesToModify: string[];
  rules: string[];
  expectedOutput: string[];
  stopAfter: string;
  createdByAgentId: string;
  createdAt: string;
  sentAt?: string;
  reportReceivedAt?: string;
  scope?: ScopeLevel;
  realmId?: string;
  repositoryContext?: CursorRepositoryContext;
};

export type CursorCompletionReport = {
  id: string;
  workPacketId: string;
  summary: string;
  changedFiles: string[];
  testsRun: string[];
  testStatus: "not_run" | "passed" | "failed";
  blockers: string[];
  risks: string[];
  nextRecommendation: string;
  rawReport: string;
  createdAt: string;
};

export type ContinuousWorkPolicy = {
  id: string;
  autonomyLevel: AutonomyLevel;
  safeWorkEnabled: boolean;
  maxRiskWithoutApproval: "low" | "medium";
  requireApprovalForCost: boolean;
  requireApprovalForExternalActions: boolean;
  requireApprovalForDestructiveActions: boolean;
  requireStopCheckBeforePhaseAdvance: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NextBestWorkDecision = {
  id: string;
  selectedWorkItemId?: string;
  decision: "continue" | "wait_for_report" | "ask_user" | "request_approval" | "blocked";
  rationale: string;
  consideredWorkItemIds: string[];
  createdAt: string;
};
