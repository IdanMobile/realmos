# RealmOS — Memory Strategy v1

## Purpose

Memory should make Jarvis and agents more useful over time while staying organized, reviewable, and scoped.

## Memory Layers

### Global Jarvis Memory

Stores:

- user preferences
- long-term project directions
- global decisions
- communication style
- important personal workflows
- knowledge learned from conversations

### Business Memory

Stores:

- mission
- product decisions
- specs
- architecture
- risks
- KPIs
- market research
- user feedback
- business-specific agent notes

### Agent Memory

Stores:

- role-specific lessons
- performance notes
- recurring mistakes
- successful patterns
- tool preferences
- business constraints

### Task Memory

Stores:

- task context
- steps taken
- blockers
- outputs
- reviewer comments
- acceptance notes

### Run Memory

Stores:

- exact execution trace
- tool calls
- model used
- cost
- errors
- logs

## Memory Types

- decision
- preference
- knowledge
- summary
- artifact
- event
- risk
- metric
- lesson

## Memory Creation Rules

Automatically save:

- explicit user decisions
- architecture decisions
- business creation
- agent creation
- budget rules
- approval decisions
- important project outcomes

Ask/review before saving:

- sensitive personal info
- private relationships
- financial details
- health/legal data unless explicitly needed
- uncertain inferred preferences

Do not save:

- random trivia
- temporary instructions
- irrelevant personal details
- secrets/API keys

## Retrieval Rules

Jarvis can query global memory.

Business agents can query:

- their business memory
- their own agent memory
- task memory for assigned tasks
- approved global context

Agents cannot freely access all memory.

## Memory Review Screen

Eventually include:

- recent saved memories
- delete memory
- edit memory
- move memory to business/agent scope
- mark sensitive
- mark expired
