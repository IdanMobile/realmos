# RealmOS — Implementation Phases v1

## Phase 0 — Package and Planning

Output:

- vision
- AD
- SpecKit
- contracts
- roadmap
- prompts
- diagrams
- concept images

Status: complete initial drafts.

## Phase 1 — Contracts and Mock Dashboard

Goal:

Create visual/useful shell with mocked data.

Deliverables:

- Next.js web app
- dashboard layout
- Jarvis panel
- business cards
- agent cards
- task board
- approval queue
- budget panel
- memory panel
- recent activity panel
- world contract mock

## Phase 2 — API and Persistence

Goal:

Replace mocks with local API and database.

Deliverables:

- Node API
- Postgres schema
- repositories
- CRUD endpoints
- audit events
- seed data

## Phase 3 — Business Creation Flow

Goal:

Jarvis can create an ecosystem business from an idea.

Deliverables:

- chat endpoint
- create-business command
- business record
- default agent team
- initial tasks
- initial memory
- audit events

## Phase 4 — Necromancer v0

Goal:

Agent Creator creates default team based on templates.

Deliverables:

- agent templates
- default team creator
- role assignment
- permissions
- model profiles
- status lifecycle

## Phase 5 — SpecKit Generator v0

Goal:

Generate files for a business.

Deliverables:

- spec.md
- plan.md
- tasks.md
- acceptance.md
- contracts
- artifacts panel

## Phase 6 — Governance v0

Goal:

Risky actions require approval.

Deliverables:

- risk classifier
- approval request model
- approve/reject UI
- terminal action mock
- subscription approval hard gate
- budget checks

## Phase 7 — Memory v0

Goal:

Store and recall scoped memory.

Deliverables:

- global memory
- business memory
- agent memory
- task memory
- memory summary UI
- manual memory create/delete

## Phase 8 — Model Router v0

Goal:

Route between local and online model profiles.

Deliverables:

- model profile contract
- local model provider adapter stub
- online model provider adapter stub
- cost logging
- approval threshold

## Phase 9 — Tool Runner v0

Goal:

Execute approved safe tools.

Deliverables:

- filesystem draft writer
- terminal command approval + execution
- log results
- rollback notes
- tool permissions

## Phase 10 — World UI v0

Goal:

Simple render of world contract.

Deliverables:

- nodes/cards/map layout
- business lands as cards
- agent rooms as nested views
- future character-ready schema

## Phase 11 — Voice and Dedicated HQ Later

Goal:

Physical Jarvis HQ.

Deliverables later:

- wake word
- speech-to-text
- text-to-speech
- always-on background service
- physical dashboard screen
- mic/speaker controls
