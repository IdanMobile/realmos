# RealmOS — Project State

Version: 0.29.0  
Prepared: 2026-06-12

## Current Phase

```text
Initiative 0.29 — RealmOS Base System Verification Plan (complete)
```

## Current Task

```text
Await operator approval for Initiative 0.30 — UI / Navigation Verification Against Locked References
```

## Roadmap gate (locked)

**Hard rule:** No side projects until the **RealmOS base system is complete and verified**.

**Next roadmap:** RealmOS-only until base system complete.

- **Recommended next:** **0.30 — UI / Navigation Verification Against Locked References**
- **Do not recommend or scope:** GUING, side projects, product bootstrap, external project work

## Testing & Quality Gate (locked)

Permanent rule (Initiative 0.28): every initiative must include tests for new behavior or document explicit test gaps before PASS. See `CURSOR_SSOT.md` Section 7.1.

## Handoff

- Handoff: `docs/realmos-package/99_handoffs/latest_cursor_handoff.md`
- New chat prompt: `docs/realmos-package/99_handoffs/new_chat_prompt.md`
- Latest durable handoff: `GET /api/run-state/handoff/latest`
- Base system audit: `docs/realmos-package/99_audits/base_system_readiness_audit_v0_29.md`

## Current Status

Strict verification bar is **green**. Initiative 0.29 produced full base-system verification plan and readiness audit. **Overall base readiness: PARTIAL** — backend green; navigation, Jarvis chat UI, UI references, and Cursor exit **not ready**.

## Last Completed

```text
Initiative 0.29 — Base system verification plan + readiness audit (docs; DEFAULT_NEXT_INITIATIVE → 0.30)
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

- Verification plan: `docs/realmos-package/06_operations/base_system_verification_plan_v0_29.md`
- Audit: `docs/realmos-package/99_audits/base_system_readiness_audit_v0_29.md`
- Dogfood: `docs/realmos-package/06_operations/dogfood_realmOS_task_v0_28.md`
- Self-handoff: `docs/realmos-package/06_operations/self_handoff_run_state_v0_27.md`
- Verification: `VERIFICATION_COMMANDS.md`
- Governance: `CURSOR_SSOT.md` Section 5 + 7.1
