Read CURSOR_SSOT.md and follow it exactly.

Then read:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. docs/realmos-package/99_audits/ui_navigation_readiness_audit_v0_30.md
4. docs/realmos-package/06_operations/ui_navigation_verification_v0_30.md

Optional durable context: `GET /api/run-state/handoff/latest`

---

## Resume context (2026-06-12)

Continue from **Initiative 0.30 complete**.

**0.30 delivered:** Section navigation via `?section=`, governance safety banner, honest disabled Search/Jarvis, Decisions placeholder, reference asset inventory (PNGs still missing).

**Roadmap gate (hard rule):** No side projects until RealmOS base system is complete.

**Recommended next (RealmOS-only):** **0.31 — Jarvis Interaction Path Verification / Chat UI** — **await operator approval. Do not auto-start.**

**Do not auto-start:** GUING, side projects, voice, autonomous execution, shell execution, Cursor CLI auto-invoke.

**Testing & Quality Gate:** No PASS without tests or documented test gap (CURSOR_SSOT.md Section 7.1).

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start
```
