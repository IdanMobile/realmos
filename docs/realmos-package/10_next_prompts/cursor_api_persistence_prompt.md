# Cursor Prompt — Phase 2: API + Persistence

Implement API and persistence for RealmOS.

Use the contracts package as source of truth.

Build in apps/api:

1. API server.
2. Health route.
3. Businesses routes.
4. Agents routes.
5. Tasks routes.
6. Memory routes.
7. Approvals routes.
8. Audit routes.
9. Cost routes.
10. World route.

Add Postgres schema/migrations based on:
`02_architecture/database_schema_v1.md`

Create repositories:

```text
business-repository.ts
agent-repository.ts
task-repository.ts
memory-repository.ts
approval-repository.ts
audit-repository.ts
cost-repository.ts
artifact-repository.ts
world-repository.ts
```

Rules:

- Every create/update must write an audit event.
- Do not allow direct execution of risky actions.
- Approval status must be explicit.
- Keep all route handlers thin.
- Put business logic in services.
