# Latest Cursor Handoff — Post Initiative 0.35

Updated: 2026-06-12

---

## Current position

| Field | Value |
|-------|--------|
| **Project version** | `0.35.0` |
| **Post-MVP complete** | 0.18–0.35 |
| **Browser E2E smoke** | **PASS** (Playwright + E2E mock API; CI integrated) |
| **Jarvis operator chat** | **PASS** (Live API required) |
| **Necromancer operator flow** | **PASS** (Live API + durable persistence in Postgres mode) |
| **Verification evidence capture** | **PASS** (Live API required) |
| **Cursor IDE exit** | **NOT READY** |
| **Executor mode** | `dry_run` |

---

## Roadmap gate (locked)

- **Recommended next:** **0.36 — Cursor IDE Exit Readiness Audit / Remaining Base-System Gaps**
- **Blocked:** GUING, side projects

**Do not start 0.36 until operator explicitly approves.**

---

## Initiative 0.35 summary

- Playwright setup in `@realmos/web` (`playwright.config.ts`, `playwright.mock.config.ts`)
- E2E mock API server (`apps/web/e2e/mock-api-server.mjs`) — no Ollama/Postgres
- Smoke specs: Command Center load, navigation, Jarvis, Necromancer, verification evidence
- Safety assertions: no shell/Cursor CLI/delete/autonomous cleanup; GUING blocked
- `pnpm test:e2e` + CI job after build
- Docs: `browser_e2e_smoke_v0_35.md`, `browser_e2e_readiness_audit_v0_35.md`

---

## Initiative 0.34 summary (closed)

- Postgres migration `011_necromancer_persistence.sql`
- Durable protect registry + operator action history
- No delete endpoint, no automatic cleanup

---

## Audits

- `docs/realmos-package/99_audits/browser_e2e_readiness_audit_v0_35.md`
- `docs/realmos-package/06_operations/browser_e2e_smoke_v0_35.md`
- `docs/realmos-package/99_audits/durable_necromancer_readiness_audit_v0_34.md`

---

## Verification

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start && pnpm demo:mvp && pnpm test:e2e && pnpm test:postgres
```
