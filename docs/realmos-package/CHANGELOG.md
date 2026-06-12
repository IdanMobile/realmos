# Changelog

## v0.2.0 — 2026-06-07 18:47

Added deeper build foundation:
- RealmOS constitution
- MVP scope lock
- implementation phases
- API surface draft
- database schema draft
- governance and approval policy
- memory strategy
- LLM routing strategy
- local dedicated machine setup plan
- first demo scenario
- expanded Cursor prompts
- additional Mermaid diagrams

## v0.3.0 — 2026-06-07 18:48

Added build-ready scaffolding and quality strategy:
- suggested repo tree
- package responsibilities
- environment variables
- local development setup
- testing strategy
- acceptance test matrix
- first database seed plan
- UI screen inventory
- dashboard component map
- artifact storage strategy
- run/event model
- initial backlog ordering
- additional Cursor prompts for API, database, UI and tests

## v0.4.0 — 2026-06-07 18:49

Added starter implementation assets:
- starter repo README
- package.json/pnpm/turbo templates
- TypeScript contract starter files
- mock seed data JSON
- first demo generated business example
- service pseudocode for create-business flow
- governance implementation pseudocode
- world contract sample JSON
- artifact examples for Real Time Dating App demo

## v0.5.0 — 2026-06-07 18:50

Added professional project hardening:
- threat model
- privacy/security policy
- first architecture decision records
- operator guide
- AI IDE execution guide
- development guidelines
- Definition of Done
- release/versioning plan
- open questions register
- product principles

## v0.6.0 — 2026-06-07 21:59

Added Cursor-readiness control layer:
- single source of truth TODO checklist
- nested task index and phase gate model
- TDD + ADD development workflow
- explicit STOP CHECK areas
- Cursor operating protocol
- verification commands and quality gates
- done criteria per phase
- build sequence with checkpoint reviews
- root-level START_HERE_FOR_CURSOR.md

## v0.7.0 — 2026-06-07 22:10

Added explicit SpecKit execution layer for Cursor:
- dedicated SpecKit operating guide
- SpecKit folder ownership and command mapping
- SpecKit phase workflow
- SpecKit + ADD + TDD integration rules
- root START_HERE updated to force SpecKit reading order
- Cursor prompt specifically for SpecKit-driven implementation

## v1.3.0 — 2026-06-10 10:30

Locked the approved clean UI direction and added the generated reference screens to the package:
- 11 clean UI mockups added under `assets/ui-mockups/clean/`
- mirrored UI mockups under `docs/realmos-package/09_images/ui-clean/`
- added `UI_MOCKUPS_INDEX.md` for quick Cursor guidance
- added `ui_mockups_lock_v1.md` as the visual lock document

## v1.4.0 — 2026-06-10 10:51

Locked and organized the full UI reference system:
- added full UI coverage master board
- organized core full-size clean screenshots into per-page folders
- added communication-specific references
- added high-detail existing screenshots
- added cropped reference strips from the master board
- added UI reference lock and organization docs
- added missing UI generation batches and prompt template

## v1.5.0 — 2026-06-10 11:02

Added the Always-On Work Loop and RealmOS Self-Build Console:
- continuous safe work policy
- autonomy levels
- WorkItem contract
- CursorWorkPacket contract
- CursorCompletionReport contract
- ContinuousWorkPolicy contract
- NextBestWorkDecision contract
- SpecKit requirements FR-39 to FR-44
- Acceptance Gate O
- SSOT Phase 6.7

## v1.6.0 — 2026-06-10 11:04

Added Parallel Agent Fleet / Swarm Control:
- governed fleet model
- lanes and squads
- coordination modes
- capacity policy
- conflict detection model
- FleetRun and ParallelWorkPlan contracts
- SpecKit requirements FR-45 to FR-50
- Acceptance Gate P
- SSOT Phase 6.8

## v1.7.0 — 2026-06-10 11:10

