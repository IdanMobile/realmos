# RealmOS — Single Source of Truth TODO Checklist

This is the **main execution checklist**.

Cursor and all future agents should follow this file as the source of truth.

## Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked / needs decision
- `[STOP]` Mandatory review/checkpoint

---

# Phase 0 — Project Intake and Setup

## Goal

Create the actual repo from the starter package and confirm the project can run locally.

## Tasks

- [x] P0.01 Create real repo from `11_starter_repo_template`.
- [x] P0.02 Initialize pnpm workspace.
- [x] P0.03 Add TypeScript config.
- [x] P0.04 Add lint/typecheck/test scripts.
- [x] P0.05 Add `.env.example`.
- [x] P0.06 Add README with local run instructions.
- [x] P0.07 Add package references.
- [x] P0.08 Confirm `pnpm install` works.
- [x] P0.09 Confirm `pnpm typecheck` works.
- [x] P0.10 Confirm `pnpm test` baseline works.

## Tests First

- [x] Add basic test runner sanity test.
- [x] Add contracts import sanity test.

## Done Criteria

- repo installs
- scripts exist
- empty tests run
- contracts package can be imported

## [STOP] CHECKPOINT 0 — Setup Review

Before moving on, verify:

```bash
pnpm install
pnpm typecheck
pnpm test
```

Expected:

- no install errors
- no TypeScript errors
- tests pass

---

# Phase 1 — Contracts First

## Goal

Implement central TypeScript contracts.

## Tasks

- [x] P1.01 Implement `Business` contract.
- [x] P1.02 Implement `Agent` contract.
- [x] P1.03 Implement `Task` contract.
- [x] P1.04 Implement `Memory` contract.
- [x] P1.05 Implement `ApprovalRequest` contract.
- [x] P1.06 Implement `AuditEvent` contract.
- [x] P1.07 Implement `Budget` contract.
- [x] P1.08 Implement `CostEntry` contract.
- [x] P1.09 Implement `WorldMap` contract.
- [x] P1.10 Implement `Run` contract.
- [x] P1.11 Implement `Artifact` contract.
- [x] P1.12 Export all from `packages/contracts/src/index.ts`.
- [x] P1.13 Add mock factory helpers.
- [ ] P1.14 Add validation schemas if using Zod.
- [x] P1.15 Implement `CreationProposal` contract.
- [x] P1.16 Implement `CapabilitySearchReport` contract.
- [x] P1.17 Implement `OptimizationReport`, `KnowledgeVaultConfig`, `ContextPack`, and `ModelRoutingDecision` contracts.
- [x] P1.18 Implement communication ledger contracts.

## TDD Tests

- [x] Test default Business factory.
- [x] Test default Agent factory has no dangerous permissions.
- [x] Test ApprovalRequest supports subscription approval.
- [x] Test Memory requires scope.
- [x] Test WorldNode references valid ref types.

## Done Criteria

- contracts are explicit
- no `any` unless justified
- factory tests pass
- dangerous permission defaults are safe

## [STOP] CHECKPOINT 1 — Contract Review

Verify:

```bash
pnpm typecheck
pnpm test packages/contracts
```

Review:

- Are all modules using shared contracts?
- Are dangerous fields explicit?
- Is memory scoped?
- Does world contract support future visual UI?

---

# Phase 2 — Mock Dashboard

## Goal

Build first visual Command Center using mock data.

## Tasks

- [x] P2.01 Create `apps/web`.
- [x] P2.02 Create dashboard layout.
- [x] P2.03 Create sidebar navigation.
- [x] P2.04 Create top command bar.
- [x] P2.05 Create Jarvis briefing panel.
- [x] P2.06 Create ecosystem businesses panel.
- [x] P2.07 Create active agents panel.
- [x] P2.08 Create task status panel.
- [x] P2.09 Create approval queue panel.
- [x] P2.10 Create cost/budget panel.
- [x] P2.11 Create memory summaries panel.
- [x] P2.12 Create recent activity panel.
- [x] P2.13 Create simple world preview panel.
- [x] P2.14 Load mock data from seed files.
- [x] P2.15 Add empty/loading/error states.

