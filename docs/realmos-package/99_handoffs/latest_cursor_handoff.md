# Latest Cursor Handoff — Post Initiative 0.34

Updated: 2026-06-13

---

## Current position

| Field | Value |
|-------|--------|
| **Project version** | `0.34.0` |
| **Post-MVP complete** | 0.18–0.34 |
| **Jarvis operator chat** | **PASS** (Live API required) |
| **Necromancer operator flow** | **PASS** (Live API + durable persistence in Postgres mode) |
| **Verification evidence capture** | **PASS** (Live API required) |
| **Cursor IDE exit** | **NOT READY** |
| **Executor mode** | `dry_run` |

---

## Roadmap gate (locked)

- **Recommended next:** **0.35 — Browser E2E Smoke for Command Center Core Flows**
- **Blocked:** GUING, side projects

**Do not start 0.35 until operator explicitly approves.**

---

## Initiative 0.34 summary

- Postgres migration `011_necromancer_persistence.sql`
- Durable protect registry + operator action history (applied + blocked)
- Optional `evidenceId` link to 0.33 verification evidence records
- GET `/api/necromancer/status` exposes persistence mode
- Command Center shows Durable Postgres vs Memory demo badge
- No delete endpoint, no automatic cleanup, approval gates preserved

---

## Initiative 0.33 summary (closed)

- Verification evidence model, redaction, API, Postgres durability, Command Center evidence panel
- No automatic shell execution or CI scraping

---

## Audits

- `docs/realmos-package/99_audits/durable_necromancer_readiness_audit_v0_34.md`
- `docs/realmos-package/06_operations/durable_necromancer_persistence_v0_34.md`
- `docs/realmos-package/99_audits/verification_evidence_readiness_audit_v0_33.md`
