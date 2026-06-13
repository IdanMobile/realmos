# Verification Evidence Capture — Initiative 0.33

Prepared: 2026-06-13  
Purpose: Capture operator-provided and CI-linked verification evidence for work packets and run-state, without automatic shell execution.

## Summary

| Area | Status |
|------|--------|
| Evidence contract (`VerificationEvidenceRecord`) | **PASS** |
| Redaction + secret blocking | **PASS** |
| Attach/list/summary API | **PASS** |
| Postgres durability (migration 010) | **PASS** |
| Run-state / handoff evidence summary | **PASS** |
| Command Center evidence panel | **PASS** |
| Automatic shell / Cursor CLI execution | **BLOCKED** |
| Automatic CI scraping | **Not implemented** (manual URL/metadata only) |

## Evidence model

Each record includes:

- `id`, `workPacketId`, `runStateId`, `dispatchId` (optional)
- `initiativeId`, `gateId`, `commandName`, `expectedCommand`
- `reportedStatus` (`pass` | `fail` | `skipped` | `not_run`)
- `outputText`, `outputSummary`, `outputHash`
- `startedAt`, `completedAt`, `capturedAt`, `durationMs`
- `environment` (`local`, `ci`, `postgres_smoke`, `demo`, `manual_smoke`)
- `ciProvider`, `ciRunUrl`, `commitSha`, `branch`
- `operatorId`, `source` (`operator`, `ci_manual`, `system`)
- `artifactRefs`, `notes`, `warnings`, `gaps`
- `redactionApplied`, `redactionBlocked`, `blockReason`

Default gates: `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm check:clean-start`, `pnpm demo:mvp`, `pnpm test:postgres`, `manual_smoke`.

Gate overall statuses:

- `pass_with_evidence`
- `pass_reported_missing_evidence`
- `fail_with_evidence`
- `not_run`
- `manual_only`

## Redaction and safety

Before persistence:

- Redact obvious secret assignments (`api_key=`, `token=`, etc.)
- Redact `DATABASE_URL=postgres://...`
- **Block** private key PEM blocks
- **Block** service account JSON (`"type": "service_account"`)
- **Block** `.env`-like content
- Record `redactionApplied` when redaction occurred
- Never persist raw blocked content

## API

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/verification/evidence` | List evidence (filter by packet/run-state/initiative) |
| GET | `/api/verification/evidence/summary` | Gate summary + missing required gates |
| POST | `/api/verification/evidence` | Attach pasted command output (redacted) |
| POST | `/api/verification/evidence/ci` | Attach CI run URL + optional commit SHA |

Attaching evidence syncs run-state `evidenceSummary` and rebuilds handoff text when a source packet exists.

**No** delete endpoint. **No** shell execution endpoint. **No** automatic CI fetch.

## Persistence

- Memory operational adapter (local demo)
- Postgres table `operational_verification_evidence` (migration `010_verification_evidence.sql`)

## Command Center UI

**Runs** section → **Verification Evidence** panel:

- Required gates with status badges
- Missing required gates list
- Paste command output (redacted before save)
- Attach CI metadata (URL + commit SHA)
- Redaction / safety notice
- **No shell execution button**

Honest labels: pass with evidence vs pass reported with missing evidence vs fail with evidence vs not run vs manual only.

## Manual smoke

```bash
pnpm --filter @realmos/api dev
pnpm --filter @realmos/web dev
# open http://localhost:3000 — Runs section → Verification Evidence
# select a lifecycle work packet, paste output for one gate, attach CI URL optional
curl "http://localhost:4100/api/verification/evidence/summary?initiativeId=0.33&workPacketId=<packet-id>"
```

Requires live API and a selected work packet.

## Future (not 0.33)

- Approved executor capability for optional command capture (operator-approved only)
- Playwright E2E for evidence attach flow
- Automatic CI webhook ingestion (requires secrets / external config)

## Recommended next

**0.34 — Durable Necromancer Evidence / Persistence Hardening** — await operator approval.

Do not start GUING, side projects, voice, shell, or Cursor CLI automation.
