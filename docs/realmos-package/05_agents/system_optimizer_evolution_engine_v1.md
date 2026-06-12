# System Optimizer / Evolution Engine v1

## Decision

Add a continuous system improvement layer called **System Optimizer**.

Its job is to analyze RealmOS itself and recommend improvements over time.

## Purpose

RealmOS should not remain static.

It should continuously check:

- what is broken
- what is slow
- what costs too much
- what creates too many tokens
- what agents are useless
- what workflows should become deterministic
- what deterministic modules should become agentic
- what tools/platforms changed
- what new models/tools/plugins exist
- what memory is bloated
- what should be archived
- what should be refactored
- what safety gaps exist

## Core Responsibilities

### 1. System Health Review

Checks:

- failed runs
- blocked tasks
- repeated errors
- expensive agents
- useless agents
- slow workflows
- token-heavy flows
- governance warnings
- missing tests
- stale tasks
- stale memory

### 2. Optimization Recommendations

Recommends:

- replace AI agent with deterministic module
- replace custom code with existing tool
- summarize/archive memory
- lower model tier
- switch provider for use case
- split workflow
- merge duplicate agents
- retire unused agents
- add missing tests
- create automation for repeated task

### 3. Regression Watch

Detects:

- tests failing
- safety gates skipped
- cost increase
- memory growth
- tool errors
- reduced quality
- broken SpecKit acceptance

### 4. New Capability Watch

Periodically asks Capability Scout and Model/Platform Scout:

- are there better tools?
- are there better models?
- are there better local models?
- are there new MCP servers?
- are existing APIs deprecated?
- are prices changed?
- did a provider release better tooling?

## Optimizer Output

```ts
type OptimizationReport = {
  id: string;
  scope: "global" | "business" | "agent" | "workflow" | "tool" | "memory" | "model";
  scopeId?: string;
  summary: string;
  findings: OptimizationFinding[];
  recommendations: OptimizationRecommendation[];
  estimatedSavings?: {
    tokens?: number;
    costUsd?: number;
    timeMinutes?: number;
  };
  riskLevel: "low" | "medium" | "high" | "critical";
  requiresApproval: boolean;
  createdAt: string;
};
```

## Cadence

MVP:

- manual run only

Later:

- daily light review
- weekly deeper review
- monthly model/tool review
- on-demand before major project decisions

## Rule

The System Optimizer recommends. It does not change core architecture, permissions, spending, subscriptions, or models without approval.
