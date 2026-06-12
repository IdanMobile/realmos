# RealmOS — Project State

Version: 0.27.0  
Prepared: 2026-06-12

## Current Phase

```text
Initiative 0.27 — Self-Handoff / Durable Run State Updates (complete)
```

## Current Task

```text
Await operator approval for Initiative 0.28 — Dogfood RealmOS Managing One Real RealmOS Task
```

## Roadmap gate (locked)

**No side projects until RealmOS self-management milestone is complete.**

- **GUING bootstrap:** blocked
- **Recommended next:** **0.28 — Dogfood RealmOS Managing One Real RealmOS Task**

## Handoff

- Handoff: `docs/realmos-package/99_handoffs/latest_cursor_handoff.md`
- New chat prompt: `docs/realmos-package/99_handoffs/new_chat_prompt.md`
- Latest durable handoff: `GET /api/run-state/handoff/latest`

## Current Status

Strict verification bar is **green**. Durable run-state/handoff records lifecycle outcomes without arbitrary file writes. **No automatic shell execution or Cursor CLI invocation.**

## Last Completed

```text
Initiative 0.27 — Self-handoff / durable run state (contract, service, API, persistence, Command Center, tests)
```

## Verification (strict)

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm check:clean-start
pnpm demo:mvp
pnpm test:postgres     # optional
```

## Docs

- Self-handoff: `docs/realmos-package/06_operations/self_handoff_run_state_v0_27.md`
- Audit: `docs/realmos-package/99_audits/self_handoff_run_state_audit_v0_27.md`
- Command Center monitor: `docs/realmos-package/06_operations/command_center_task_monitor_v0_26.md`
- Verification: `VERIFICATION_COMMANDS.md`
