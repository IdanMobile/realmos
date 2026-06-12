# Cursor Prompt — Start RealmOS MVP

You are working on a serious professional project called RealmOS / Jarvis HQ.

Build the first MVP as a TypeScript monorepo.

Use this package as the source of truth:
- vision document
- architecture design
- SpecKit spec
- roadmap
- contracts
- data model
- diagrams

Do not build the full game-like UI yet.
Start with a practical dashboard.

Create:

```text
/apps/web
/apps/api
/apps/worker
/packages/contracts
/packages/core
/packages/agents
/packages/governance
/packages/memory
/packages/tools
/packages/llm-router
/packages/ui
/specs/realmos-mvp
```

First implementation goal:

1. Dashboard shell.
2. Jarvis chat panel.
3. Business list.
4. Agent list.
5. Task board.
6. Approval queue.
7. Memory summaries.
8. Cost/budget panel.
9. TypeScript contracts for Business, Agent, Task, Memory, ApprovalRequest, AuditEvent, CostEntry, WorldMap.
10. Mock data for the first demo.

Rules:

- All risky actions must go through approval.
- Subscription creation must always require explicit user approval.
- No camera/mic access in MVP.
- No real money spending.
- No real messaging.
- No hidden actions.
- Log all major system actions.
- Keep future world/game UI supported through clean World Contract data.