## TDD / UI Tests

- [x] Dashboard renders.
- [x] Business cards render.
- [x] Agents render.
- [x] Pending approvals render.
- [x] Cost summary renders.
- [x] World nodes render.

## Done Criteria

- dashboard is useful with mock data
- UI is readable
- no real external actions
- no game-like character work yet

## [STOP] CHECKPOINT 2 — Dashboard Review

Verify:

```bash
pnpm dev
pnpm typecheck
pnpm test
```

Manual check:

- Can user understand system state in 30 seconds?
- Are approvals visible?
- Are costs visible?
- Are agents/businesses/tasks visible?

---

# Phase 3 — API and Persistence

## Goal

Replace mock-only foundation with API and database.

## Tasks

- [x] P3.01 Create `apps/api`.
- [x] P3.02 Add API server.
- [x] P3.03 Add Postgres connection.
- [x] P3.04 Add migrations.
- [x] P3.05 Add repository layer.
- [x] P3.06 Add business endpoints.
- [x] P3.07 Add agent endpoints.
- [x] P3.08 Add task endpoints.
- [x] P3.09 Add memory endpoints.
- [x] P3.10 Add approval endpoints.
- [x] P3.11 Add audit endpoints.
- [x] P3.12 Add cost endpoints.
- [x] P3.13 Add world endpoint.
- [x] P3.14 Add seed script.
- [x] P3.15 Connect web to API.

## TDD Tests

- [x] Business CRUD integration test.
- [x] Agent CRUD integration test.
- [x] Task CRUD integration test.
- [x] Memory CRUD integration test.
- [x] Approval approve/reject test.
- [x] Audit event creation test.

## Done Criteria

- API works locally
- dashboard can read API data
- seed data loads
- create/update writes audit event

## [STOP] CHECKPOINT 3 — API Review

Verify:

```bash
pnpm typecheck
pnpm test
pnpm dev
```

Manual check:

- API health OK
- dashboard loads from API
- audit events are created
- no direct risky action execution

---

# Phase 4 — Governance Kernel v0

## Goal

Implement safety layer before real tool execution.

## Tasks

- [x] P4.01 Implement action model.
- [x] P4.02 Implement risk classifier.
- [x] P4.03 Implement hard forbidden action list.
- [x] P4.04 Implement approval-required rules.
- [x] P4.05 Implement budget policy.
- [x] P4.06 Implement subscription hard gate.
- [x] P4.07 Implement permission-change gate.
- [x] P4.08 Implement terminal command approval rule.
- [x] P4.09 Implement audit events for governance decisions.
- [x] P4.10 Add approval request creation from action.

## TDD Safety Tests

- [x] Subscription always requires approval.
- [x] Spending money requires approval.
- [x] Sending message requires approval.
- [x] Deleting data requires approval.
- [x] Camera/mic access requires approval.
- [x] Financial trade requires approval.
- [x] Permission change requires approval.
- [x] Hiding logs is blocked.
- [x] Terminal command requires approval in MVP.
- [x] Low-risk summary can pass.

## Done Criteria

- Governance has tests.
- Risky actions cannot bypass approval.
- Hidden log actions are blocked.
- Audit events are created.

## [STOP] CHECKPOINT 4 — Governance Review

This is a critical checkpoint.

Do not continue to real tools unless all safety tests pass.

Verify:

```bash
pnpm test packages/governance
pnpm typecheck
```

Review:

- Can any agent spend money?
- Can any agent create subscription?
- Can any agent send message?
- Can any agent delete files?
- Can any agent hide logs?
- Can any agent change own permissions?

Expected answer: **No, not without approval / blocked.**

---

# Phase 5 — Business Creation Flow

## Goal

Jarvis can create a new ecosystem business from an idea.

## Tasks

