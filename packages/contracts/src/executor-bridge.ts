export type LocalExecutorStatus =
  | "queued"
  | "dispatched"
  | "running"
  | "completed"
  | "failed"
  | "blocked";

export type LocalExecutorDispatch = {
  id: string;
  executorId: string;
  realmId: string;
  repositoryId: string;
  workPacketId: string;
  branchTarget?: string;
  worktreeTarget?: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
  taskSummary: string;
  prompt: string;
  verificationCommands: string[];
  stopConditions: string[];
  requiresApproval: boolean;
  approvedAt?: string;
  status: LocalExecutorStatus;
  queueArtifactPath?: string;
  resultSummary?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  dispatchedAt?: string;
  completedAt?: string;
};

export type LocalExecutorDispatchInput = {
  executorId?: string;
  realmId: string;
  repositoryId: string;
  workPacketId: string;
  branchTarget?: string;
  worktreeTarget?: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
  taskSummary: string;
  prompt: string;
  verificationCommands: string[];
  stopConditions?: string[];
  requiresApproval?: boolean;
};

export type LocalExecutorResultInput = {
  status: "completed" | "failed" | "running" | "blocked";
  resultSummary?: string;
  errorMessage?: string;
};
