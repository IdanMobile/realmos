# RealmOS — AI IDE Execution Guide v1

Use this guide when giving the project to Cursor or another AI IDE.

## Rule 1 — Do Not Re-Architect First

The architecture is already defined in this package.

The AI IDE should implement the existing plan unless it finds a real blocker.

## Rule 2 — Build in Phases

Follow:

1. contracts
2. mock dashboard
3. API/persistence
4. create-business flow
5. Necromancer
6. SpecKit generation
7. Governance
8. Memory/cost
9. World view

## Rule 3 — Safety Tests Are Mandatory

Before marking governance done, tests must prove:

- subscription requires approval
- spending requires approval
- terminal requires approval in MVP
- camera/mic requires approval
- permission changes require approval
- hiding logs is blocked

## Rule 4 — No Hidden Capabilities

Do not add real tool execution unless explicitly part of the phase.

For early phases, use mock/stub actions.

## Rule 5 — Keep Contracts Stable

Do not duplicate types inside apps.

Use `packages/contracts`.

## Rule 6 — Artifacts Must Be Human-Readable

Generated specs/tasks/reports should be saved as markdown.

## Rule 7 — Jarvis Is Not Developer Agent

Jarvis coordinates.

Developer agents create code/PR plans later.

Pierce reviews PRs.

## Rule 8 — Preserve Future World UI

Even simple UI should read from world-compatible data.