- [x] P5.01 Implement `createBusinessFromIdea` service.
- [x] P5.02 Create business record.
- [x] P5.03 Create default agent team.
- [x] P5.04 Create initial tasks.
- [x] P5.05 Create initial memory entries.
- [x] P5.06 Create audit events.
- [x] P5.07 Rebuild world map.
- [x] P5.08 Add Jarvis chat command.
- [x] P5.09 Update dashboard after creation.
- [x] P5.10 Add Real Time Dating App demo command.

## TDD Tests

- [x] Creates business.
- [x] Creates CEO and PM.
- [x] Creates default team.
- [x] Creates tasks.
- [x] Writes memory.
- [x] Writes audit events.
- [x] Updates world map.
- [x] Does not create dangerous permissions.

## Done Criteria

- user can create business from chat/command
- dashboard updates
- no dangerous tools granted
- audit/memory are written

## [STOP] CHECKPOINT 5 — First Magic Moment Review

Manual demo:

```text
Jarvis, I have an idea for a real-time dating app. Create the ecosystem business and prepare the first spec.
```

Verify:

- business appears
- agents appear
- tasks appear
- memory exists
- audit exists
- world node exists

---

# Phase 6 — Necromancer v0

## Goal

Agent Creator creates and manages agents safely.

## Tasks

- [x] P6.01 Implement default agent templates.
- [x] P6.02 Implement template-to-agent factory.
- [x] P6.03 Implement lifecycle states.
- [x] P6.04 Implement reuse check.
- [x] P6.05 Implement custom agent proposal.
- [x] P6.06 Implement governance review before activation.
- [x] P6.07 Implement agent test task placeholder.
- [x] P6.08 Implement retire/pause agent.
- [x] P6.09 Implement Creator Router classification.
- [x] P6.10 Add creation proposal flow before creating new agents.

## TDD Tests

- [x] Default team creation.
- [x] Reuse check prevents duplicate role.
- [x] Custom agent proposal has limits.
- [x] High-permission agent requires approval.
- [x] Retired agent cannot receive tasks.

## Done Criteria

- agents are created deliberately
- no dangerous defaults
- lifecycle is explicit

## [STOP] CHECKPOINT 6 — Agent Lifecycle Review

Review:

- Are agents created only when needed?
- Does every agent have scope?
- Does every agent have limitations?
- Does every agent have model profile?
- Are dangerous permissions blocked?

---


# Phase 6.5 — Capability Scout v0

## Goal

Before building custom systems or creating new agents, find whether an existing tool/skill/plugin/package/MCP/API/app already solves the need.

## Tasks

- [x] P6.5.01 Implement CapabilityCandidate contract.
- [x] P6.5.02 Implement CapabilitySearchReport contract.
- [x] P6.5.03 Add Capability Scout decision flow.
- [x] P6.5.04 Add build-vs-buy decision rules.
- [x] P6.5.05 Add approval rule for paid/subscription tools.
- [x] P6.5.06 Add approval rule for sensitive permissions.
- [x] P6.5.07 Add tests for capability decisions.
- [x] P6.5.08 Add dashboard placeholder for capability reports.

## TDD Tests

- [x] Existing internal capability preferred when fit is high.
- [x] Paid/subscription tool requires approval.
- [x] Sensitive permission tool requires approval.
- [x] Simple package decision creates CapabilitySearchReport.
- [x] Creator Router can consume Capability Scout result.

## Done Criteria

- system does not blindly build custom solutions
- tool/package/plugin choices are recorded
- paid/sensitive tools are approval-gated
- Creator Router can use Capability Scout

## [STOP] CHECKPOINT 6.5 — Capability Scout Review

Review:

- Are we avoiding unnecessary custom agents?
- Are paid tools approval-gated?
- Are third-party permissions visible?
- Is build-vs-buy explicit?



# Phase 6.6 — Agent Communication Ledger v0

## Goal

Store all agent communications in structured, queryable, readable threads.

## Tasks

