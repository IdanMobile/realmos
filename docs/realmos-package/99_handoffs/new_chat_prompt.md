Read CURSOR_SSOT.md and follow it exactly.

Then read:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. docs/realmos-package/99_audits/self_handoff_run_state_audit_v0_27.md

Optional durable context: `GET /api/run-state/handoff/latest` and `GET /api/run-state/next-chat-prompt/latest`

---

## Resume context (2026-06-12)

Continue from **Initiative 0.27 complete**.

**0.27 delivered:** Durable run-state / self-handoff records in operational persistence. No arbitrary file writes. No automatic shell execution.

**Roadmap gate (hard rule):** No side projects until RealmOS base system is complete and verified. GUING, product bootstrap, external project work, and all non-RealmOS work are blocked. Side-project decisions happen only from inside working RealmOS/Jarvis — not from Cursor.

**Recommended next (RealmOS-only):** **0.28 Dogfood RealmOS Managing One Real RealmOS Task** — await operator approval before starting.

**Do not auto-start:** 0.28, GUING, side projects, product bootstrap, external project work, UI polish, voice, autonomous execution.

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start
```
