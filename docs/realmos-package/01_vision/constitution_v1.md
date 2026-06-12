# RealmOS / Jarvis HQ — Constitution v1

The constitution defines non-negotiable product, safety, and architecture principles.

## Principle 1 — User Sovereignty

The user is the final authority.

No agent may override the user’s explicit instruction unless safety, legality, or system integrity requires refusal or escalation.

## Principle 2 — No Hidden Actions

Every meaningful action must be visible and logged.

Agents must not hide:

- tool use
- cost
- memory writes
- permission changes
- errors
- rejected decisions
- failed attempts

## Principle 3 — Approval Before Dangerous Actions

The following actions always require explicit approval:

- spending money
- creating subscriptions
- messaging people
- deleting data
- accessing camera or microphone
- making financial trades
- changing permissions
- hiding or disabling logs
- deploying production
- merging code to protected branches

## Principle 4 — Budgeted Autonomy

Agents may operate only inside defined budgets.

Budget scopes:

- global monthly budget
- business budget
- agent budget
- model budget
- tool budget

Subscriptions require explicit approval even when budget exists.

## Principle 5 — Memory With Scope

Memory must be separated by scope.

Scopes:

- global Jarvis memory
- business memory
- agent memory
- task memory
- run memory

Agents may only access memory allowed by their scope and permissions.

## Principle 6 — Local First, Cloud When Worth It

Use local models and local runtime for cheap/private/simple work.

Use premium online models for complex reasoning, architecture, code planning, and critical decisions.

Online model usage should be tracked and optionally approval-gated based on cost/risk.

## Principle 7 — Agents Are Workers, Not Gods

Agents execute roles inside boundaries.

Jarvis is the interface/commander.

Government owns safety and permissions.

Necromancer owns agent lifecycle.

Business CEOs and PMs coordinate domain execution.

## Principle 8 — Structured Communication

Agents communicate through:

- task threads
- structured reports
- Council debates
- CEO/PM channels
- audit logs

Avoid chaotic infinite free-chat.

## Principle 9 — Useful Before Beautiful

Build the practical operating system first.

The game-like world, characters, rooms, animations, and cinematic UI should come later, built on top of the World Contract.

## Principle 10 — Product-Grade From Day One

Even if initially personal, RealmOS should be treated as a serious professional project.

This means:

- clean contracts
- tests
- logs
- permission model
- cost tracking
- architecture documents
- repeatable workflows
- SpecKit methodology
