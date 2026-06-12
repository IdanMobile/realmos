# RealmOS — Project State

Version: 0.28.0  
Prepared: 2026-06-12

## Current Phase

```text
Initiative 0.28 — Dogfood RealmOS Managing One Real RealmOS Task (complete)
```

## Current Task

```text
Await operator approval for Initiative 0.29 — RealmOS Base System Verification Plan
```

## Roadmap gate (locked)

**Hard rule:** No side projects until the **RealmOS base system is complete and verified**.

**Next roadmap:** RealmOS-only until base system complete.

- **Recommended next:** **0.29 — RealmOS Base System Verification Plan**
- **Do not recommend or scope:** GUING, side projects, product bootstrap, external project work

## Testing & Quality Gate (locked)

Permanent rule (Initiative 0.28): every initiative must include tests for new behavior or document explicit test gaps before PASS. See `CURSOR_SSOT.md` Section 7.1.

## Handoff

- Handoff: `docs/realmos-package/99_handoffs/latest_cursor_handoff.md`
- New chat prompt: `docs/realmos-package/99_handoffs/new_chat_prompt.md`
- Latest durable handoff: `GET /api/run-state/handoff/latest`
- Dogfood state (local): `.realmos/dogfood-v0-28-state.json`

## Current Status

Strict verification bar is **green**. Initiative 0.28 dogfooded lifecycle → dry-run dispatch → manual governance docs → verification → run-state/handoff. **No shell execution or Cursor CLI invocation.**

## Last Completed

```text
Initiative 0.28 — Dogfood + Testing & Quality Gate governance (lifecycle, dispatch, run-state, docs)
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

- Dogfood: `docs/realmos-package/06_operations/dogfood_realmOS_task_v0_28.md`
- Audit: `docs/realmos-package/99_audits/dogfood_realmOS_task_audit_v0_28.md`
- Self-handoff: `docs/realmos-package/06_operations/self_handoff_run_state_v0_27.md`
- Verification: `VERIFICATION_COMMANDS.md`
- Governance: `CURSOR_SSOT.md` Section 5 + 7.1
