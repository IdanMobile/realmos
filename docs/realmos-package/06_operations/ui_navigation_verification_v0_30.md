# UI / Navigation Verification — Initiative 0.30

Prepared: 2026-06-12  
Purpose: Evidence-first verification of RealmOS web UI/navigation against locked references, with minimum safe navigation fixes.

## Summary

| Area | Before 0.30 | After 0.30 |
|------|-------------|------------|
| Sidebar navigation | **FAIL** — decorative only | **PARTIAL** — query-param section nav (`?section=`) |
| UI reference comparison | **BLOCKED** — assets missing | **BLOCKED** — assets still missing |
| Search | Looked functional, was not | **PASS** — disabled + labeled |
| Ask Jarvis | Looked functional, was not | **PASS** — disabled + labeled (0.31) |
| Decisions section | Not present | **PASS** — explicit placeholder |
| Safety visibility | Partial (lifecycle panel only) | **PARTIAL** — governance banner on all sections |
| Cursor IDE exit | **FAIL** | **FAIL** — Jarvis chat + visual regression still missing |

---

## 1. UI reference asset inventory

### Expected (from `UI_MOCKUPS_INDEX.md`)

| # | Screen | Expected path |
|---|--------|---------------|
| 1 | Overview | `assets/ui-mockups/clean/01_overview_clean.png` |
| 2 | Realms | `assets/ui-mockups/clean/02_realms_clean.png` |
| 3 | Tasks | `assets/ui-mockups/clean/03_tasks_clean.png` |
| 4 | Live Runs | `assets/ui-mockups/clean/04_runs_clean.png` |
| 5 | Agents | `assets/ui-mockups/clean/05_agents_clean.png` |
| 6 | Communications | `assets/ui-mockups/clean/06_communications_clean.png` |
| 7 | Memory | `assets/ui-mockups/clean/07_memory_clean.png` |
| 8 | Artifacts | `assets/ui-mockups/clean/08_artifacts_clean.png` |
| 9 | Decisions | `assets/ui-mockups/clean/09_decisions_clean.png` |
| 10 | Errors | `assets/ui-mockups/clean/10_errors_clean.png` |
| 11 | Audit Logs | `assets/ui-mockups/clean/11_audit_logs_clean.png` |

Also documented under `assets/ui-references/01_core_pages_clean/` and master board  
`assets/ui-references/00_master_boards/full_ui_coverage_master_board_v1.png`.

### Found in repo (2026-06-12)

| Path | Status |
|------|--------|
| `assets/ui-references/02_communication/thread_detail_full/api_contract_discussion_dashboard_overview.png` | **Present** (1 PNG) |
| `assets/ui-references/05_generation_specs/*.md` | **Present** (specs only) |
| All other locked PNGs | **Missing** |

**Comparison possible now:** No — pixel comparison blocked until operator restores PNGs to documented paths.

### Restoration checklist (operator action)

1. Restore `assets/ui-mockups/clean/` (11 files) OR copy into `assets/ui-references/01_core_pages_clean/<screen>/`.
2. Restore master board PNG.
3. Optionally restore `04_reference_slices_from_master_board/` strips.
4. Commit assets (verify size; use Git LFS if needed).
5. Run future visual regression (Initiative 0.33+).

---

## 2. Navigation implementation (0.30)

### Mechanism

- **URL query state:** `/?section=<id>` (default `overview` when omitted).
- **Sidebar:** 10 IA labels; click updates URL via `router.replace`.
- **Top bar:** Section title follows active section.
- **Sections with real panels:** overview, realms, tasks, runs, agents, communications, memory, artifacts, audit.
- **Placeholder:** decisions (`implemented: false` in `sections.ts`).

### Code map

| File | Role |
|------|------|
| `apps/web/src/lib/navigation/sections.ts` | Section IDs, labels, reference paths |
| `apps/web/src/lib/navigation/useCommandCenterSection.ts` | URL sync hook |
| `apps/web/src/components/CommandCenterSectionContent.tsx` | Per-section panel layout |
| `apps/web/src/components/layout/GovernanceSafetyBanner.tsx` | Safety/governance banner |
| `apps/web/src/components/layout/SectionPlaceholder.tsx` | Not-implemented state |

### Search / Ask Jarvis

- **Search:** disabled input, `aria-disabled`, title explains not implemented.
- **Ask Jarvis:** disabled button labeled `Ask Jarvis (0.31)`.

---

## 3. Future visual regression plan

When reference PNGs are restored:

1. Add Playwright E2E per section (`?section=tasks`, etc.).
2. Capture screenshots at fixed viewport (e.g. 1440×900).
3. Compare against locked PNGs with tolerance threshold OR manual operator checklist.
4. Track in CI as optional job (not blocking until assets committed).

---

## 4. Verification commands

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm check:clean-start
pnpm demo:mvp
pnpm test:postgres
```

Manual smoke:

```bash
pnpm --filter @realmos/web dev
# Open http://localhost:3000/?section=tasks
# Click sidebar items; confirm URL + section content change
```

---

## 5. Recommended next

**0.31 — Jarvis Interaction Path Verification / Chat UI** (await operator approval).
