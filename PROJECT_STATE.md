# RealmOS — Project State

Version: 0.34.0  
Prepared: 2026-06-13

## Current Phase

```text
Initiative 0.34 — Durable Necromancer Evidence / Persistence Hardening (complete)
```

## Current Task

```text
Await operator approval for Initiative 0.35 — Browser E2E Smoke for Command Center Core Flows
```

## Roadmap gate (locked)

**Hard rule:** No side projects until the **RealmOS base system is complete and verified**.

- **Recommended next:** **0.35 — Browser E2E Smoke for Command Center Core Flows**
- **Do not recommend or scope:** GUING, side projects, product bootstrap, external project work

## Handoff

- Handoff: `docs/realmos-package/99_handoffs/latest_cursor_handoff.md`
- Necromancer persistence audit: `docs/realmos-package/99_audits/durable_necromancer_readiness_audit_v0_34.md`

## Current Status

Strict verification bar is **green**. Initiative 0.34 moved Necromancer protect registry and action history to durable operational persistence with optional verification evidence links. **Cursor IDE exit: FAIL**. **Overall: PARTIAL**.

## Last Completed

```text
Initiative 0.34 — Durable Necromancer persistence + evidence-aware action history
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
