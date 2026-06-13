# RealmOS — Project State

Version: 0.30.0  
Prepared: 2026-06-12

## Current Phase

```text
Initiative 0.30 — UI / Navigation Verification Against Locked References (complete)
```

## Current Task

```text
Await operator approval for Initiative 0.31 — Jarvis Interaction Path Verification / Chat UI
```

## Roadmap gate (locked)

**Hard rule:** No side projects until the **RealmOS base system is complete and verified**.

- **Recommended next:** **0.31 — Jarvis Interaction Path Verification / Chat UI**
- **Do not recommend or scope:** GUING, side projects, product bootstrap, external project work

## Testing & Quality Gate (locked)

Permanent rule (Initiative 0.28): every initiative must include tests for new behavior or document explicit test gaps before PASS. See `CURSOR_SSOT.md` Section 7.1.

## Handoff

- Handoff: `docs/realmos-package/99_handoffs/latest_cursor_handoff.md`
- New chat prompt: `docs/realmos-package/99_handoffs/new_chat_prompt.md`
- UI/navigation audit: `docs/realmos-package/99_audits/ui_navigation_readiness_audit_v0_30.md`

## Current Status

Strict verification bar is **green**. Initiative 0.30 implemented query-param section navigation, honest Search/Jarvis disabled states, governance safety banner, and Decisions placeholder. **UI reference PNGs still missing** — pixel comparison blocked. **Overall base readiness: PARTIAL**. **Cursor IDE exit: FAIL**.

## Last Completed

```text
Initiative 0.30 — UI/navigation verification + minimum section nav fix
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

- UI/navigation: `docs/realmos-package/06_operations/ui_navigation_verification_v0_30.md`
- Audit: `docs/realmos-package/99_audits/ui_navigation_readiness_audit_v0_30.md`
- Base system plan: `docs/realmos-package/06_operations/base_system_verification_plan_v0_29.md`
- Verification: `VERIFICATION_COMMANDS.md`
- Governance: `CURSOR_SSOT.md` Section 5 + 7.1
