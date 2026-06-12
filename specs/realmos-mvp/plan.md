# RealmOS MVP — Plan

## Technical Context

Frontend: Next.js / React  
Backend: Node.js + TypeScript  
Database: Postgres  
Queue: Redis / BullMQ  
Local LLM: Ollama  
Online LLM: model router to premium models  
Dashboard: web app first  
Agents: custom orchestrator first, optional LangGraph later  
Automation integrations: n8n, Playwright, shell, GitHub, AppleScript later  

## MVP Flow

1. User opens dashboard.
2. User chats with Jarvis.
3. User asks to create a business from an idea.
4. Jarvis creates idea intake.
5. Necromancer proposes agent team.
6. Government checks permissions.
7. System creates business record.
8. System creates agents.
9. Agents generate SpecKit artifacts.
10. Dashboard updates.
11. Memory and audit logs persist.

## Implementation Phases

### Phase 1 — Project Shell

- monorepo
- web app
- API app
- shared contracts
- dashboard skeleton

### Phase 2 — Core Registries

- business registry
- agent registry
- task registry
- approval registry
- memory registry
- audit events

### Phase 3 — Jarvis Core

- chat UI
- intent handling
- create business command
- summarize state command

### Phase 4 — Necromancer

- default agent templates
- custom agent creation model
- agent activation
- agent status

### Phase 5 — SpecKit Generator

- generate spec.md
- generate plan.md
- generate tasks.md
- generate acceptance.md
- generate contracts

### Phase 6 — Governance

- risk classification
- approval queue
- forbidden actions
- budget guardrails

### Phase 7 — Cost Tracking

- model cost entries
- tool cost entries
- budget summary
- subscription approval model

### Phase 8 — World Contract

- world map JSON
- business nodes
- agent nodes
- status indicators
- future visual support

### Phase 9 — First Demo

Run full idea-to-business flow.
