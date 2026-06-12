# RealmOS — Data Model v1

## Core Entities

```text
User
Business
Agent
AgentTemplate
Task
Thread
Message
Memory
Decision
Artifact
Tool
ToolPermission
ApprovalRequest
AuditEvent
Budget
CostEntry
ModelProfile
Run
WorldMap
WorldNode
WorldEdge
Metric
Risk
```

## Entity Relationships

```text
User owns Businesses
Business has Agents
Business has Tasks
Business has Memory
Business has Budget
Agent belongs to Business or Global scope
Agent has ToolPermissions
Agent has ModelProfile
Task assigned to Agent
Task produces Artifacts
Task has AuditEvents
ApprovalRequest may belong to Business/Agent/Task
Memory belongs to Global/Business/Agent/Task/Run scope
WorldNode references Business/Agent/Task/Metric
```

## Memory Scopes

### Global Memory

Stores:

- user preferences
- conversations
- decisions
- long-term knowledge
- general assistant behavior

### Business Memory

Stores:

- mission
- strategy
- specs
- decisions
- risks
- metrics
- project context

### Agent Memory

Stores:

- agent performance
- role-specific lessons
- previous outputs
- constraints
- self-improvement notes

### Task Memory

Stores:

- task context
- steps
- outputs
- blockers
- decisions

### Run Memory

Stores:

- execution trace
- tool calls
- errors
- cost
- audit event IDs

## Approval Model

Every approval request includes:

- requested action
- risk level
- who requested it
- business context
- payload
- reason
- estimated cost/impact
- status

## Budget Model

Budget can be scoped to:

- global
- business
- agent
- tool
- model provider

Subscriptions require explicit approval even if budget exists.

## Audit Model

Every significant event creates an AuditEvent:

- created business
- created agent
- changed permission
- created task
- ran tool
- requested approval
- approved/rejected
- wrote memory
- used model
- generated artifact
