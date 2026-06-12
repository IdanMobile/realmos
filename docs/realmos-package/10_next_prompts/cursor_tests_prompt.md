# Cursor Prompt — Add RealmOS Tests

Add tests for RealmOS MVP.

Use Vitest unless another test runner already exists.

Test areas:

1. Contracts factories create valid objects.
2. Governance risk classifier:
   - subscription requires approval
   - spending money requires approval
   - terminal command requires approval in MVP
   - low-risk summary does not require approval
   - hiding logs is blocked
3. Necromancer:
   - creates default business team
   - assigns correct roles
   - does not give dangerous permissions by default
4. Business creation:
   - creates business
   - creates agents
   - creates tasks
   - writes memory
   - writes audit events
5. SpecKit generation:
   - writes spec.md
   - writes plan.md
   - writes tasks.md
   - writes acceptance.md
6. World contract:
   - creates business nodes
   - creates agent nodes
   - references valid IDs

Do not skip safety tests.
