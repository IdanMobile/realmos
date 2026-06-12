# RealmOS — LLM Routing Strategy v1

## Goal

Use the right model for the right task while controlling cost.

## Model Classes

### Local Simple Model

Use for:

- summarization
- classification
- routing
- simple task extraction
- memory cleanup
- low-risk background work

Examples:

- Ollama local model
- small/medium local coding or reasoning model

### Online Strong Reasoning Model

Use for:

- architecture design
- complex planning
- SpecKit generation
- Council decisions
- product strategy
- safety/risk review

### Online Coding Model

Use for:

- code changes
- debugging
- PR planning
- test generation
- architecture-aware implementation

### Tool-Specific Model

Optional later for:

- OCR/vision
- voice
- embeddings
- browser research
- code search

## Agent Model Profiles

Each agent gets a model profile.

Example:

```ts
type ModelProfile = {
  defaultModelClass: "local_simple" | "online_reasoning" | "online_coding";
  fallbackModelClass?: string;
  maxCostPerRun?: number;
  requiresApprovalAboveCost?: number;
  allowOnline: boolean;
  allowLocal: boolean;
};
```

## Suggested Defaults

### Jarvis

- local for simple commands
- online reasoning for major planning

### Necromancer

- online reasoning for agent creation
- local for routine agent status updates

### Pavel / SpecKit

- online reasoning

### Archi

- online reasoning/coding

### Dave/Alex/Freya

- online coding when implementing
- local for small summaries

### Rick

- online reasoning + web research
- local summary cleanup

### Stan

- online reasoning for high-risk review

### Memory Keeper

- local first

### Cost Tracker

- local/simple deterministic

## Cost Rules

- track every online call
- summarize per business and agent
- require approval above threshold
- warn when approaching budget
- subscriptions always need approval
