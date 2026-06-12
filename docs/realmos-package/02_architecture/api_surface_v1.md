# RealmOS — API Surface Draft v1

This is a draft API surface for MVP implementation.

## Health

### GET `/api/health`

Returns API status.

```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

## Jarvis

### POST `/api/jarvis/chat`

Send a message to Jarvis.

Request:

```json
{
  "message": "Jarvis, I have an idea for a dating app",
  "context": {
    "activeBusinessId": null
  }
}
```

Response:

```json
{
  "reply": "I can create an ecosystem business for this idea.",
  "actions": [
    {
      "type": "propose_business_creation",
      "requiresApproval": false
    }
  ]
}
```

### POST `/api/jarvis/commands/create-business-from-idea`

Creates a business and initial artifacts.

Request:

```json
{
  "ideaText": "A real-time dating app that...",
  "businessName": "Real Time Dating App"
}
```

Response:

```json
{
  "businessId": "biz_...",
  "createdAgentIds": ["agent_..."],
  "createdTaskIds": ["task_..."],
  "artifactIds": ["artifact_..."]
}
```

## Businesses

### GET `/api/businesses`

List businesses.

### POST `/api/businesses`

Create business.

### GET `/api/businesses/:businessId`

Read business details.

### PATCH `/api/businesses/:businessId`

Update business metadata.

## Agents

### GET `/api/agents`

List agents.

### POST `/api/agents`

Create agent.

### GET `/api/agents/:agentId`

Read agent.

### PATCH `/api/agents/:agentId`

Update agent.

### POST `/api/businesses/:businessId/agents/create-default-team`

Necromancer creates default team.

## Tasks

### GET `/api/tasks`

List tasks.

### POST `/api/tasks`

Create task.

### GET `/api/tasks/:taskId`

Read task.

### PATCH `/api/tasks/:taskId`

Update task status/details.

## Memory

### GET `/api/memory`

Query memory by scope.

Query params:

```text
scope=global|business|agent|task|run
scopeId=...
kind=decision|preference|knowledge|summary|artifact|event
```

### POST `/api/memory`

Create memory entry.

## Approvals

### GET `/api/approvals`

List approval requests.

### POST `/api/approvals`

Create approval request.

### POST `/api/approvals/:approvalId/approve`

Approve.

### POST `/api/approvals/:approvalId/reject`

Reject.

## Audit

### GET `/api/audit`

List audit events.

### POST `/api/audit`

Create audit event internally.

## Costs

### GET `/api/costs/summary`

Cost summary.

### POST `/api/costs`

Record cost entry.

## SpecKit

### POST `/api/businesses/:businessId/speckit/generate`

Generate SpecKit files.

### GET `/api/businesses/:businessId/artifacts`

List generated artifacts.

## World

### GET `/api/world`

Return world contract.

### POST `/api/world/rebuild`

Rebuild world nodes from businesses/agents/tasks.