- [x] P6.6.01 Implement CommunicationThread contract.
- [x] P6.6.02 Implement AgentMessage contract.
- [x] P6.6.03 Implement CommunicationDecision contract.
- [x] P6.6.04 Implement CommunicationArchiveEntry contract.
- [x] P6.6.05 Add communication repository/API placeholder.
- [x] P6.6.06 Add thread list UI placeholder.
- [x] P6.6.07 Add thread detail UI placeholder.
- [x] P6.6.08 Add decision extraction placeholder.
- [x] P6.6.09 Add archive/markdown export placeholder.
- [x] P6.6.10 Add communication analytics hooks for System Optimizer.

## TDD Tests

- [x] Message must belong to thread.
- [x] Thread can link business/task/run/approval.
- [x] Decisions can reference thread.
- [x] Archive entry keeps raw thread reference.
- [x] Blocker/error message can be filtered by type.

## Done Criteria

- all communications are stored
- full conversations are readable
- summaries do not replace raw messages
- decisions are extractable
- communication history can be analyzed later

## [STOP] CHECKPOINT 6.6 — Communication Ledger Review

Review:

- Can we read full communication history?
- Are messages structured?
- Are blockers/errors/decisions filterable?
- Are summaries separate from raw messages?
- Can System Optimizer analyze communication history?


# Phase 7 — SpecKit Artifact Generation

## Goal

Generate human-readable SpecKit artifacts for businesses.

## Tasks

- [x] P7.01 Implement artifact storage service.
- [x] P7.02 Generate business.md.
- [x] P7.03 Generate idea-brief.md.
- [x] P7.04 Generate risks.md.
- [x] P7.05 Generate specs/spec.md.
- [x] P7.06 Generate specs/plan.md.
- [x] P7.07 Generate specs/tasks.md.
- [x] P7.08 Generate specs/acceptance.md.
- [x] P7.09 Generate contracts stubs.
- [x] P7.10 Show artifacts in UI.

## TDD / Golden Tests

- [x] Generated spec has required sections.
- [x] Generated tasks has checklist.
- [x] Generated acceptance has gates.
- [x] Artifact metadata stored.
- [x] Files are human-readable.

## Done Criteria

- business produces markdown artifacts
- artifacts appear in dashboard
- generated files are stable enough for Cursor

## [STOP] CHECKPOINT 7 — SpecKit Review

Review generated artifacts manually.

Ask:

- Could Cursor build from this?
- Are acceptance criteria clear?
- Are tasks concrete?
- Are non-goals explicit?

---

# Phase 8 — Memory v0

## Goal

Add scoped memory.

## Tasks

- [x] P8.01 Implement memory writer.
- [x] P8.02 Implement memory retriever.
- [x] P8.03 Implement global memory.
- [x] P8.04 Implement business memory.
- [x] P8.05 Implement agent memory.
- [x] P8.06 Implement task memory.
- [x] P8.07 Add memory summaries.
- [x] P8.08 Add memory UI.
- [x] P8.09 Add delete/edit memory.

## TDD Tests

- [x] Global memory is separate.
- [x] Business memory is separate.
- [x] Agent cannot read unrelated business memory.
- [x] Sensitive memory can be marked.
- [x] Memory delete works.

## Done Criteria

- memory is scoped
- dashboard shows useful memory
- user can review/delete

## [STOP] CHECKPOINT 8 — Memory Review

Review:

- Is memory useful?
- Is anything sensitive stored accidentally?
- Are scopes enforced?
- Can user delete/edit?

---

# Phase 9 — Cost and Model Router v0

## Goal

Support local/online model strategy and track costs.

## Tasks

- [x] P9.01 Implement model profile.
- [x] P9.02 Implement local model provider stub.
- [x] P9.03 Implement online model provider stub.
- [x] P9.04 Implement LLM router.
- [x] P9.05 Implement cost estimator.
- [x] P9.06 Implement cost logger.
- [x] P9.07 Implement approval threshold.
- [x] P9.08 Add cost dashboard.

## TDD Tests

- [x] Local model selected for simple task.
- [x] Online model selected for complex task when allowed.
- [x] Online model blocked when disabled.
- [x] Cost entry recorded.
- [x] Approval required above threshold.

## Done Criteria

- model routing is explicit
- costs are visible
- online usage is controllable

## [STOP] CHECKPOINT 9 — Cost Review

