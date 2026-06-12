export type CommunicationThreadType =
  | "task_thread"
  | "consultation"
  | "council_session"
  | "approval_flow"
  | "incident"
  | "handoff"
  | "status_report"
  | "system_review"
  | "user_escalation";

export type CommunicationThreadStatus = "open" | "waiting" | "resolved" | "archived";

export type AgentMessageType =
  | "progress_update"
  | "blocker"
  | "question"
  | "consultation_request"
  | "consultation_response"
  | "handoff"
  | "review_request"
  | "review_response"
  | "error_report"
  | "decision_proposal"
  | "decision_accepted"
  | "decision_rejected"
  | "approval_request"
  | "status_report"
  | "council_argument"
  | "final_report"
  | "heartbeat";

export type CommunicationThread = {
  id: string;
  type: CommunicationThreadType;
  businessId?: string;
  taskId?: string;
  runId?: string;
  approvalRequestId?: string;
  councilSessionId?: string;
  title: string;
  status: CommunicationThreadStatus;
  priority: "low" | "normal" | "high" | "critical";
  participantAgentIds: string[];
  createdByAgentId?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};

export type AgentMessage = {
  id: string;
  threadId: string;
  fromAgentId: string;
  toAgentId?: string;
  toRole?: string;
  businessId?: string;
  taskId?: string;
  runId?: string;
  type: AgentMessageType;
  priority: "low" | "normal" | "high" | "critical";
  subject: string;
  body: string;
  structuredPayload?: Record<string, unknown>;
  requestedAction?: string;
  requiresResponse: boolean;
  responseDueAt?: string;
  artifactRefs: string[];
  memoryRefs: string[];
  approvalRequestId?: string;
  parentMessageId?: string;
  createdAt: string;
};

export type CommunicationDecision = {
  id: string;
  threadId: string;
  businessId?: string;
  taskId?: string;
  title: string;
  decision: string;
  decidedByAgentId?: string;
  acceptedByAgentId?: string;
  rationale: string;
  alternativesConsidered: string[];
  artifactRefs: string[];
  createdAt: string;
};

export type CommunicationArchiveEntry = {
  id: string;
  threadId: string;
  archivePath?: string;
  summary: string;
  tokenEstimate: number;
  messageCount: number;
  decisionCount: number;
  errorCount: number;
  blockerCount: number;
  createdAt: string;
};
