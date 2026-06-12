Read CURSOR_SSOT.md and follow it exactly.

Then read in order:

1. docs/realmos-package/99_handoffs/latest_cursor_handoff.md
2. PROJECT_STATE.md
3. SSOT_TODO_CHECKLIST.md
4. docs/realmos-package/99_audits/firebase_baseline_audit_v0_23.md
5. VERIFICATION_COMMANDS.md

---

## Resume context (2026-06-12)

Continue from Initiative **0.23 complete** — do not restart Phase 0 or SSOT bootstrap.

**Completed through Initiative 0.23:**

- SSOT phases 0–12, 6.5–6.8, 2.5–2.6 (approved)
- 0.18–0.22 (stabilization, Postgres, CI, Ollama)
- **0.23 Firebase Baseline Wiring** — env config, health, safe init; no production deploy

**Roadmap gate (locked):**

- **No side projects** until RealmOS self-management milestone is complete
- **GUING bootstrap is BLOCKED** until RealmOS orchestrates real work end-to-end
- **Firebase 0.23** is platform wiring only — does not unlock product work
- **Recommended next:** **0.24 — Local Executor / Cursor CLI Bridge**

**Do not auto-start:** GUING, side projects, UI polish, voice, Firebase production deploy.

---

## First actions

1. Confirm workspace root is `realmos/`.
2. Run strict verification.
3. Report PASS/FAIL; await operator scope for 0.24 only.

```bash
export PATH="$HOME/.local/node-v22.16.0-darwin-arm64/bin:$PATH"
pnpm test && pnpm typecheck && pnpm build && pnpm check:clean-start
```