Review:

- Can online usage happen silently?
- Are costs recorded?
- Are budgets enforced?
- Are subscriptions still approval-gated?

---


# Phase 9.5 — Model Scout and Optimization v0

## Goal

Add the system layer that keeps RealmOS smart over time: model/platform selection, token/cost optimization, and memory compaction.

## Tasks

- [x] P9.5.01 Implement OptimizationReport contract.
- [x] P9.5.02 Implement KnowledgeVaultConfig contract.
- [x] P9.5.03 Implement ContextPack contract.
- [x] P9.5.04 Implement ModelPlatformCandidate contract.
- [x] P9.5.05 Implement ModelRoutingDecision contract.
- [x] P9.5.06 Add System Optimizer placeholder.
- [x] P9.5.07 Add Model/Platform Scout placeholder.
- [x] P9.5.08 Add Knowledge Vault / Obsidian placeholder.
- [x] P9.5.09 Add tests for model change approval.
- [x] P9.5.10 Add tests for context pack token savings.
- [x] P9.5.11 Add dashboard placeholders.

## Done Criteria

- model choice is not hardcoded forever
- context packs exist to reduce token usage
- Obsidian/local markdown bridge is planned
- optimizer can recommend improvements
- risky/costly model changes require approval

## [STOP] CHECKPOINT 9.5 — Intelligence Layer Review

Review:

- Can RealmOS change model strategy later?
- Are model changes approval-gated when needed?
- Is memory/token usage controlled?
- Is Obsidian integration optional and safe?
- Does optimizer recommend rather than silently changing system behavior?


# Phase 10 — World View v0

## Goal

Render simple world view from World Contract.

## Tasks

- [x] P10.01 Generate world nodes from businesses.
- [x] P10.02 Generate office/room nodes from agents.
- [x] P10.03 Generate status markers.
- [x] P10.04 Render simple map/cards.
- [x] P10.05 Add World Map Visual Agent placeholder.
- [x] P10.06 Add future character fields without implementing characters.

## TDD/UI Tests

- [x] World map contains Jarvis HQ.
- [x] Each business has business_land node.
- [x] Each agent has agent_desk or room node.
- [x] UI renders nodes.

## Done Criteria

- world view exists
- data contract can support future game UI
- no time wasted on character animation yet

## [STOP] CHECKPOINT 10 — World Review

Review:

- Does the visual metaphor make sense?
- Is it data-driven?
- Can it later become game-like?

---

# Phase 11 — Tool Runner v0

## Goal

Add first controlled tool execution.

## Tasks

- [x] P11.01 Implement Tool Registry.
- [x] P11.02 Implement filesystem draft writer.
- [x] P11.03 Implement terminal command request.
- [x] P11.04 Terminal commands create approvals.
- [x] P11.05 Approved terminal commands can execute only if env flag enabled.
- [x] P11.06 Log tool request/result.
- [x] P11.07 Show tool activity in UI.

## TDD Safety Tests

- [x] Tool without permission blocked.
- [x] Terminal disabled by default.
- [x] Terminal command requires approval.
- [x] Tool result creates audit event.
- [x] Dangerous command blocked or approval-gated.

## Done Criteria

- tools are controlled
- approval works
- audit works
- no silent execution

## [STOP] CHECKPOINT 11 — Tool Safety Review

This is a critical checkpoint.

Do not add browser/email/camera/mic until this is safe.

---

# Phase 12 — Personal MVP Stabilization

## Goal

Make RealmOS usable by Idan for real planning work.

## Tasks

- [x] P12.01 Polish dashboard.
- [x] P12.02 Improve generated artifacts.
- [x] P12.03 Add real local model integration.
- [x] P12.04 Add online model integration with approval/cost.
- [x] P12.05 Add backups/export.
- [x] P12.06 Add operator guide in app.
- [x] P12.07 Add health checks.
- [x] P12.08 Add error handling.
- [x] P12.09 Add final MVP demo script.

## Final MVP Acceptance

