# SpecKit Spec — RealmOS MVP

## Feature Name

RealmOS / Jarvis HQ MVP

## Feature Summary

Build the first version of a personal agentic operating system where Jarvis can create and manage ecosystem businesses, agent teams, tasks, memory, approvals, costs, and SpecKit-style artifacts through a simple dashboard.

## User Stories

### US-01: Create ecosystem business from idea

As the user, I want to tell Jarvis about an idea so the system can create a structured ecosystem business with agents, specs, tasks, and memory.

### US-02: View ecosystem dashboard

As the user, I want to see businesses, agents, tasks, approvals, costs, and memory summaries in one dashboard.

### US-03: Create agent team

As the user, I want Necromancer to create default and custom agents based on the business needs.

### US-04: Generate SpecKit artifacts

As the user, I want agents to create spec, plan, tasks, acceptance, and contracts for each business.

### US-05: Approval-gated tool actions

As the user, I want medium/high-risk actions to require my approval before execution.

### US-06: Track cost and budgets

As the user, I want the system to track model/tool/API costs and prevent subscriptions without approval.

### US-07: Persistent memory

As the user, I want Jarvis to remember conversations, decisions, and knowledge globally, while keeping business and agent memories separated.

### US-08: Agent communication

As the user, I want agents to communicate via task threads, structured reports, and Council debates.

### US-09: World contract

As the user, I want the system to maintain a clean world-map data contract so the UI can evolve into a game-like world later.

## Functional Requirements

FR-01: The system shall allow the user to create an ecosystem business.

FR-02: Each business shall have name, mission, type, status, owner, agents, tasks, memory, budgets, metrics, and risks.

FR-03: The system shall create default agents for new businesses.

FR-04: The system shall allow custom agents per business.

FR-05: The system shall store global, business, agent, task, and run memory separately.

FR-06: The system shall maintain an approval queue.

FR-07: The system shall classify actions by risk.

FR-08: The system shall block high-risk actions until approved.

FR-09: The system shall never allow subscriptions without explicit approval.

FR-10: The system shall log all actions.

FR-11: The system shall show dashboard cards for businesses, agents, tasks, approvals, costs, memory, and recent activity.

FR-12: The system shall generate SpecKit artifacts for a business.

FR-13: The system shall maintain cost records per model, business, agent, and tool.

FR-14: The system shall support local and online model routing.

FR-15: The system shall expose a World Contract for visualization.

FR-16: The system shall support Council debate output.

FR-17: The system shall allow terminal command requests but require approval in MVP.

FR-18: The system shall support future voice and always-on runtime, but MVP may start with text.

## Non-Goals

NG-01: Full autonomous spending.

NG-02: Full game-like UI.

NG-03: Camera/mic control.

NG-04: Crypto trading execution.

NG-05: Sending emails/messages without approval.

NG-06: Production SaaS multi-tenant support.

NG-07: Fully autonomous code deployment.

## Acceptance Criteria

AC-01: User can create a business from an idea.

AC-02: Default agents are created.

AC-03: Dashboard shows the new business and agents.

AC-04: SpecKit artifacts are generated.

AC-05: Approval queue blocks risky actions.

AC-06: Memory entries are separated by scope.

AC-07: Costs can be recorded and summarized.

AC-08: Audit log records every major event.

AC-09: World contract can represent businesses and agents visually.


## Creator Router Addition

FR-19: The system shall classify new capability needs before creating agents.

FR-20: The system shall support creation proposal types: AI agent, agentic workflow, deterministic module, automation workflow, human task, and hybrid system.

FR-21: The system shall prefer deterministic modules or automations over AI agents when reasoning is not required.

FR-22: The system shall require a CreationProposal before Necromancer creates a new non-default agent.


## Capability Scout Addition

FR-23: The system shall support a Capability Scout that evaluates existing tools, packages, plugins, MCP servers, n8n nodes, APIs, and third-party apps before building custom solutions.

FR-24: The system shall produce CapabilitySearchReport records for non-trivial external dependency or tool decisions.

FR-25: The system shall require approval before using paid/subscription capabilities or capabilities that require sensitive permissions.

FR-26: The system shall compare reuse, integration, automation, wrapper, and custom-build options before implementation.


## System Optimizer / Knowledge / Model Scout Addition

FR-27: The system shall support System Optimizer reports for cost, token, quality, memory, agent, workflow, and model improvements.

FR-28: The system shall support Knowledge Vault configuration, including optional Obsidian/local markdown memory.

