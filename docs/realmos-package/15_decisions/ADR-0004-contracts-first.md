# ADR-0004 — Contracts First

## Status

Accepted

## Context

RealmOS has many moving pieces: agents, businesses, tasks, memory, approvals, world UI, costs, tools.

If each module invents its own data shape, the system will become messy.

## Decision

Create a central contracts package and make all modules depend on it.

## Consequences

Positive:

- cleaner architecture
- easier UI rendering
- easier agent/tool interoperability
- easier future game UI

Negative:

- contracts need careful evolution
- breaking changes must be controlled
