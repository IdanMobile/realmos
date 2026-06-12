# RealmOS — Tech Stack Decision v1

## Current Recommendation

### Frontend

Next.js / React / TypeScript

Reason:

- fast development
- strong dashboard support
- easy local and web deployment
- compatible with future visual world

### Backend

Node.js / TypeScript

Reason:

- user is strong in TypeScript
- good fit for tools, APIs, workers
- aligns with existing development style

### Database

Postgres

Reason:

- reliable relational model
- JSONB support
- good for events, agents, tasks, memory metadata
- can later support pgvector

### Queue

Redis + BullMQ

Reason:

- background agent runs
- scheduled tasks
- async workflows
- simple to start

Alternative later: Temporal for more robust long-running workflows.

### Memory

Start:

- Postgres tables
- summaries
- structured memory

Later:

- pgvector
- vector search
- embedding pipeline

### Agents

Start:

- custom orchestrator with explicit contracts

Consider later:

- LangGraph for stateful workflows
- CrewAI for crew/team abstractions
- n8n for workflow/integration automations

### Local LLM

Ollama

Use for:

- summaries
- classification
- routing
- memory cleanup
- low-cost background tasks

### Online LLM

Use premium models for:

- architecture
- code planning
- deep reasoning
- SpecKit generation
- complex agent debates

### Browser Control

Playwright

### Computer Control

Later:

- shell
- AppleScript
- macOS Shortcuts
- accessibility APIs with strict approval

### Automation

n8n when useful.

Use for:

- integrations
- webhooks
- scheduled workflows
- external services

### Observability

Start:

- structured logs
- audit events

Later:

- OpenTelemetry

### Repo

Monorepo.

```text
/apps/web
/apps/api
/apps/worker
/packages/core
/packages/contracts
/packages/agents
/packages/governance
/packages/memory
/packages/tools
/packages/llm-router
/packages/ui
/specs
```

## Major Stack Principle

Use existing tools to move fast, but keep RealmOS core data, permissions, memory, and governance under our control.
