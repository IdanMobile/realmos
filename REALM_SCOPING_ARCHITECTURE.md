# Realm Scoping Architecture v1

## Decision

RealmOS must separate the global operating layer from project/business ecosystems.

```text
RealmOS Global Layer = command center, Jarvis, governance, global agents, tools, settings
Project / Realm Ecosystem = isolated workspace for a project, business, life domain, client, automation, or company
```

## Terminology

Use both:

```text
Realm = internal architecture term
Project = user-facing label for most software/business realms
```

Example:

```text
UI label: Project: GUING
Internal model: realmId = "guing"
```

## Global Layer Owns

- Jarvis
- Command Center
- Global Settings
- Global Governance
- Global Budget
- Global Memory
- Global Tool Registry
- Global Model Registry
- Global Agent Registry
- Global Workflow Registry
- Global Approval Queue
- Global Audit Logs
- Global Fleet Controller
- Necromancer
- Creator Router
- Capability Scout
- Model Scout
- System Optimizer
- Global Researcher

## Project / Realm Owns

Each project/realm owns its local ecosystem:

- Project Dashboard
- Project Agents
- Project Tasks
- Project Workflows
- Project Runs
- Project Communication
- Project Memory
- Project Artifacts
- Project Decisions
- Project Analytics
- Project Data
- Project Risks
- Project Approvals
- Project Settings
- Project Budget
- Project Tools
- Project Model Routing
- Project World / Map
- Project Repository Binding

## Scope Rule

Almost every operational object must be scoped.

```ts
type ScopeLevel = "global" | "realm";

type ScopedEntity = {
  scope: ScopeLevel;
  realmId?: string;
};
```

Global objects:

```text
scope = "global"
realmId = undefined
```

Project objects:

```text
scope = "realm"
realmId = "guing"
```

## Objects That Must Be Scoped

- Agent
- Task
- Workflow
- Run
- Memory
- CommunicationThread
- AgentMessage
- Artifact
- Decision
- ApprovalRequest
- AuditEvent
- CostEntry
- Budget
- ToolPermission
- ModelRoutingDecision
- Fleet
- Squad
- WorkItem
- CursorWorkPacket
- RepositoryBinding

## Agent Scoping

Global agents can operate across realms only if explicitly allowed.

Realm agents belong to one realm by default.

```text
Realm agents cannot access another realm by default.
Cross-realm access requires explicit permission and audit.
```

## Memory / Communication Scoping

Memory and communication are separated:

```text
Global Memory
RealmOS Project Memory
GUING Memory
Crypto Bot Memory

Global Communication
Project Communication
```

## UI Shells

Global Shell:

```text
Command Center
Projects / Realms
Global Work
Global Agents
Global Workflows
Global Communication
Global Memory
Approvals
Tools
Models
Governance
Audit
Settings
```

Project Shell:

```text
Project Overview
Tasks
Agents
Workflows
Runs
Communication
Memory
Artifacts
Decisions
Analytics
Data
Risks
Approvals
Repository
Settings
```

## Route Model

```text
/app
/app/projects
/app/global/agents
/app/global/approvals
/app/global/settings

/app/projects/:realmId
/app/projects/:realmId/tasks
/app/projects/:realmId/agents
/app/projects/:realmId/workflows
/app/projects/:realmId/runs
/app/projects/:realmId/communication
/app/projects/:realmId/memory
/app/projects/:realmId/artifacts
/app/projects/:realmId/decisions
/app/projects/:realmId/repository
/app/projects/:realmId/settings
```

## Safety Benefit

Scoping prevents mixed memory, mixed communication, wrong agent access, wrong repository changes, cost confusion, and noisy global dashboards.

## Project Runtime Boundary

A Realm owns its own product/app runtime infrastructure.

RealmOS global infrastructure is only for orchestration around that realm.

Do not store real project production data in RealmOS Firebase unless explicitly approved as temporary prototype/mock mode with an exit plan.
