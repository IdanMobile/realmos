# Cursor Prompt — Implement RealmOS Contracts

Create TypeScript contracts for RealmOS.

Files:

```text
/packages/contracts/src/business.ts
/packages/contracts/src/agent.ts
/packages/contracts/src/task.ts
/packages/contracts/src/memory.ts
/packages/contracts/src/approval.ts
/packages/contracts/src/audit.ts
/packages/contracts/src/budget.ts
/packages/contracts/src/cost.ts
/packages/contracts/src/world.ts
/packages/contracts/src/model.ts
/packages/contracts/src/tool.ts
/packages/contracts/src/index.ts
```

Requirements:

- Use explicit string union types.
- Export all types from index.ts.
- Add factory helpers for mock/test creation.
- Add zod schemas if zod is already part of the project; otherwise leave TODO comments.
- Do not use `any` unless unavoidable.
- Include comments explaining risk-sensitive fields.

Important rules:

- Subscription actions must be represented as approval-required.
- Agent permissions must not be implicit.
- Memory must include scope and sensitivity.
- World nodes must reference business/agent/task/metric cleanly.
