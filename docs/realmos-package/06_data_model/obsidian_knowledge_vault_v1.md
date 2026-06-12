# Knowledge Vault / Obsidian Memory Bridge v1

## Decision

Use a **Knowledge Vault** with optional Obsidian integration.

Obsidian is a smart move because it gives human-readable local markdown memory, graph-style thinking, backlinks, and long-term knowledge management.

## Purpose

RealmOS should save token usage by not always injecting huge context into prompts.

Instead, it should maintain structured memory and summaries in markdown files that agents can retrieve selectively.

## Why Obsidian Helps

- local-first
- markdown-based
- human-readable
- backlink support
- graph view
- easy manual editing
- works well with long-term personal knowledge
- can separate vaults/folders by business
- can keep summaries instead of raw token-heavy history

## Vault Structure

```text
vault/
  _index.md
  global/
    user-preferences.md
    decisions.md
    recurring-patterns.md
  businesses/
    realmos/
      overview.md
      decisions.md
      specs.md
      agents.md
      tasks.md
      risks.md
      memory-summary.md
    guing/
      overview.md
      decisions.md
      architecture.md
  agents/
    jarvis.md
    necromancer.md
    creator-router.md
    capability-scout.md
  runs/
    daily-summary/
  archive/
```

## Memory Strategy for Token Savings

Do not pass everything to the LLM.

Use layers:

1. raw event logs
2. run summaries
3. task summaries
4. business memory summaries
5. global memory summaries
6. compressed context packs

## Context Pack

Before an agent run, create a small context pack:

```ts
type ContextPack = {
  id: string;
  purpose: string;
  memoryRefs: string[];
  summary: string;
  tokenEstimate: number;
  includedScopes: string[];
  excludedReason?: string[];
};
```

## Obsidian Rules

- Obsidian vault is not the only database.
- Postgres remains queryable source for app state.
- Markdown vault is human-readable knowledge/memory.
- Do not store secrets/API keys.
- Sensitive notes must be marked.
- Agents should write summaries, not huge dumps.
- Memory Keeper controls what becomes long-term memory.

## MVP

Add docs and contracts first.

Actual Obsidian sync can come later as:

- markdown writer
- vault folder setting
- index generation
- backlink generation
- memory compaction job
