# Agent Communication Contract

```ts
type CommunicationThreadType =
  | "task_thread"
  | "consultation"
  | "council_session"
  | "approval_flow"
  | "incident"
  | "handoff"
  | "status_report"
  | "system_review"
  | "user_escalation";

type AgentMessageType =
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

type CommunicationThread = {
  id: string;
  type: CommunicationThreadType;
  businessId?: string;
  taskId?: string;
  runId?: string;
  approvalRequestId?: string;
  councilSessionId?: string;
  title: string;
  status: "open" | "waiting" | "resolved" | "archived";
  priority: "low" | "normal" | "high" | "critical";
  participantAgentIds: string[];
  createdByAgentId?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};

type AgentMessage = {
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
```

## Rule

No agent-to-agent communication outside a thread.

Every message must belong to a business, task, run, council session, approval flow, incident, or system/global thread.