Clean-start audit and cleanup:
- renamed outer package folder from `realmos_cursor_ready_v0_8` to `realmos_cursor_ready_v1_7`
- added `CLEAN_START_GUIDE.md`
- added `PACKAGE_AUDIT_REPORT.md`
- added `packages/contracts/package.json`
- added local `tsconfig.json` files for all apps/packages
- added missing root dependencies/devDependencies for Fastify, tsx, Vitest, TypeScript and Node types
- consolidated contract test imports
- updated docs manifest to version 1.7.0
- added `pnpm check:clean-start`

## v1.8.0 — 2026-06-10 12:29

Added Realm Scoping Architecture and Repository Boundary Strategy:
- global RealmOS layer vs project/realm ecosystem layer
- Realm internal concept with Project as user-facing label
- realm-local agents/tasks/workflows/runs/communication/memory/artifacts/decisions/data/settings
- repository bindings per realm
- Cursor repository context required for work packets
- repository conflict model
- SpecKit requirements FR-51 to FR-58
- Acceptance Gate Q
- SSOT Phase 2.5

## v1.9.0 — 2026-06-10 13:53

Locked platform and infrastructure decisions:

- Firebase is the primary RealmOS cloud platform.
- M1 Pro MacBook is the local Jarvis/execution node.
- GitHub is the source-control platform.
- Ollama is the local LLM runtime.
- Supabase, Neon, Vercel, Render, Fly, Railway, BigQuery, and Cloud Run are delayed until justified.
- RealmOS infrastructure is for orchestration.
- Each project/app must own dedicated runtime infrastructure.
- Temporary project prototype use of RealmOS resources requires explicit approval and exit plan.
- Added PlatformDecision contract.
- Added ProjectInfrastructurePlan contract.
- Added InfrastructureIsolationViolation contract.
- Added Gate R.
- Added SSOT Phase 2.6.

## v1.10.0 — 2026-06-12 11:09

Launch-ready cleanup:
- Added START_HERE_SINGLE_CURSOR_PROMPT.md.
- Added LAUNCH_READINESS_CHECKLIST.md.
- Replaced NEXT_CURSOR_PROMPT.md with the launch-ready Phase 0 prompt.
- Aligned root package.json version to 1.10.0.
- Normalized contract test imports to the top of the file.
- Updated README_UNZIP_AND_OPEN.md with exact clean-start instructions.

## v1.11.0 — 2026-06-12 11:15

Cursor SSOT cleanup:
- Added `CURSOR_SSOT.md` as the single Cursor-facing source of truth.
- Simplified `CURSOR_READ_THIS_FIRST.md`.
- Updated `START_HERE_SINGLE_CURSOR_PROMPT.md` and `NEXT_CURSOR_PROMPT.md` to point to `CURSOR_SSOT.md`.
- Updated root README with the exact one-line Cursor prompt.
- Aligned package version to 1.11.0.

## v1.12.0 — 2026-06-12 11:19

Full ZIP audit cleanup:
- Removed misleading startup/read-order conflicts from launch-facing docs.
- Updated launch checklist to v1.12 paths.
- Updated root README and repo README to point to `CURSOR_SSOT.md`.
- Deprecated `START_HERE_FOR_CURSOR.md` as active control document.
- Corrected `VERIFICATION_COMMANDS.md` to match actual workspace package names and absence of web app.
- Updated manifests to use `realmos/CURSOR_SSOT.md` as cursor start file.
- Aligned `packages/contracts/package.json` version to 1.12.0.

## v1.13.0 — 2026-06-12 11:20

Full ZIP docs-package cleanup:
- Deprecated docs-package START_HERE as active Cursor instruction.
- Synchronized docs-package verification commands with root verification commands.
- Updated docs-package execution guide files to point to `CURSOR_SSOT.md`.
- Aligned manifests and package versions to 1.13.0.

## v1.14.0 — 2026-06-12 11:20

Final launch audit alignment:
- Active launch docs aligned to v1.14.
- Manifests and package versions aligned to 1.14.0.
- Verification command title aligned to v1.14.

