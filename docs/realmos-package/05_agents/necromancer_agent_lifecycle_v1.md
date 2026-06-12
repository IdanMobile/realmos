# Necromancer — Agent Lifecycle v1

## Purpose

Necromancer is the Agent Creator and Optimizer.

It should not spawn agents randomly.

It manages agent lifecycle deliberately.

## Lifecycle

### 1. Need Detection

Necromancer detects or receives a need:

- new business created
- task requires specialized role
- repeated work pattern appears
- agent performance is weak
- user requests new agent

### 2. Reuse Check

Before creating a new agent, ask:

- Can an existing agent do this?
- Is this a temporary role?
- Is a tool enough?
- Is a prompt template enough?
- Is this recurring enough for a permanent agent?

### 3. Blueprint

Define:

- name
- role
- directive
- agenda
- business scope
- memory access
- tools
- limitations
- model profile
- budget
- reporting line
- success metrics

### 4. Governance Review

Government checks:

- permissions
- forbidden capabilities
- budget
- data access
- tool access
- approval requirements

### 5. Test Task

Before activation, run a small test:

- produce a short report
- classify a sample task
- generate sample output
- verify formatting
- check role boundaries

### 6. Activation

Agent becomes active only after:

- blueprint complete
- governance approved
- test passed
- user approval if high privilege

### 7. Performance Review

Track:

- task success
- hallucination/mistakes
- cost
- speed
- user satisfaction
- blocked tasks
- corrections needed

### 8. Improvement

Necromancer may update:

- directive
- limitations
- tools
- model profile
- memory access
- examples
- communication style

High-risk changes require approval.

### 9. Retirement

Retire if:

- no longer needed
- duplicate
- low performance
- unsafe
- replaced by better agent
- project archived

## Rule

Agent creation is a product event, not just a prompt.
