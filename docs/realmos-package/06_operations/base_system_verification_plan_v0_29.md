# RealmOS Base System Verification Plan — Initiative 0.29

Prepared: 2026-06-12  
Purpose: Define how to verify the RealmOS base system before the operator moves from Cursor IDE to RealmOS as the primary operating surface.

## Executive summary

RealmOS has **strong backend foundations** (lifecycle, executor dry-run, run-state, Postgres CI, Ollama, governance) and a **single-page Command Center** with many panels. It is **not yet base-ready** as a Cursor replacement because:

- Navigation is **non-functional** (sidebar labels only; no routed pages).
- UI reference assets are **mostly absent from the repo** (docs index exists; PNGs missing).
- **No Jarvis chat UI** — API exists; web button is inert.
- **Necromancer has API + tests** but no Command Center operator UI.
- **Verification evidence** is mostly operator-reported; no browser E2E or screenshot diff.
- **Real Cursor CLI execution** is intentionally absent (dry-run only).

Recommended next: **0.30 — UI / Navigation Verification Against Locked References**.

---

## 1. Base-system verification matrix

| Area | Status | Evidence | Notes |
|------|--------|----------|-------|
| Command Center | **PARTIAL** | Single `/` dashboard; 20+ panels; component tests | All content on one scroll page; not split like locked references |
| Navigation | **FAIL** | `SidebarNav.tsx` | Buttons non-routing; only Overview styled active |
| UI vs locked references | **NEEDS MANUAL VERIFICATION** | `UI_MOCKUPS_INDEX.md`, `UI_REFERENCE_LOCK.md` | Most PNG assets **not in repo**; manual compare blocked until assets restored |
| Jarvis local interaction | **PARTIAL** | `/api/jarvis/chat`, `/api/models/invoke`, health | API + demo:mvp; **no web chat UI**; "Ask Jarvis" inert |
| Local Ollama health/invoke | **PASS** | Health check, `@realmos/llm-router`, CI | `pnpm demo:mvp` invokes Ollama when available |
| Necromancer | **PARTIAL** | `@realmos/agents`, `/api/necromancer/*`, 9 tests | API + lifecycle logic; **no CC UI**; pause/retire via API |
| Work packet lifecycle | **PASS** | 0.25–0.28, API integration tests | Full state machine; GUING blocked |
| Executor bridge | **PASS** | Dry-run queue, 0.24 tests | No shell; approval required |
| Run monitor | **PARTIAL** | `WorkPacketTaskMonitorPanel` | Live API actions; no live polling of external processes |
| Durable run-state / handoff | **PASS** | 0.27, persistence tests | Memory + Postgres; ephemeral if memory API |
| Approvals | **PARTIAL** | `ApprovalQueuePanel`, governance tests | Approve/reject wired to API; lifecycle approval separate flow |
| Verification reporting | **PARTIAL** | Lifecycle verification record, operator-entered | No automatic command output capture |
| Memory / state persistence | **PARTIAL** | MVP DB + operational stores | Business data + lifecycle/run-state; not all CC panels persisted |
| Postgres durability | **PASS** | Migration 001–009, `pnpm test:postgres`, CI | Operational tables round-trip |
| Firebase baseline | **PASS** (platform) | `@realmos/platform-infra`, health `not_configured` | Wiring only; no product unlock |
| Safety / governance | **PASS** | `@realmos/governance`, lifecycle validators | GUING/side-project blocks; no shell by default |
| Testing & Quality Gate | **PASS** | CURSOR_SSOT §7.1, 0.28 | Documented and enforced in audits |
| No-side-project gate | **PASS** | CURSOR_SSOT §5, run-state validators | Locked across SSOT/handoffs |
| Handoff / new-chat flow | **PARTIAL** | Repo markdown + durable run-state API | Durable state not auto-written to repo files |
| CI / local verification | **PASS** | GitHub Actions, VERIFICATION_COMMANDS | test/typecheck/build/test:postgres |
| Cursor IDE exit readiness | **FAIL** | This audit | Operator still needs Cursor for code + chat |

**Legend:** PASS = verified green; PARTIAL = works with gaps; FAIL = blocking gap; NOT IMPLEMENTED = missing; NEEDS MANUAL VERIFICATION = requires operator/visual check.

