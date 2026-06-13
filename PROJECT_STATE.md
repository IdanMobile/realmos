# RealmOS — Project State

Version: 0.33.0  
Prepared: 2026-06-13

## Current Phase

```text
Initiative 0.33 — Verification Evidence Capture (complete)
```

## Current Task

```text
Await operator approval for Initiative 0.34 — Durable Necromancer Evidence / Persistence Hardening
```

## Roadmap gate (locked)

**Hard rule:** No side projects until the **RealmOS base system is complete and verified**.

- **Recommended next:** **0.34 — Durable Necromancer Evidence / Persistence Hardening**
- **Do not recommend or scope:** GUING, side projects, product bootstrap, external project work

## Handoff

- Handoff: `docs/realmos-package/99_handoffs/latest_cursor_handoff.md`
- Verification evidence audit: `docs/realmos-package/99_audits/verification_evidence_readiness_audit_v0_33.md`

## Current Status

Strict verification bar is **green**. Initiative 0.33 added verification evidence model, redaction, API, Postgres durability, run-state evidence summary, and Command Center evidence panel. **Cursor IDE exit: FAIL**. **Overall: PARTIAL**.

## Last Completed

```text
Initiative 0.33 — Verification evidence capture (operator/CI-linked, no auto shell)
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
