# Platform Decisions v1

## Decision

RealmOS uses a simple hybrid platform baseline:

```text
Firebase = primary RealmOS cloud platform
M2 MacBook (16GB) = local always-on Jarvis / execution node
GitHub = source control
Ollama = local LLM runtime
```

This is the baseline for MVP and early long-term development.

## Why

RealmOS is self-sustained. The platform must be easy for RealmOS itself to monitor, operate, explain, and maintain.

Do not start with many services such as Vercel + Supabase + Neon + Render + separate auth + separate storage.

Use Firebase + M1 Pro local node + GitHub + Ollama unless a real need appears.

## Firebase Role

Firebase is the cloud product layer for RealmOS itself.

Use Firebase for:

- Authentication
- Hosting / App Hosting
- Firestore
- Storage
- Cloud Functions when needed
- realtime dashboard state
- users
- realms/projects metadata
- agents metadata
- tasks
- workflows metadata
- runs metadata
- communication threads
- decisions
- approval requests
- repository bindings
- Cursor work packets
- execution reports
- artifact metadata
- settings
- notifications later

Firebase stores RealmOS coordination and state. It does not replace project-specific infrastructure for projects RealmOS builds.

## M2 Local Node Role

The M2 MacBook (16GB) is the dedicated local RealmOS/Jarvis execution node.

Use it for:

- Ollama / local LLM
- local Jarvis conversations
- local workers
- local scheduler
- local repo/worktree execution
- private files
- private memory vault
- local automation
- long-running jobs
- sync agent to Firebase

## GitHub Role

GitHub is source control only:

- repositories
- branches
- worktree references
- pull requests later
- GitHub Actions later
- release history

GitHub is not the runtime brain.

## Ollama Role

Ollama is the local LLM runtime.

Use local models for simple Jarvis conversations, summarization, classification, routing, memory cleanup, task labeling, local notes Q&A, and offline fallback.

Use online models for deep architecture, hard coding tasks, debugging, long-context reasoning, security reviews, complex planning, and council-level decisions.

## Delayed Platforms

Do not use these by default at MVP start:

- Supabase
- Neon
- Vercel
- Render
- Fly
- Railway
- BigQuery
- Cloud Run

Add them only when RealmOS identifies a real need.

## Upgrade Rules

Add Neon or Supabase only if Firestore becomes painful for SQL analytics, relational reporting, complex joins, event warehousing, or branchable SQL needs.

Add Cloud Run only if Firebase Functions become painful for long-running or containerized backend services.

Add Vercel only if Firebase Hosting/App Hosting becomes painful for frontend workflow or previews.

Add BigQuery only if event analytics becomes large.

## Non-Goal

RealmOS must not depend on many cloud providers at MVP start. The system should be understandable, operable, and recoverable by one person.
