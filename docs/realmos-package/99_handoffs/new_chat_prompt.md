Read CURSOR_SSOT.md and follow it exactly.

Then read:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. docs/realmos-package/99_audits/dogfood_realmOS_task_audit_v0_28.md

Optional durable context: `GET /api/run-state/handoff/latest` and `GET /api/run-state/next-chat-prompt/latest`

---

## Resume context (2026-06-12)

Continue from **Initiative 0.28 complete**.

**0.28 delivered:** Dogfood lifecycle on Testing & Quality Gate governance task. Dry-run dispatch only. Permanent quality gate in SSOT Section 7.1.

**Roadmap gate (hard rule):** No side projects until RealmOS base system is complete. Side-project decisions only from working RealmOS/Jarvis.

**Recommended next (RealmOS-only):** **0.29 RealmOS Base System Verification Plan** — await operator approval.

**Do not auto-start:** 0.29, GUING, side projects, UI polish, voice, autonomous execution.

**Testing & Quality Gate:** No PASS without tests or documented test gap (see CURSOR_SSOT.md Section 7.1).

```bash
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start
```
