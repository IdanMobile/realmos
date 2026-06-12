# Agent Communication Archive / Conversation Ledger v1

## Decision

All agent communications must be saved in a structured, queryable, and reviewable way.

The UI can summarize communications, but the underlying messages, threads, decisions, errors, consultations, handoffs, and reports must remain available for later analysis.

## Why

RealmOS needs this because communication history is valuable for:

- debugging
- improving agents
- detecting repeated blockers
- finding bad workflows
- understanding why decisions were made
- training/improving prompts and procedures
- auditing risky behavior
- measuring agent quality
- reducing repeated mistakes
- analyzing cost/token waste
- generating weekly/monthly system improvement reports

## Core Rule

No agent communication disappears by default.

Every communication belongs to a structured context:

- business
- task
- run
- council session
- approval flow
- incident
- optimization report
- system/global thread

## Communication Storage Layers

### 1. Database Ledger

Postgres stores structured communication records.

Used for:

- filtering
- search
- thread detail
- dashboards
- status
- analytics
- audits

### 2. Markdown Archive

Optional local markdown archive, compatible with Obsidian/Knowledge Vault.

Used for:

- human-readable long-term review
- backlinks
- memory analysis
- summaries
- decision trails

### 3. Audit Events

Important communications create immutable audit events.

Used for:

- governance
- safety
- accountability

### 4. Summaries / Context Packs

Long threads can be summarized into small context packs to save tokens.

Raw messages remain available, but agents usually consume summarized context.

## Thread Types

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
```

## Message Types

```ts
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
```

## Required Contracts

```ts
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

type CommunicationDecision = {
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

type CommunicationArchiveEntry = {
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
```

## Storage Rules

### Save Raw Messages

Every message is stored.

### Save Structured Metadata

Messages must include:

- type
- priority
- sender
- recipient/role
- business/task/run context
- requiresResponse
- artifact/memory refs
- approval links if relevant

### Save Decisions Separately

Important decisions should be extracted into `CommunicationDecision`.

This allows the user to read decisions without reading the whole thread.

### Save Summaries Separately

Long threads should generate summaries.

Summaries are for token saving.

They do not replace raw messages.

### Archive Closed Threads

Resolved threads can be archived, but still searchable.

### Obsidian Export

A thread can optionally be exported to markdown:

```text
vault/communications/
  businesses/
    realmos/
      task-p3-06-api-contracts.md
  council/
    model-platform-decision-2026-06.md
  incidents/
    terminal-command-blocked.md
```

## Communication Analytics

The System Optimizer can analyze communication history for:

- frequent blockers
- agents that ask too many unclear questions
- agents that repeatedly fail
- tasks with too many handoffs
- recurring missing context
- repeated approval bottlenecks
- long-running unresolved threads
- high error areas
- cost/token-heavy conversations
- poor delegation patterns

## Privacy / Safety

Communications may contain sensitive details.

Rules:

- do not store secrets/API keys
- mark sensitive threads
- approval-required messages link to ApprovalRequest
- user can archive/delete non-audit communication if allowed by retention policy
- immutable audit events remain separate
- sensitive communication should not be sent to external models without approval

## UI Implication

The Communication page should show summaries and filters first, but allow opening the complete thread.

User should be able to:

- read all messages
- search messages
- filter by agent/task/business/type/severity
- view decisions only
- view errors only
- view blockers only
- export to markdown
- generate analysis report
- mark thread as resolved/archive