- [x] Idea-to-business works.
- [x] Dashboard useful.
- [x] Agents created safely.
- [x] SpecKit artifacts generated.
- [x] Memory scoped.
- [x] Costs tracked.
- [x] Approvals enforced.
- [x] Audit log complete.
- [x] Tool execution controlled.
- [x] World view exists.

## [STOP] CHECKPOINT 12 — MVP Readiness Review

Run complete demo and verify all acceptance gates.

---

# Post-MVP Backlog

Do not start before MVP readiness.

- [ ] Voice wake word.
- [ ] Speech-to-text.
- [ ] Text-to-speech.
- [ ] Physical dashboard.
- [ ] Browser automation.
- [ ] GitHub PR creation by developer agents.
- [ ] Pierce PR review flow.
- [ ] n8n integration.
- [ ] Mobile/web remote access.
- [ ] Game-like world with characters.
- [ ] Camera/vision.
- [ ] Local network/device control.
- [ ] Crypto paper trading.
- [ ] Real crypto trading with approval and safety.

# Phase 6.7 — Always-On Work Loop / Self-Build Console v0

## Goal

Make RealmOS capable of continuously selecting and preparing the next safe work item while pausing only for critical/user-only decisions.

## Tasks

- [x] P6.7.01 Implement AutonomyLevel contract.
- [x] P6.7.02 Implement WorkItem contract.
- [x] P6.7.03 Implement CursorWorkPacket contract.
- [x] P6.7.04 Implement CursorCompletionReport contract.
- [x] P6.7.05 Implement ContinuousWorkPolicy contract.
- [x] P6.7.06 Implement NextBestWorkDecision contract.
- [x] P6.7.07 Add next-best-work selector placeholder.
- [x] P6.7.08 Add human-only gate evaluator placeholder.
- [x] P6.7.09 Add Cursor Work Packet generator placeholder.
- [x] P6.7.10 Add Cursor Completion Report importer placeholder.
- [x] P6.7.11 Add Self-Build Console UI placeholder.
- [x] P6.7.12 Add tests for safe work continuation and approval pauses.

## Done Criteria

- safe work does not require manual "start"
- high-risk/user-only work pauses
- Cursor work packets can be generated
- Cursor completion reports can be imported
- user can see what RealmOS is working on and what needs approval

## [STOP] CHECKPOINT 6.7 — Always-On Work Review

Review:

- Does the system continue safe work?
- Does it stop for critical approvals?
- Does it keep the user in control?
- Does it avoid unsafe automation?
- Does it track all work inside RealmOS?

# Phase 6.8 — Parallel Agent Fleet / Swarm Control v0

## Goal

Allow RealmOS to coordinate multiple agents, workflows, and runs in parallel without losing governance or control.

## Tasks

- [x] P6.8.01 Implement FleetLane contract.
- [x] P6.8.02 Implement CoordinationMode contract.
- [x] P6.8.03 Implement FleetCapacityPolicy contract.
- [x] P6.8.04 Implement Fleet contract.
- [x] P6.8.05 Implement Squad contract.
- [x] P6.8.06 Implement FleetRun contract.
- [x] P6.8.07 Implement WorkConflict contract.
- [x] P6.8.08 Implement ParallelWorkPlan contract.
- [x] P6.8.09 Add fleet controller placeholder.
- [x] P6.8.10 Add conflict detection placeholder.
- [x] P6.8.11 Add capacity policy evaluator placeholder.
- [x] P6.8.12 Add Fleet / Swarm Control UI placeholder.

## Done Criteria

- multiple parallel runs can be tracked
- dependencies are respected
- conflicts are detected
- capacity limits are enforced
- approvals and STOP CHECK gates are not bypassed

## [STOP] CHECKPOINT 6.8 — Fleet Control Review

Review:

- Can parallel work be tracked?
- Can unsafe parallelism be blocked?
- Can same-file/task conflicts be detected?
- Are capacity limits represented?
- Does governance still control parallel work?

# Phase 2.5 — Realm Scoping / Repository Boundary v0

## Goal

Separate the global RealmOS layer from project/business Realm ecosystems before deeper implementation.

