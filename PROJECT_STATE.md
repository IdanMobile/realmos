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

## Roadmap gate (locked — reinforced 2026-06-12)

**Hard rule:** No side projects until the **RealmOS base system is complete and verified**.

Side projects (GUING, prior side projects, product bootstrap, external client work, project ideas, any non-RealmOS work) are blocked until the operator decides from inside a **working RealmOS/Jarvis environment**.

**Main goal:** Finish RealmOS so the operator can move from Cursor IDE into RealmOS for tasks, planning, execution, verification, and handoff.

**Next roadmap:** RealmOS-only until base system complete.

- **Recommended next:** **0.28 — Dogfood RealmOS Managing One Real RealmOS Task**
- **Do not recommend or scope:** GUING, side projects, product bootstrap, external project work

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
- Governance: `CURSOR_SSOT.md` Section 5
