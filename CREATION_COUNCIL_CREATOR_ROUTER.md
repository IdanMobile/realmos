# Creation Council / Creator Router v1

## Decision

Necromancer remains the single lifecycle owner for agents, but RealmOS must not assume that every need should become an AI agent.

Add a **Creator Router** before Necromancer creates anything.

The Creator Router decides whether the solution should be:

- AI agent
- agentic workflow
- deterministic module
- automation workflow
- human task
- hybrid system

## Why This Is Needed

Different scenarios need different solution types.

If every problem becomes an AI agent, the system becomes:

- more expensive
- slower
- harder to test
- harder to debug
- less deterministic
- more dangerous

The right question is:

> What is the simplest reliable system that solves this need?

## Creation Types

### 1. AI Agent

Use when the task requires judgment, ambiguity handling, reasoning, language, strategy, review, or adaptation.

Examples:

- researcher
- product manager
- architect
- PR reviewer
- risk analyst
- idea expansion agent

### 2. Agentic Workflow

Use when multiple reasoning steps or roles need to coordinate toward a goal.

Examples:

- idea → research → spec → tasks
- bug diagnosis → fix plan → test plan → PR review
- startup analysis → market → competitors → MVP

### 3. Deterministic Module

Use when the behavior should be predictable, testable, cheap, and rule-based.

Examples:

- permission checks
- budget calculations
- schema validation
- file path validation
- risk enum mapping
- audit event writing
- status transitions

### 4. Automation Workflow

Use when tools/apps/services need a repeatable sequence.

Examples:

- scheduled report
- n8n workflow
- GitHub issue sync
- calendar reminder
- notification pipeline
- browser workflow with approval

### 5. Human Task

Use when the user or another human must decide, approve, provide context, or perform a physical/sensitive action.

Examples:

- approve subscription
- approve financial action
- confirm personal memory
- choose business direction
- send sensitive message

### 6. Hybrid System

Use when a deterministic core should be surrounded by agentic reasoning.

Examples:

- governance engine:
  - deterministic policy checks
  - AI explanation/recommendation layer
- coding flow:
  - deterministic tests/build
  - AI developer/reviewer
- research flow:
  - deterministic source capture
  - AI synthesis

## Creator Roles

### Necromancer

Lifecycle owner for AI agents.

Responsible for:

- agent creation
- agent testing
- agent improvement
- agent retirement
- agent templates
- agent permissions
- agent memory/model profiles

### Creator Router

Classification layer.

Responsible for deciding:

- what type of solution is needed
- whether an existing capability can solve it
- whether it should be agentic, deterministic, automated, human, or hybrid
- cost/risk profile
- approval requirements

### Automation Architect

Designs repeatable automations.

Responsible for:

- n8n flows
- scheduled jobs
- external app workflows
- webhooks
- integration sequences

### Deterministic Engineer

Designs predictable software modules.

Responsible for:

- validators
- policy engines
- pure functions
- calculations
- state machines
- tests

### Agentic Orchestrator

Designs multi-agent workflows.

Responsible for:

- planner/reviewer/fixer loops
- Council flows
- agent handoffs
- stopping conditions
- role coordination

## Creation Decision Questions

For every new need, answer:

1. Is reasoning required?
2. Is ambiguity high?
3. Does it need external tools?
4. Does it repeat?
5. Does it need deterministic tests?
6. Does it require approval?
7. Is it cheaper as code than as an LLM call?
8. Can an existing agent/tool/workflow handle it?
9. What is the failure cost?
10. What is the simplest safe solution?

## Decision Matrix

| Need Type | Best Creation |
|---|---|
| predictable rule/check/calculation | deterministic module |
| repeated app/service sequence | automation workflow |
| ambiguous language/research/review | AI agent |
| multi-step reasoning with roles | agentic workflow |
| requires personal judgment/approval | human task |
| mixed predictable + reasoning | hybrid system |

## Anti-Patterns

Do not create an AI agent for:

- simple validation
- math/cost calculation
- permission enforcement
- schema transformation
- status mapping
- repeatable fixed workflow
- tasks that need no reasoning

Do not create deterministic code for:

- open-ended strategy
- research synthesis
- design critique
- ambiguous product decisions
- natural language conversation

## Required Output

Every creation proposal must include:

```ts
type CreationProposal = {
  id: string;
  requestedBy: string;
  businessId?: string;
  needSummary: string;
  recommendedCreationType:
    | "ai_agent"
    | "agentic_workflow"
    | "deterministic_module"
    | "automation_workflow"
    | "human_task"
    | "hybrid_system";
  reasoningRequired: boolean;
  repeatability: "one_time" | "recurring" | "continuous";
  riskLevel: "low" | "medium" | "high" | "critical";
  costProfile: "free_local" | "low" | "medium" | "high";
  approvalRequired: boolean;
  proposedOwner:
    | "necromancer"
    | "creator_router"
    | "automation_architect"
    | "deterministic_engineer"
    | "agentic_orchestrator"
    | "human";
  whyNotSimpler: string;
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
};
```

## Cursor Rule

Before creating any new agent or workflow, Cursor must classify the need first.

Do not assume every need should become an AI agent.