## Tasks

- [x] P2.5.01 Implement Realm contract.
- [x] P2.5.02 Implement RealmEnvironment contract.
- [x] P2.5.03 Implement RealmAccessPolicy contract.
- [x] P2.5.04 Implement RepositoryBinding contract.
- [x] P2.5.05 Implement RepositoryOwnershipRule contract.
- [x] P2.5.06 Implement CursorRepositoryContext contract.
- [x] P2.5.07 Implement RepositoryConflict contract.
- [x] P2.5.08 Add global vs project shell route definitions.
- [x] P2.5.09 Add repository-boundary rules to Cursor Work Packet.
- [x] P2.5.10 Add repository conflict detection placeholder.
- [x] P2.5.11 Add project Repository page placeholder.
- [x] P2.5.12 Update operational contracts with scope/realmId strategy.

## [STOP] CHECKPOINT 2.5 — Realm Boundary Review

Review:

- Is this global or project-local?
- Does every project have its own ecosystem?
- Are repository boundaries clear?
- Can agents accidentally edit the wrong repo?
- Are cross-realm accesses gated?

# Phase 2.6 — Platform Decisions / Project Infrastructure Isolation v0

## Goal

Lock the cloud/local/source-control decisions and prevent project runtime infrastructure from mixing with RealmOS infrastructure.

## Tasks

- [x] P2.6.01 Implement PlatformDecision contract.
- [x] P2.6.02 Add Firebase baseline config placeholder.
- [x] P2.6.03 Add M1 Pro local node config placeholder.
- [x] P2.6.04 Add GitHub source-control config placeholder.
- [x] P2.6.05 Add Ollama local LLM runtime config placeholder.
- [x] P2.6.06 Implement ProjectInfrastructurePlan contract.
- [x] P2.6.07 Implement InfrastructureResourceRef contract.
- [x] P2.6.08 Implement InfrastructureIsolationViolation contract.
- [x] P2.6.09 Add project infrastructure isolation checks.
- [x] P2.6.10 Add temporary prototype infrastructure approval flow.
- [x] P2.6.11 Add project infrastructure page placeholder.
- [x] P2.6.12 Update Cursor Work Packet rules with infrastructure boundary checks.

## [STOP] CHECKPOINT 2.6 — Platform / Infra Boundary Review

Review:

- Is this RealmOS infrastructure or project runtime infrastructure?
- Is Firebase being used only for RealmOS orchestration?
- Does the project have its own dedicated app/runtime infra plan?
- Is any temporary prototype infra clearly marked and approved?
- Are delayed platforms still delayed unless a real need exists?

---

# Post-MVP initiative gate — RealmOS base system completion (locked)

**Locked 2026-06-12 (reinforced).** Do not start, recommend, prepare, mention as next initiative, or scope any side project until the **RealmOS base system is complete and verified**.

**Main goal:** Finish RealmOS so the operator can move from Cursor IDE into RealmOS and manage tasks, changes, planning, execution, verification, and handoff from RealmOS itself.

Side projects remain blocked until the operator explicitly decides from inside a **working RealmOS/Jarvis environment** what to do next.

## Base system completion criteria (incomplete)

RealmOS base system must be completed and verified, including:

- [ ] Command Center (0.30: **PARTIAL** — sectionized dashboard)
- [~] navigation (0.30: **PARTIAL** — `?section=` query nav; not full routes)
- [ ] UI correctness against locked screenshots / UI references (0.30: **NEEDS REFERENCE ASSET** — PNGs still missing)
- [x] Jarvis local interaction path (0.31: **PASS** — operator chat UI + API; Live API required; no actions)
- [x] Necromancer (0.32: **PARTIAL+** — candidate API + operator panel; approval required; no auto actions)
- [x] work packet lifecycle
- [x] executor bridge
- [x] run monitor
- [x] durable run-state / self-handoff
- [ ] approvals (operator flow hardening) (0.29 audit: **PARTIAL**)
- [ ] verification reporting / evidence capture (0.29 audit: **PARTIAL**)
- [x] memory/state persistence (operational)
- [x] safety/governance
- [x] local Ollama path
- [x] Postgres persistence
- [x] Firebase baseline (platform wiring only)
- [ ] end-to-end self-management milestone validation (0.28 dogfood PASS governance task; 0.29 audit: CC packet create UI missing)

