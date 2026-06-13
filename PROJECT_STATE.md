# RealmOS — Project State

Version: 0.32.0  
Prepared: 2026-06-13

## Current Phase

```text
Initiative 0.32 — Necromancer Verification / Operator UI Hardening (complete)
```

## Current Task

```text
Await operator approval for Initiative 0.33 — Verification Evidence Capture
```

## Roadmap gate (locked)

**Hard rule:** No side projects until the **RealmOS base system is complete and verified**.

- **Recommended next:** **0.33 — Verification Evidence Capture**
- **Do not recommend or scope:** GUING, side projects, product bootstrap, external project work

## Handoff

- Handoff: `docs/realmos-package/99_handoffs/latest_cursor_handoff.md`
- Necromancer audit: `docs/realmos-package/99_audits/necromancer_readiness_audit_v0_32.md`

## Current Status

Strict verification bar is **green**. Initiative 0.32 added Necromancer operator panel, candidate detection API, approval-gated lifecycle actions, and audit logging. **Cursor IDE exit: FAIL**. **Overall: PARTIAL**.

## Last Completed

```text
Initiative 0.32 — Necromancer operator verification + UI hardening
```

## Verification (strict)

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm check:clean-start
pnpm demo:mvp
pnpm test:postgres
```
