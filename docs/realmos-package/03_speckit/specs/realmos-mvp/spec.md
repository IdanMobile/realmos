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
