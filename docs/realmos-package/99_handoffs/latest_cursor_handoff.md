# Latest Cursor Handoff — Post Initiative 0.32

Updated: 2026-06-13

---

## Current position

| Field | Value |
|-------|--------|
| **Project version** | `0.32.0` |
| **Post-MVP complete** | 0.18–0.32 |
| **Jarvis operator chat** | **PASS** (Live API required) |
| **Necromancer operator flow** | **PASS** (Live API required) |
| **Cursor IDE exit** | **NOT READY** |
| **Executor mode** | `dry_run` |

---

## Roadmap gate (locked)

- **Recommended next:** **0.33 — Verification Evidence Capture**
- **Blocked:** GUING, side projects

**Do not start 0.33 until operator explicitly approves.**

---

## Initiative 0.32 summary

- Necromancer candidate detection for stale/failed/orphaned agents, tasks, work packets
- Approval-gated pause/retire/protect with audit events
- Command Center Agents section → Necromancer Operator panel
- GUING/side-project scope blocked from pause/retire
- No deletion, shell, Cursor CLI, or autonomous actions

---

## Initiative 0.31 summary (closed)

- `POST /api/jarvis/chat` with `mode: "operator"` — Ollama-backed replies + routing metadata
- Ask Jarvis opens chat panel; disabled in mock-only mode
- Safety blocks shell/Cursor CLI/dispatch/GUING bootstrap
- No action execution from chat

---

## Audits

- `docs/realmos-package/99_audits/necromancer_readiness_audit_v0_32.md`
- `docs/realmos-package/06_operations/necromancer_operator_flow_v0_32.md`
- `docs/realmos-package/99_audits/jarvis_chat_readiness_audit_v0_31.md`
