# Latest Cursor Handoff — Post Initiative 0.33

Updated: 2026-06-13

---

## Current position

| Field | Value |
|-------|--------|
| **Project version** | `0.33.0` |
| **Post-MVP complete** | 0.18–0.33 |
| **Jarvis operator chat** | **PASS** (Live API required) |
| **Necromancer operator flow** | **PASS** (Live API required) |
| **Verification evidence capture** | **PASS** (Live API required) |
| **Cursor IDE exit** | **NOT READY** |
| **Executor mode** | `dry_run` |

---

## Roadmap gate (locked)

- **Recommended next:** **0.34 — Durable Necromancer Evidence / Persistence Hardening**
- **Blocked:** GUING, side projects

**Do not start 0.34 until operator explicitly approves.**

---

## Initiative 0.33 summary

- `VerificationEvidenceRecord` contract + default verification gates
- Redaction/blocking for secrets, private keys, service account JSON, `.env` content
- API: list, summary, attach output, attach CI metadata (manual URL only)
- Postgres migration `010_verification_evidence.sql`
- Run-state `evidenceSummary` synced on attach; handoff text includes evidence line
- Command Center Runs section → Verification Evidence panel
- No shell execution, no Cursor CLI, no automatic CI scraping

---

## Initiative 0.32 summary (closed)

- Necromancer candidate detection for stale/failed/orphaned agents, tasks, work packets
- Approval-gated pause/retire/protect with audit events
- Command Center Agents section → Necromancer Operator panel
- GUING/side-project scope blocked from pause/retire
- No deletion, shell, Cursor CLI, or autonomous actions

---

## Audits

- `docs/realmos-package/99_audits/verification_evidence_readiness_audit_v0_33.md`
- `docs/realmos-package/06_operations/verification_evidence_capture_v0_33.md`
- `docs/realmos-package/99_audits/necromancer_readiness_audit_v0_32.md`