## 0.29 audit summary (2026-06-12)

- Plan: `docs/realmos-package/06_operations/base_system_verification_plan_v0_29.md`
- Audit: `docs/realmos-package/99_audits/base_system_readiness_audit_v0_29.md`
- Overall base readiness: **PARTIAL**; Cursor IDE exit: **FAIL**

## Self-management milestone (incomplete)

RealmOS must be able to:

- [x] create a work packet
- [x] dispatch it to an executor (dry-run; human approval required)
- [x] monitor execution
- [x] verify results
- [x] persist run state
- [x] produce handoff/state updates
- [x] ask the operator only when human approval is required (0.28 dogfood — approval gate enforced)

## Testing & Quality Gate (locked — 0.28)

- [x] Permanent rule in `CURSOR_SSOT.md` Section 7.1
- [x] Required gates documented in `VERIFICATION_COMMANDS.md`
- [x] No PASS without tests or explicit audit test gap

## Forbidden until base system complete

Do not start, recommend, prepare, or scope:

- GUING
- any previous side project
- any product bootstrap
- any external client/project work
- any “project idea” initiative
- any non-RealmOS work
- UI polish not required for RealmOS operation
- voice / Jarvis personality work
- unrelated product features

## Allowed upcoming RealmOS-only initiatives

- [x] **0.29 — RealmOS Base System Verification Plan** (complete — audit + plan docs)
- [x] **0.30 — UI / Navigation Verification Against Locked References** (complete)
- [x] **0.31 — Jarvis Interaction Path Verification / Chat UI** (complete)
- [x] **0.32 — Necromancer Verification / Operator UI Hardening** (complete)
- [x] **0.33 — Verification Evidence Capture** (complete)
- [x] **0.34 — Durable Necromancer Evidence / Persistence Hardening** (complete)
- [x] **0.35 — Browser E2E Smoke for Command Center Core Flows** (complete)
- [x] **0.36 — Cursor IDE Exit Readiness Audit / Remaining Base-System Gaps** (complete)
- [ ] **0.37 — Work Packet Creation / Approval UI Completion** (recommended next — await operator approval)
- [x] Testing & Quality Gate constitution (0.28)
- [x] Jarvis interaction path verification (0.31 complete)
- [x] Necromancer verification (0.32 complete)
- [x] Real verification evidence capture (0.33 complete)
- [x] Durable Necromancer evidence / persistence hardening (0.34 complete)
- [x] Browser E2E smoke for Command Center core flows (0.35 complete)
- [ ] Safe local executor consumer design (future — no auto-exec without approval)
- [ ] RealmOS replaces Cursor IDE as primary operator surface (final milestone)

## Completed post-MVP initiatives

- [x] 0.18 MVP stabilization
- [x] 0.19 Durable persistence
- [x] 0.20 Postgres smoke
- [x] 0.21 Postgres CI smoke
- [x] 0.22 Local Ollama node integration
- [x] 0.23 Firebase baseline wiring (platform only — no product unlock)
- [x] 0.24 Local executor / Cursor CLI bridge (dry-run file queue)
- [x] 0.25 Work Packet Lifecycle
- [x] 0.26 Command Center Task Approval + Run Monitor
- [x] 0.27 Self-Handoff / Durable Run State Updates
- [x] 0.28 Dogfood RealmOS Managing One Real RealmOS Task
- [x] 0.29 RealmOS Base System Verification Plan
- [x] 0.30 UI / Navigation Verification Against Locked References
- [x] 0.31 Jarvis Interaction Path Verification / Chat UI
- [x] 0.32 Necromancer Verification / Operator UI Hardening
- [x] 0.33 Verification Evidence Capture
- [x] 0.34 Durable Necromancer Evidence / Persistence Hardening
