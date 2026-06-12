# ADR-0002 — Build Dashboard Before Game UI

## Status

Accepted

## Context

The long-term vision includes a game-like world with characters, lands, rooms, and visible agents.

However, building that first risks wasting time before the system is useful.

## Decision

Start with a practical dashboard:

- business cards
- agent cards
- tasks
- approvals
- memory
- costs
- logs
- simple world preview

Define the World Contract early so a game-like UI can be built later.

## Consequences

Positive:

- faster MVP
- useful earlier
- data model supports future visuals
- avoids UI fantasy trap

Negative:

- initial experience less magical
- requires discipline to keep visual dream alive
