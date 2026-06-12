# ADR-0003 — Government Kernel Controls Risk

## Status

Accepted

## Context

Jarvis and agents may eventually access powerful tools.

An unrestricted “Jarvis is God” model is unsafe.

## Decision

Jarvis is the command interface.

Government Kernel owns:

- permissions
- approvals
- budgets
- audit
- risk classification
- forbidden actions

## Consequences

Positive:

- safer system
- product-grade governance
- useful for future company/enterprise angle
- easier debugging

Negative:

- more architecture upfront
- some actions slower due to approval gates