---

## 2. UI / navigation verification plan

### Current web app

| Item | Status |
|------|--------|
| Routes | **Single page** — `apps/web/src/app/page.tsx` → Command Center only |
| Sidebar items | overview, realms, tasks, runs, agents, communications, memory, artifacts, decisions, audit |
| Sidebar behavior | **Decorative** — no `href`, no router, no state change |
| Top bar | Search (no handler), "Ask Jarvis" (no handler), Live API / Mock badge |

### Locked reference inventory (documented)

From `UI_MOCKUPS_INDEX.md` / `UI_REFERENCE_ORGANIZATION.md`:

| Expected screen | Reference path (documented) | Implemented as separate page? |
|-----------------|----------------------------|----------------------------|
| Overview / Command Center | `01_core_pages_clean/overview/` | **Yes** (single scroll dashboard) |
| Realms | `realms/` | **No** — panel only (`RepositoryBoundaryPanel`) |
| Tasks | `tasks/` | **No** — `TaskStatusPanel` on overview |
| Live Runs | `runs/` | **No** — lifecycle monitor panel |
| Agents | `agents/` | **No** — `ActiveAgentsPanel` |
| Communications | `communication_archive/` | **No** — thread panels on overview |
| Memory | `memory/` | **No** — `MemoryPanel` |
| Artifacts | `artifacts/` | **No** — `SpecKitArtifactsPanel` |
| Decisions | `decisions/` | **Not implemented** |
| Errors | `errors/` | **Not implemented** |
| Audit Logs | `audit_logs/` | **No** — `RecentActivityPanel` partial |

### Assets in repo (actual)

```text
assets/ui-references/02_communication/thread_detail_full/api_contract_discussion_dashboard_overview.png
assets/ui-references/05_generation_specs/*.md
```

Most locked PNGs referenced in docs are **not committed**. Restore or re-export before pixel comparison.

### Verification approach (0.30+)

1. Restore `assets/ui-references/01_core_pages_clean/` PNGs (or confirm external storage).
2. Add Playwright/visual regression OR manual screenshot checklist per screen.
3. Implement Next.js routes matching sidebar IDs (minimum: overview + tasks + runs + agents).
4. Compare: shell (sidebar, top bar), card density, typography, accent colors per `UI_REFERENCE_LOCK.md`.
5. Acceptable readiness: **functional navigation** + **visual parity on core 5 screens** (overview, tasks, runs, agents, communications) before Cursor exit milestone.

---

## 3. Jarvis verification plan

### Current state

| Check | Status | How to verify |
|-------|--------|---------------|
| Ollama health | PASS | `GET /api/health` → `checks.ollama` |
| Default model | PASS | env `OLLAMA_DEFAULT_MODEL` / health field |
| Model invoke | PASS | `POST /api/models/invoke`; `pnpm demo:mvp` |
| Fallback | PASS | Stub when Ollama unreachable (health shows `fallbackActive`) |
| Jarvis chat API | PASS | `POST /api/jarvis/chat` |
| Create business command | PASS | `POST /api/jarvis/commands/create-business-from-idea`; demo:mvp |
| Web chat UI | **NOT IMPLEMENTED** | No input bound to `/api/jarvis/chat` |
| "Ask Jarvis" button | **NOT IMPLEMENTED** | `TopCommandBar.tsx` — no handler |
| Jarvis briefing panel | PARTIAL | Static greeting/items from dashboard data |
| Talk + manage tasks | **FAIL** | No unified operator chat surface |

### 0.31 Jarvis interaction flow (proposed)

- Wire chat panel to `/api/jarvis/chat` with governance-safe defaults (`execute: false` by default).
- Show model routing decision + cost in UI.
- Link chat actions to work packet creation (optional).
- Manual verification: operator sends text, receives response, no shell auto-exec.

---

## 4. Necromancer verification plan

### Purpose (from docs)

Agent Creator and Optimizer — templates, reuse check, custom proposals, lifecycle (pause/retire), governance before activation.

### Current implementation