FR-29: The system shall support ContextPack generation to reduce token usage by retrieving only relevant summarized memory.

FR-30: The system shall support Model/Platform Scout decisions for choosing providers/models per use case.

FR-31: The system shall allow model/platform choices to be revisited over time when better tools, models, prices, or capabilities appear.

FR-32: The system shall require approval before switching to higher-cost models, new cloud providers for sensitive data, or models/tools with new powerful capabilities.


## Agent Communication / Conversation Ledger Addition

FR-33: The system shall store all agent communications in structured threads.

FR-34: The system shall support message types for progress, blockers, questions, consultations, handoffs, reviews, errors, decisions, approvals, council arguments, and final reports.

FR-35: The system shall make full communication history readable and searchable.

FR-36: The system shall extract important decisions from threads into dedicated decision records.

FR-37: The system shall support communication summaries/context packs for token savings without deleting raw messages.

FR-38: The system shall support optional markdown/Obsidian export of communication archives.

## Always-On Work Loop / Self-Build Addition

FR-39: The system shall support a continuous work loop that selects the next safe work item without requiring the user to manually start each task.

FR-40: The system shall pause continuous work only for approvals, user-only actions, STOP CHECK reviews, high-risk actions, destructive actions, external communications, spending, or missing critical context.

FR-41: The system shall support Cursor Work Packets as the first execution bridge between RealmOS and Cursor IDE.

FR-42: The system shall support importing Cursor Completion Reports and updating work/task/run/progress state from those reports.

FR-43: The system shall provide a RealmOS Self-Build Console showing current phase, active work, safe-work status, pending approvals, blockers, and next recommended work.

FR-44: The system shall support configurable autonomy levels from manual-only to guarded autonomous execution.

## Parallel Agent Fleet Addition

FR-45: The system shall support multiple agents, workflows, and runs operating in parallel under fleet control.

FR-46: The system shall support lanes such as planning, backend, frontend, design, QA, security, docs, research, governance, optimization, and operations.

FR-47: The system shall detect conflicts before assigning parallel work, including same file, package, task, decision area, migration, integration, budget, or deployment target.

FR-48: The system shall enforce capacity limits for concurrent runs, per-business runs, per-lane runs, token usage, cost usage, and risk levels.

FR-49: The system shall support coordination modes including serial, parallel, map-reduce, review-chain, council, handoff, and race-with-review.

FR-50: The system shall ensure parallel work never bypasses approval gates, STOP CHECK gates, or governance policies.

## Realm Scoping / Repository Boundary Addition

FR-51: The system shall separate the RealmOS global layer from project/business Realm ecosystems.

FR-52: The system shall support Realm as the internal architecture concept and Project as the common user-facing label.

FR-53: The system shall scope operational entities to either global scope or realm scope.

FR-54: The system shall support realm-local agents, tasks, workflows, runs, communication, memory, artifacts, decisions, analytics, data, settings, budgets, tools, models, and repository bindings.

FR-55: The system shall prevent realm-local agents from accessing another realm by default.

FR-56: The system shall support RepositoryBinding records that bind repositories, branches, worktrees, protected paths, package paths, and ownership rules to a realm.

FR-57: The system shall require every Cursor Work Packet to declare realm, repository, branch/worktree, allowed paths, forbidden paths, and verification commands.

FR-58: The system shall detect repository conflicts such as overlapping paths, same branch/worktree, protected paths, same package, same migration, same config, and cross-realm boundary edits.

## Platform / Infrastructure Decisions Addition

FR-59: The system shall use Firebase as the default primary cloud platform for RealmOS MVP.
FR-60: The system shall use the dedicated M1 Pro MacBook as the default local RealmOS/Jarvis node.
FR-61: The system shall use GitHub as the default source-control platform.
FR-62: The system shall use Ollama as the default local LLM runtime.
FR-63: The system shall delay Supabase, Neon, Vercel, Render, Fly, Railway, BigQuery, and Cloud Run until a concrete need is identified.
FR-64: The system shall distinguish RealmOS orchestration infrastructure from project/app runtime infrastructure.
FR-65: The system shall prevent projects from using RealmOS Firebase/database/runtime as their production project infrastructure.
FR-66: The system shall require each real project/app to define its own dedicated infrastructure plan before production.
FR-67: The system shall allow use of RealmOS resources for project mock/prototype infrastructure only when explicitly marked temporary, user-approved, and paired with an exit plan.
