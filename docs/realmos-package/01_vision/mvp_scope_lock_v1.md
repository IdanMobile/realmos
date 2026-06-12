# RealmOS MVP — Scope Lock v1

## MVP Goal

Build the first useful version of RealmOS / Jarvis HQ that can create and manage an ecosystem business from an idea.

## MVP Core Scenario

The user says:

> Jarvis, I have an idea for a real-time dating app. Create the ecosystem business and prepare the first spec.

The system creates:

- business record
- default agent team
- initial mission and idea brief
- SpecKit files
- task list
- risk list
- memory entries
- dashboard view
- approval queue entries when needed

## MVP Includes

### Interface

- web dashboard
- Jarvis text chat
- simple command input
- no voice required yet

### Dashboard Panels

- Jarvis briefing
- businesses
- agents
- tasks
- approvals
- memory summaries
- cost/budget
- recent activity
- simple world map/cards

### Core Domain

- business registry
- agent registry
- task registry
- memory registry
- approval queue
- audit log
- cost records
- world contract

### Agent System

- default global agents
- default business agents
- Necromancer creates team from templates
- custom agents later, basic support in MVP

### SpecKit

- generate spec.md
- generate plan.md
- generate tasks.md
- generate acceptance.md
- generate contract stubs

### Governance

- risk classification
- subscription hard approval gate
- terminal command approval gate
- budget limits
- audit log

### Model Strategy

- support model profile abstraction
- local/online routing can be mocked first
- real integration later

## MVP Excludes

- full autonomous coding
- autonomous PR creation
- full browser/computer control
- camera access
- microphone/wake-word
- crypto trading execution
- sending real emails/messages
- real money spending
- subscription creation without approval
- full game-like UI
- mobile app
- multi-user SaaS
- external marketplace
- production deployments

## MVP Quality Bar

- all core data contracts exist
- all major actions logged
- risky actions blocked by approval
- generated artifacts saved to disk/database
- dashboard reflects system state
- codebase ready for future agents/tools