| Component | Location | Tests |
|-----------|----------|-------|
| Default team templates | `packages/agents` | 9 tests in `necromancer.test.ts` |
| Creation proposal | `createCreationProposal` | tested |
| Prepare agent | `prepareAgentCreationFromProposal` | tested |
| Pause / retire | API `/api/agents/:id/pause|retire` | tested |
| Necromancer routes | `/api/necromancer/proposals/classify`, `/agents/prepare` | API integration partial |
| Command Center UI | World node label only | **No operator panel** |

### Gaps before base-ready

- No CC workflow for classify → prepare → approve → activate.
- No visual agent lifecycle board.
- Creator Router integration visible only in backend packages.

### 0.32 verification (proposed)

- API smoke: classify proposal → prepare (no persist) → pause/retire round-trip.
- Add minimal Necromancer panel or extend Agents panel with lifecycle actions.
- Document governance gates in operator guide.

---

## 5. Self-management readiness

| Capability | Real | Mock | Manual | Missing |
|------------|------|------|--------|---------|
| Create work packet | API ✓ | — | script ✓ | CC form ✗ |
| Approve packet | API ✓ | — | CC panel ✓ | — |
| Dispatch dry-run | API ✓ | — | CC panel ✓ | — |
| Show queue artifact | API path in response | — | filesystem ✓ | CC display partial |
| Record result | API ✓ | — | CC panel ✓ | — |
| Attach verification | API ✓ | — | CC panel ✓ | auto-capture ✗ |
| Create run-state | API ✓ | — | CC panel ✓ | auto on create ✗ |
| Handoff summary | API ✓ | — | CC panel ✓ | repo file sync ✗ |
| Next initiative | run-state ✓ | — | CC panel ✓ | — |
| Command Center control | Live API mode ✓ | mock disables actions | 0.28 dogfood ✓ | packet create UI ✗ |

**0.28 dogfood:** PASS via API/script on governance-only task (memory DB).

---

## 6. Evidence capture gaps

| Evidence type | Current | Gap |
|---------------|---------|-----|
| Operator-reported verification | Lifecycle `/verification` endpoint | No structured command log attachment |
| Test output | CI + local pnpm | Not auto-linked to run-state |
| CI status | GitHub Actions | Not ingested into RealmOS |
| API state | Health + lifecycle + run-state | Ephemeral in memory mode |
| Queue artifacts | `.realmos/executor-queue/` | Gitignored; not surfaced in CC file viewer |
| Screenshot comparison | — | **Missing** |
| Browser E2E | Component tests only | **Missing** full flows |
| Cursor CLI execution | — | **By design** blocked (dry-run only) |

**0.33 Verification evidence capture** should address: command output blobs in run-state, CI webhook or manual import, optional Playwright E2E for lifecycle approval flow.

---

## 7. Testing & Quality Gate audit

| Location | Present? |
|----------|----------|
| `CURSOR_SSOT.md` §7.1 | **Yes** — locked 0.28 |
| `VERIFICATION_COMMANDS.md` | **Yes** |
| `PROJECT_STATE.md` | **Yes** |
| `SSOT_TODO_CHECKLIST.md` | **Yes** |
| Initiative audits 0.18–0.28 | **Yes** — gaps documented |

**0.29 compliance:** Docs-only initiative; no new runtime behavior; no new tests required (documented in audit). Full verification suite run before PASS.

**No active initiative violates the gate.**

---

## 8. Proposed RealmOS-only roadmap (post-0.29)

| Initiative | Focus |
|------------|--------|
| **0.30** | UI / navigation verification vs locked references |
| **0.31** | Jarvis interaction flow (chat UI + safe invoke) |
| **0.32** | Necromancer verification / operator UI |
| **0.33** | Verification evidence capture (command logs, CI link) |
| **0.34** | Command Center task creation form + operator flow hardening |
| **0.35** | Safe local executor consumer design (still no auto-exec without approval) |
| **Milestone** | RealmOS replaces Cursor IDE as primary operator surface |

**Blocked:** GUING, all side projects, product bootstrap, autonomous execution, Cursor CLI auto-invoke.

---

## Verification commands (0.29)

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm check:clean-start
pnpm demo:mvp
pnpm test:postgres
```

Manual checks (optional):

```bash
curl http://localhost:4100/api/health | jq '.checks'
curl http://localhost:4100/api/lifecycle/status
curl http://localhost:4100/api/run-state/status
```
