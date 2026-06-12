# RealmOS — Cursor Operating Protocol

This file tells Cursor how to behave.

## 1. Do Not Ask for Re-Architecture Unless Blocked

The architecture is already defined.

Only propose architecture changes if:

- existing plan is impossible
- security issue found
- major simplification available
- user explicitly asks

If proposing change, create an ADR.

## 2. Follow the SSOT TODO

Use:

`18_execution/SSOT_TODO_CHECKLIST.md`

Do not invent random next steps.

## 3. Work in Small Phases

For each phase:

1. Mark task in progress.
2. Write tests first.
3. Implement.
4. Run verification.
5. Stop at checkpoint.
6. Report status.

## 4. Never Bypass Governance

Do not implement a direct risky action path.

Risky actions include:

- terminal execution
- file deletion
- spending
- subscriptions
- messaging
- browser automation
- GitHub push/PR/merge
- camera/mic
- crypto trading
- permission changes

## 5. No Real External Effects in Early MVP

Use mocks/stubs until governance is tested.

## 6. Contracts First

All shared types must come from `packages/contracts`.

## 7. Audit Everything Important

Create audit events for:

- business created
- agent created
- task created
- memory written
- approval requested/resolved
- tool requested/executed/blocked
- model called
- cost recorded
- artifact created
- policy blocked

## 8. Keep Human-Readable Artifacts

Generated artifacts should be markdown and stored predictably.

## 9. Preserve Future Visual World

Use the World Contract.

Do not hardcode UI in a way that prevents future game-like world.

## 10. Stop Means Stop

At STOP CHECK gates, do not continue implementing until verification is complete.
