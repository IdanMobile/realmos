export type WorkPacketLifecycleStatus =
  | "draft"
  | "ready_for_approval"
  | "approved"
  | "dispatched"
  | "in_progress"
  | "awaiting_result"
  | "verification_pending"
  | "verified"
  | "completed"
  | "failed"
  | "blocked"
  | "cancelled";

export type WorkPacketVerificationStatus = "pending" | "pass" | "fail" | "blocked" | "not_required";

export type WorkPacketHandoffStatus = "not_required" | "required" | "completed";

export type WorkPacketLifecycleAuditEvent = {
  eventType: string;
  timestamp: string;
  summary: string;
  payload?: Record<string, unknown>;
};

export type WorkPacketVerificationRecord = {
  id: string;
  expectedCommands: string[];
  reportedStatus: "pass" | "fail" | "blocked";
  outputSummary: string;
  artifactsSummary: string;
  blockReason?: string;
  recordedAt: string;
};

export type WorkPacketExecutorResultRecord = {
  id: string;
  status: "completed" | "failed" | "running" | "blocked";
  resultSummary?: string;
  errorMessage?: string;
  recordedAt: string;
};

export type WorkPacketLifecycle = {
  id: string;
  packetId: string;
  sourceWorkItemId?: string;
  realmId: string;
  repositoryId: string;
  branchTarget?: string;
  worktreeTarget?: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
  objective: string;
  instructions: string;
  verificationCommands: string[];
  expectedArtifacts: string[];
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: string;
  dispatchId?: string;
  resultId?: string;
  executorResult?: WorkPacketExecutorResultRecord;
  verification?: WorkPacketVerificationRecord;
  verificationStatus: WorkPacketVerificationStatus;
  handoffRequired: boolean;
  handoffUpdated: boolean;
  status: WorkPacketLifecycleStatus;
  auditEvents: WorkPacketLifecycleAuditEvent[];
  createdAt: string;
  updatedAt: string;
};

export type WorkPacketLifecycleInput = {
  sourceWorkItemId?: string;
  realmId: string;
  repositoryId: string;
  branchTarget?: string;
  worktreeTarget?: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
  objective: string;
  instructions: string;
  verificationCommands: string[];
  expectedArtifacts?: string[];
  approvalRequired?: boolean;
  handoffRequired?: boolean;
};

export type WorkPacketLifecycleCloseInput = {
  status: "completed" | "failed" | "blocked" | "cancelled";
  reason?: string;
  handoffUpdated?: boolean;
};
