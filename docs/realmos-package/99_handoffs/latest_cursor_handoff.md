# Latest Cursor Handoff — Post Initiative 0.23

Updated: 2026-06-12  
**Purpose:** Continue from Firebase Baseline Wiring complete.

---

## Current position (exact)

| Field | Value |
|-------|--------|
| **Project version** | `0.23.0` (`PROJECT_STATE.md`) |
| **SSOT phases** | 0–12, 6.5–6.8, 2.5–2.6 complete and approved |
| **Post-MVP initiatives complete** | 0.18–0.23 (through Firebase Baseline) |
| **Active phase** | None — await operator-scoped next initiative |
| **Strict verification** | **GREEN** |
| **GitHub CI** | Re-verify after 0.23 push |
| **Operating mode** | MVP functional; Postgres + Ollama + Firebase baseline config |

---

## Roadmap gate (locked — operator approved 2026-06-12)

**No side projects until RealmOS self-management milestone is complete.**

RealmOS still cannot fully: create work packets → dispatch to executor → monitor → verify → persist runs → handoff → human approval only when required.

| Rule | Status |
|------|--------|
| GUING bootstrap | **BLOCKED** until end-to-end work orchestration exists |
| Firebase 0.23 | Platform wiring only — **does not unlock product work** |
| Side projects / UI polish / voice | **Forbidden** until milestone |

**Recommended next initiative:** **0.24 — Local Executor / Cursor CLI Bridge**

Do **not** recommend GUING, sync-agent product work, or cosmetic UI polish as default next steps.

---

## Initiative 0.23 — Firebase Baseline Wiring (complete)

- Env: `FIREBASE_PROJECT_ID`, emulator hosts, `NEXT_PUBLIC_FIREBASE_*`
- `@realmos/platform-infra` — `firebase-config.ts`, `firebase-admin.ts`, health snapshot
- Safe Admin + web client init — graceful `not_configured`, no crash without secrets
- API health — `checks.firebase`; dashboard Firebase card
- Root `firebase.json` — emulator ports reference
- Tests: `packages/platform-infra/tests/firebase-baseline.test.ts`
- Docs: `docs/realmos-package/06_operations/firebase_baseline_setup_v0_23.md`
- Audit: `docs/realmos-package/99_audits/firebase_baseline_audit_v0_23.md`

### Intentionally not wired

- No Firestore persistence from API
- No Auth flows
- No production deploy
- No Postgres → Firebase migration

---

## Initiative 0.22 — Local Ollama (unchanged)

- Default model `llama3.2:3b`, live invoke + stub fallback

---

## Tests passing / failing

| Command | Status |
|---------|--------|
| `pnpm test` | **PASS** |
| `pnpm typecheck` | **PASS** |
| `pnpm build` | **PASS** |
| `pnpm check:clean-start` | **PASS** |
| `pnpm demo:mvp` | **PASS** |

---

## Important decisions (do not revert without operator approval)

1. **Firebase stores RealmOS orchestration only** — not project product runtime.
2. **Postgres remains local durable path** — no Firebase migration in 0.23.
3. **No secrets in repo** — service account JSON and `.env` stay local.
4. **No side projects until self-management milestone** — GUING blocked.
5. **Next infrastructure focus:** executor / Cursor CLI bridge (0.24).

---

## Exact next task

```text
Await operator approval to start Initiative 0.24 — Local Executor / Cursor CLI Bridge.
```

---

## Resume instructions

1. Read `CURSOR_SSOT.md` → this file → `PROJECT_STATE.md`
2. Run strict verification
3. Firebase optional — unset `FIREBASE_PROJECT_ID` is normal
4. Do not start GUING or side projects without explicit milestone completion + operator scope

---

## Audits (newest first)

- `docs/realmos-package/99_audits/firebase_baseline_audit_v0_23.md`
- `docs/realmos-package/99_audits/ollama_local_node_audit_v0_22.md`
- `docs/realmos-package/99_audits/postgres_ci_smoke_audit_v0_21.md`
