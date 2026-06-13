# Latest Cursor Handoff — Post Initiative 0.36

Updated: 2026-06-13

---

## Current position

| Field | Value |
|-------|--------|
| **Project version** | `0.36.0` |
| **Post-MVP complete** | 0.18–0.36 |
| **Cursor IDE exit readiness** | **FAIL** (audit complete — see hard blockers) |
| **Browser E2E smoke** | **PASS** (mock API in CI) |
| **Jarvis operator chat** | **PASS** |
| **Necromancer operator flow** | **PASS** (Postgres durable) |
| **Verification evidence** | **PASS** |
| **Work packet create (UI)** | **FAIL** — API only |
| **Executor mode** | `dry_run` |

---

## Roadmap gate (locked)

- **Recommended next:** **0.37 — Work Packet Creation / Approval UI Completion**
- **Blocked:** GUING, side projects

**Do not start 0.37 until operator explicitly approves.**

---

## Initiative 0.36 summary

- Defined Cursor IDE exit checklist (12 criteria)
- Full readiness matrix with PASS/PARTIAL/FAIL/BLOCKED
- Classified hard blockers vs acceptable vs future vs governance-blocked
- Roadmap 0.37–0.40 toward exit milestone
- Docs: `cursor_exit_readiness_v0_36.md`, `cursor_exit_readiness_audit_v0_36.md`

### Hard blockers before Cursor exit

1. No work packet **creation** UI (approve/track exists)
2. No live full-stack operator smoke (CI uses mock API)
3. No operator-day runbook sign-off

---

## Initiative 0.35 summary (closed)

- Playwright E2E in CI; 8 smoke tests; safety assertions

---

## Audits

- `docs/realmos-package/99_audits/cursor_exit_readiness_audit_v0_36.md`
- `docs/realmos-package/06_operations/cursor_exit_readiness_v0_36.md`
- `docs/realmos-package/99_audits/browser_e2e_readiness_audit_v0_35.md`

---

## Verification

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start && pnpm demo:mvp && pnpm test:e2e && pnpm test:postgres
```
