# ADR-0001 — Use Hybrid Runtime

## Status

Accepted

## Context

The system should be always-on, private where needed, low-cost when possible, but still capable of high-quality reasoning and coding.

## Decision

Use a hybrid runtime:

- local dedicated machine for persistent services, memory, dashboards, local LLM, and private control
- online models/tools for complex reasoning, code, architecture, and research when approved or allowed

## Consequences

Positive:

- better privacy
- lower cost for simple tasks
- always-on local control
- premium quality when needed

Negative:

- more infrastructure complexity
- need model router
- need cost tracking
- need local machine setup
