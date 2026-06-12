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

- [ ] P0.01 Create real repo from `11_starter_repo_template`.
- [ ] P0.02 Initialize pnpm workspace.
- [ ] P0.03 Add TypeScript config.
- [ ] P0.04 Add lint/typecheck/test scripts.
- [ ] P0.05 Add `.env.example`.
- [ ] P0.06 Add README with local run instructions.
- [ ] P0.07 Add package references.
- [ ] P0.08 Confirm `pnpm install` works.
- [ ] P0.09 Confirm `pnpm typecheck` works.
- [ ] P0.10 Confirm `pnpm test` baseline works.

## Tests First

- [ ] Add basic test runner sanity test.
- [ ] Add contracts import sanity test.

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

- [ ] P1.01 Implement `Business` contract.
- [ ] P1.02 Implement `Agent` contract.
- [ ] P1.03 Implement `Task` contract.
- [ ] P1.04 Implement `Memory` contract.
- [ ] P1.05 Implement `ApprovalRequest` contract.
- [ ] P1.06 Implement `AuditEvent` contract.
- [ ] P1.07 Implement `Budget` contract.
- [ ] P1.08 Implement `CostEntry` contract.
- [ ] P1.09 Implement `WorldMap` contract.
- [ ] P1.10 Implement `Run` contract.
- [ ] P1.11 Implement `Artifact` contract.
- [ ] P1.12 Export all from `packages/contracts/src/index.ts`.
- [ ] P1.13 Add mock factory helpers.
- [ ] P1.14 Add validation schemas if using Zod.

## TDD Tests

- [ ] Test default Business factory.
- [ ] Test default Agent factory has no dangerous permissions.
- [ ] Test ApprovalRequest supports subscription approval.
- [ ] Test Memory requires scope.
- [ ] Test WorldNode references valid ref types.

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

- [ ] P2.01 Create `apps/web`.
- [ ] P2.02 Create dashboard layout.
- [ ] P2.03 Create sidebar navigation.
- [ ] P2.04 Create top command bar.
- [ ] P2.05 Create Jarvis briefing panel.
- [ ] P2.06 Create ecosystem businesses panel.
- [ ] P2.07 Create active agents panel.
- [ ] P2.08 Create task status panel.
- [ ] P2.09 Create approval queue panel.
- [ ] P2.10 Create cost/budget panel.
- [ ] P2.11 Create memory summaries panel.
- [ ] P2.12 Create recent activity panel.
- [ ] P2.13 Create simple world preview panel.
- [ ] P2.14 Load mock data from seed files.
- [ ] P2.15 Add empty/loading/error states.

## TDD / UI Tests

- [ ] Dashboard renders.
- [ ] Business cards render.
- [ ] Agents render.
- [ ] Pending approvals render.
- [ ] Cost summary renders.
- [ ] World nodes render.

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

- [ ] P3.01 Create `apps/api`.
- [ ] P3.02 Add API server.
- [ ] P3.03 Add Postgres connection.
- [ ] P3.04 Add migrations.
- [ ] P3.05 Add repository layer.
- [ ] P3.06 Add business endpoints.
- [ ] P3.07 Add agent endpoints.
- [ ] P3.08 Add task endpoints.
- [ ] P3.09 Add memory endpoints.
- [ ] P3.10 Add approval endpoints.
- [ ] P3.11 Add audit endpoints.
- [ ] P3.12 Add cost endpoints.
- [ ] P3.13 Add world endpoint.
- [ ] P3.14 Add seed script.
- [ ] P3.15 Connect web to API.

## TDD Tests

- [ ] Business CRUD integration test.
- [ ] Agent CRUD integration test.
- [ ] Task CRUD integration test.
- [ ] Memory CRUD integration test.
- [ ] Approval approve/reject test.
- [ ] Audit event creation test.

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

- [ ] P4.01 Implement action model.
- [ ] P4.02 Implement risk classifier.
- [ ] P4.03 Implement hard forbidden action list.
- [ ] P4.04 Implement approval-required rules.
- [ ] P4.05 Implement budget policy.
- [ ] P4.06 Implement subscription hard gate.
- [ ] P4.07 Implement permission-change gate.
- [ ] P4.08 Implement terminal command approval rule.
- [ ] P4.09 Implement audit events for governance decisions.
- [ ] P4.10 Add approval request creation from action.

## TDD Safety Tests

- [ ] Subscription always requires approval.
- [ ] Spending money requires approval.
- [ ] Sending message requires approval.
- [ ] Deleting data requires approval.
- [ ] Camera/mic access requires approval.
- [ ] Financial trade requires approval.
- [ ] Permission change requires approval.
- [ ] Hiding logs is blocked.
- [ ] Terminal command requires approval in MVP.
- [ ] Low-risk summary can pass.

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

- [ ] P5.01 Implement `createBusinessFromIdea` service.
- [ ] P5.02 Create business record.
- [ ] P5.03 Create default agent team.
- [ ] P5.04 Create initial tasks.
- [ ] P5.05 Create initial memory entries.
- [ ] P5.06 Create audit events.
- [ ] P5.07 Rebuild world map.
- [ ] P5.08 Add Jarvis chat command.
- [ ] P5.09 Update dashboard after creation.
- [ ] P5.10 Add Real Time Dating App demo command.

