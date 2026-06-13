# Browser E2E Readiness Audit — v0.35

| Field | Value |
|-------|-------|
| Initiative | **0.35 — Browser E2E Smoke for Command Center Core Flows** |
| Version | `0.35.0` |
| Date | 2026-06-12 |
| Verdict | **PASS** |
| Recommended next | **0.36 — Cursor IDE Exit Readiness Audit / Remaining Base-System Gaps** |

## Scope delivered

| Item | Status |
|------|--------|
| Playwright setup | **Added** — minimal config + mock API server |
| `pnpm test:e2e` | **Added** |
| CI integration | **Added** — runs after build in GitHub Actions |
| Command Center load smoke | **Covered** |
| Navigation smoke | **Covered** |
| Ask Jarvis smoke | **Covered** (stub + mock degraded) |
| Necromancer smoke | **Covered** |
| Verification Evidence smoke | **Covered** |
| Safety assertions | **Covered** |

## E2E framework summary

- **Framework:** Playwright (`@playwright/test`)
- **Primary:** Live API badge via lightweight Node mock server (no real API/Ollama/Postgres)
- **Secondary:** Mock seed mode via `next dev` + unreachable API port

## Mocked vs live boundary

| Layer | CI E2E | Manual live |
|-------|--------|-------------|
| Browser | Real Chromium | Real browser |
| Web app | Real Next.js build | Real dev/prod |
| API | **Mock server** (`e2e/mock-api-server.mjs`) | Real `@realmos/api` |
| Ollama | **Not used** (Jarvis stub) | Optional |
| Postgres | **Not required** | Optional for durable paths |

## Requirements

| Requirement | CI E2E |
|-------------|----------|
| Real Ollama | **No** |
| Postgres | **No** |
| External accounts / secrets | **No** |

## Flows covered

### A. Command Center loads
- Governance banner visible
- Live/Mock badge honest (both modes tested)
- No crash

### B. Navigation
- Sidebar clickable
- URL `?section=` updates
- Active state (`aria-current`)
- Overview, Runs, Agents render; Decisions placeholder honest

### C. Ask Jarvis
- Panel opens
- Input + safety notice
- Stub reply (live mock) or degraded error (mock seed)
- No voice/mic UI
- No execution button

### D. Necromancer
- Panel visible in Agents
- Approval checkbox + operator ID
- Pause blocked without approval
- No delete button
- Memory demo badge

### E. Verification Evidence
- Panel in Runs
- Required gates visible
- Missing evidence state
- Paste + CI attach controls
- No shell execution button

## Safety assertions

Automated in `e2e/safety-assertions.ts` and smoke specs:

- No shell execution / Cursor CLI / delete / autonomous cleanup buttons
- Side projects / GUING blocked messaging
- Jarvis cannot execute actions

## Known gaps (deferred)

1. **Full live API E2E** against real `@realmos/api` + Postgres durable paths — manual or future initiative
2. **Voice / mic** — intentionally absent; no E2E needed until explicitly scoped (blocked)
3. **Cross-browser matrix** — Chromium only in 0.35
4. **Visual regression** — out of scope
5. **Work packet lifecycle operator actions** — panel visible; full dispatch flow not browser-automated

## Base-system readiness impact

| Area | Before 0.35 | After 0.35 |
|------|-------------|------------|
| Browser E2E | **Missing** | **PARTIAL** (core smoke) |
| Navigation | PARTIAL | PARTIAL (now browser-verified) |
| Testing & Quality Gate | Active | Active (+ E2E) |
| Cursor IDE exit | FAIL | FAIL (0.36 scope) |

## Do not start 0.36 until operator explicitly approves.
