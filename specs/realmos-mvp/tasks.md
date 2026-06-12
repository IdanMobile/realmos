# RealmOS MVP — Tasks (SpecKit historical plan)

> **Execution checklist:** Use [`SSOT_TODO_CHECKLIST.md`](../../SSOT_TODO_CHECKLIST.md) at repo root for phase execution and checkpoints. That file is the **source of truth** for what was built and approved.
>
> This file is the **original SpecKit task breakdown** from MVP planning. Reconciled 2026-06-12 after Stabilization 0.18.
>
> **Legend:** `[x]` implemented · `[~]` scaffold/partial · `[ ]` not done/deferred

## Phase 1 — Repo and Shell

- [x] T001 Create monorepo structure.
- [x] T002 Create apps/web.
- [x] T003 Create apps/api.
- [x] T004 Create packages/contracts.
- [x] T005 Create basic dashboard layout.
- [~] T006 Create Jarvis chat panel. *(API/command routes exist; no dedicated chat UI panel)*
- [x] T007 Create placeholder business/agent/task/approval panels.

## Phase 2 — Data Contracts

- [x] T008 Define Business contract.
- [x] T009 Define Agent contract.
- [x] T010 Define Task contract.
- [x] T011 Define Memory contract.
- [x] T012 Define ApprovalRequest contract.
- [x] T013 Define AuditEvent contract.
- [x] T014 Define CostEntry contract.
- [x] T015 Define WorldNode contract.

## Phase 3 — Persistence

- [~] T016 Add Postgres setup. *(migrations + postgres DB adapter exist; default is memory mode)*
- [x] T017 Add migrations.
- [x] T018 Implement business repository.
- [x] T019 Implement agent repository.
- [x] T020 Implement task repository.
- [x] T021 Implement memory repository.
- [x] T022 Implement approval repository.
- [x] T023 Implement audit repository.

## Phase 4 — Jarvis Core

- [~] T024 Implement Jarvis chat endpoint. *(command routes; not full conversational chat)*
- [~] T025 Implement command parser.
- [x] T026 Implement create-business command.
- [~] T027 Implement summarize-dashboard command.
- [x] T028 Implement memory write command.
- [x] T029 Implement decision logging.

## Phase 5 — Necromancer

- [x] T030 Define default agent templates.
- [x] T031 Implement create default business team.
- [~] T032 Implement custom agent proposal.
- [x] T033 Implement agent activation status.
- [x] T034 Implement agent scope and permissions.

## Phase 6 — SpecKit Generation

- [x] T035 Generate business spec.md.
- [x] T036 Generate plan.md.
- [x] T037 Generate tasks.md.
- [x] T038 Generate acceptance.md.
- [x] T039 Generate contract files.
- [x] T040 Store generated artifacts.

## Phase 7 — Governance

- [x] T041 Implement risk classifier.
- [x] T042 Implement forbidden action policy.
- [x] T043 Implement approval queue.
- [x] T044 Implement terminal command approval flow.
- [x] T045 Implement budget approval rules.
- [x] T046 Implement subscription hard approval gate.

## Phase 8 — Cost Tracking

- [x] T047 Implement cost records.
- [x] T048 Implement monthly budget.
- [~] T049 Implement per-business budget. *(global budget primary; business scope partial)*
- [~] T050 Implement per-agent budget. *(deferred / partial)*
- [x] T051 Implement cost dashboard widget.

## Phase 9 — World Contract

- [x] T052 Implement world map data structure.
- [x] T053 Map businesses to world nodes.
- [x] T054 Map agents to room/desk nodes.
- [x] T055 Add status fields.
- [~] T056 Render simple world map/cards. *(card preview; not game layer)*

## Phase 10 — Demo

- [x] T057 Create demo command: dating app idea.
- [x] T058 Create business.
- [x] T059 Create agents.
- [x] T060 Generate specs/tasks/risks.
- [x] T061 Show dashboard.
- [x] T062 Show approval queue.
- [x] T063 Validate memory and audit logs.

## Creator Router / Creation Council

- [x] Add CreationProposal contract.
- [x] Add Creator Router classification logic.
- [x] Classify needs as ai_agent, agentic_workflow, deterministic_module, automation_workflow, human_task, or hybrid_system.
- [x] Add tests proving simple deterministic needs do not create AI agents.
- [x] Add tests proving agent creation requires CreationProposal.
- [~] Add dashboard placeholder for Creation Proposals. *(contracts/tests; no dedicated panel)*

## Capability Scout / Tool Finder

- [x] Add CapabilityCandidate contract.
- [x] Add CapabilitySearchReport contract.
- [x] Add Capability Scout evaluation flow.
- [x] Add tests proving paid/subscription tools require approval.
- [x] Add tests proving new dependencies require a capability decision.
- [~] Add dashboard placeholder for Capability Reports. *(CapabilityScoutPanel)*
- [~] Add integration with Creator Router before build/custom-agent decisions.

