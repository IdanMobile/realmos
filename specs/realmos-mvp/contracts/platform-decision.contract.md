# Platform Decision Contract

RealmOS MVP baseline platform:

```text
Firebase = primary cloud platform
M1 Pro MacBook = local always-on Jarvis / execution node
GitHub = source control
Ollama = local LLM runtime
```

Delayed until justified:

```text
Supabase, Neon, Vercel, Render, Fly, Railway, BigQuery, Cloud Run
```

## Rule

RealmOS should minimize operational surface area so it can be self-sustained, monitored, and maintained by RealmOS itself.