## TDD Tests

- [ ] Creates business.
- [ ] Creates CEO and PM.
- [ ] Creates default team.
- [ ] Creates tasks.
- [ ] Writes memory.
- [ ] Writes audit events.
- [ ] Updates world map.
- [ ] Does not create dangerous permissions.

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

- [ ] P6.01 Implement default agent templates.
- [ ] P6.02 Implement template-to-agent factory.
- [ ] P6.03 Implement lifecycle states.
- [ ] P6.04 Implement reuse check.
- [ ] P6.05 Implement custom agent proposal.
- [ ] P6.06 Implement governance review before activation.
- [ ] P6.07 Implement agent test task placeholder.
- [ ] P6.08 Implement retire/pause agent.

## TDD Tests

- [ ] Default team creation.
- [ ] Reuse check prevents duplicate role.
- [ ] Custom agent proposal has limits.
- [ ] High-permission agent requires approval.
- [ ] Retired agent cannot receive tasks.

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

# Phase 7 — SpecKit Artifact Generation

## Goal

Generate human-readable SpecKit artifacts for businesses.

## Tasks

- [ ] P7.01 Implement artifact storage service.
- [ ] P7.02 Generate business.md.
- [ ] P7.03 Generate idea-brief.md.
- [ ] P7.04 Generate risks.md.
- [ ] P7.05 Generate specs/spec.md.
- [ ] P7.06 Generate specs/plan.md.
- [ ] P7.07 Generate specs/tasks.md.
- [ ] P7.08 Generate specs/acceptance.md.
- [ ] P7.09 Generate contracts stubs.
- [ ] P7.10 Show artifacts in UI.

## TDD / Golden Tests

- [ ] Generated spec has required sections.
- [ ] Generated tasks has checklist.
- [ ] Generated acceptance has gates.
- [ ] Artifact metadata stored.
- [ ] Files are human-readable.

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

- [ ] P8.01 Implement memory writer.
- [ ] P8.02 Implement memory retriever.
- [ ] P8.03 Implement global memory.
- [ ] P8.04 Implement business memory.
- [ ] P8.05 Implement agent memory.
- [ ] P8.06 Implement task memory.
- [ ] P8.07 Add memory summaries.
- [ ] P8.08 Add memory UI.
- [ ] P8.09 Add delete/edit memory.

## TDD Tests

- [ ] Global memory is separate.
- [ ] Business memory is separate.
- [ ] Agent cannot read unrelated business memory.
- [ ] Sensitive memory can be marked.
- [ ] Memory delete works.

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

- [ ] P9.01 Implement model profile.
- [ ] P9.02 Implement local model provider stub.
- [ ] P9.03 Implement online model provider stub.
- [ ] P9.04 Implement LLM router.
- [ ] P9.05 Implement cost estimator.
- [ ] P9.06 Implement cost logger.
- [ ] P9.07 Implement approval threshold.
- [ ] P9.08 Add cost dashboard.

## TDD Tests

- [ ] Local model selected for simple task.
- [ ] Online model selected for complex task when allowed.
- [ ] Online model blocked when disabled.
- [ ] Cost entry recorded.
- [ ] Approval required above threshold.

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

# Phase 10 — World View v0

## Goal

Render simple world view from World Contract.

## Tasks

- [ ] P10.01 Generate world nodes from businesses.
- [ ] P10.02 Generate office/room nodes from agents.
- [ ] P10.03 Generate status markers.
- [ ] P10.04 Render simple map/cards.
- [ ] P10.05 Add World Map Visual Agent placeholder.
- [ ] P10.06 Add future character fields without implementing characters.

## TDD/UI Tests

- [ ] World map contains Jarvis HQ.
- [ ] Each business has business_land node.
- [ ] Each agent has agent_desk or room node.
- [ ] UI renders nodes.

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

- [ ] P11.01 Implement Tool Registry.
- [ ] P11.02 Implement filesystem draft writer.
- [ ] P11.03 Implement terminal command request.
- [ ] P11.04 Terminal commands create approvals.
- [ ] P11.05 Approved terminal commands can execute only if env flag enabled.
- [ ] P11.06 Log tool request/result.
- [ ] P11.07 Show tool activity in UI.

## TDD Safety Tests

- [ ] Tool without permission blocked.
- [ ] Terminal disabled by default.
- [ ] Terminal command requires approval.
- [ ] Tool result creates audit event.
- [ ] Dangerous command blocked or approval-gated.

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

- [ ] P12.01 Polish dashboard.
- [ ] P12.02 Improve generated artifacts.
- [ ] P12.03 Add real local model integration.
- [ ] P12.04 Add online model integration with approval/cost.
- [ ] P12.05 Add backups/export.
- [ ] P12.06 Add operator guide in app.
- [ ] P12.07 Add health checks.
- [ ] P12.08 Add error handling.
- [ ] P12.09 Add final MVP demo script.

## Final MVP Acceptance

- [ ] Idea-to-business works.
- [ ] Dashboard useful.
- [ ] Agents created safely.
- [ ] SpecKit artifacts generated.
- [ ] Memory scoped.
- [ ] Costs tracked.
- [ ] Approvals enforced.
- [ ] Audit log complete.
- [ ] Tool execution controlled.
- [ ] World view exists.

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