## System Optimizer / Evolution Engine

- [x] Add OptimizationReport contract.
- [~] Add optimizer report generation placeholder.
- [x] Add token/cost/memory/agent/workflow optimization categories.
- [x] Add tests for recommendation requiring approval when changing cost/risk.
- [~] Add dashboard placeholder for optimization reports. *(IntelligenceOptimizerPanel)*

## Knowledge Vault / Obsidian Memory Bridge

- [x] Add KnowledgeVaultConfig contract.
- [x] Add ContextPack contract.
- [x] Add local markdown vault structure docs.
- [x] Add tests for context pack token estimate and memory refs.
- [x] Add rule: do not store secrets/API keys in vault.
- [~] Add future Obsidian sync placeholder. *(documented only)*

## Model / Platform Scout

- [x] Add ModelPlatformCandidate contract.
- [x] Add ModelRoutingDecision contract.
- [x] Add use-case based model selection placeholder.
- [x] Add tests proving higher-cost/sensitive provider changes require approval.
- [~] Add periodic re-evaluation placeholder.
- [~] Add dashboard placeholder for model routing decisions. *(ModelScoutPanel)*

## Agent Communication / Conversation Ledger

- [x] Add CommunicationThread contract.
- [x] Add AgentMessage contract.
- [x] Add CommunicationDecision contract.
- [x] Add CommunicationArchiveEntry contract.
- [x] Add message repository/API placeholder.
- [x] Add thread repository/API placeholder.
- [x] Add tests proving messages must belong to threads.
- [x] Add tests proving archived summaries preserve raw thread reference.
- [x] Add Communication UI placeholder.
- [~] Add optional markdown/Obsidian export placeholder.

## Always-On Work Loop / Self-Build Console

- [x] Add AutonomyLevel contract.
- [x] Add WorkItem contract.
- [x] Add CursorWorkPacket contract.
- [x] Add CursorCompletionReport contract.
- [x] Add ContinuousWorkPolicy contract.
- [x] Add NextBestWorkDecision contract.
- [x] Add safe-work selection service placeholder.
- [x] Add human-only gate evaluator placeholder.
- [x] Add Cursor Work Packet generator placeholder.
- [x] Add Cursor CompletionReport importer placeholder.
- [x] Add Self-Build Console UI placeholder.
- [x] Add tests for safe work continuing without user start.
- [x] Add tests for pausing on approval/user-only gates.

## Parallel Agent Fleet / Swarm Control

- [x] Add FleetLane contract.
- [x] Add CoordinationMode contract.
- [x] Add FleetCapacityPolicy contract.
- [x] Add Fleet contract.
- [x] Add Squad contract.
- [x] Add FleetRun contract.
- [x] Add WorkConflict contract.
- [x] Add ParallelWorkPlan contract.
- [x] Add fleet controller service placeholder.
- [x] Add conflict detection service placeholder.
- [x] Add capacity policy evaluator placeholder.
- [x] Add fleet dashboard UI placeholder.
- [x] Add tests for multiple controlled parallel runs.
- [x] Add tests for dependency-aware parallel plans.
- [x] Add tests that parallel work does not bypass approvals.

## Realm Scoping / Repository Boundary

- [x] Add Realm contract.
- [x] Add RealmEnvironment contract.
- [x] Add RealmAccessPolicy contract.
- [x] Add RepositoryBinding contract.
- [x] Add RepositoryOwnershipRule contract.
- [x] Add CursorRepositoryContext contract.
- [x] Add RepositoryConflict contract.
- [~] Add scope/realmId strategy to all operational contracts. *(work-loop packets; not every contract)*
- [x] Add global shell route map.
- [x] Add project shell route map.
- [~] Add repository page UI placeholder. *(RepositoryBoundaryPanel on Command Center)*
- [x] Add conflict detection checks for repository boundaries.

## Platform / Infrastructure Decisions

- [x] Add PlatformDecision contract.
- [x] Add Firebase baseline configuration placeholder.
- [x] Add M1 local node configuration placeholder.
- [x] Add GitHub source-control integration placeholder.
- [x] Add Ollama local LLM runtime placeholder.
- [x] Add ProjectInfrastructurePlan contract.
- [x] Add InfrastructureResourceRef contract.
- [x] Add InfrastructureIsolationViolation contract.
- [x] Add temporary prototype infrastructure approval flow.
- [~] Add project infrastructure page placeholder. *(ProjectInfrastructurePanel)*
- [ ] Add infra isolation gate to project creation. *(deferred — manual/check API only)*
- [~] Add infra isolation gate to Cursor Work Packet creation. *(optional enrichment on generate)*

## Post-MVP (deferred — see SSOT Post-MVP section)

Voice, browser automation, GitHub PR agents, game world UI, crypto, etc. — **not started**.
