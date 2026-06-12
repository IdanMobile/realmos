# RealmOS — Definition of Done v1

A feature is done only if:

## Functional

- It meets the user story.
- It is connected to the correct contracts.
- It updates dashboard state if relevant.
- It writes artifacts if relevant.

## Safety

- Risky actions go through governance.
- Approval is required where expected.
- No hidden actions.
- Audit events are written.

## Memory

- Memory writes are scoped.
- Sensitive data is not stored accidentally.
- Decisions are recorded when relevant.

## Cost

- Online/tool usage is tracked if applicable.
- Budget limits are respected.

## Tests

- Unit tests pass.
- Integration tests pass if flow touches multiple modules.
- Safety tests pass.

## Documentation

- Any new module has a short README or doc.
- Any new decision has ADR if significant.

## Review

- PR reviewer/Pierce checks:
  - scope
  - architecture
  - safety
  - tests
  - regressions
