# Project Infrastructure Isolation v1

## Decision

RealmOS infrastructure must not become the runtime infrastructure for projects that RealmOS creates or manages.

```text
RealmOS infrastructure = orchestration around projects
Project infrastructure = actual runtime for the product/app
```

## Hard Rule

When creating or working on a project/realm:

```text
Do not use RealmOS Firebase, RealmOS database, or RealmOS runtime as the product infrastructure for that project.
```

Only RealmOS orchestration objects around the project can use RealmOS platform infrastructure.

## RealmOS Can Store

RealmOS Firebase can store:

- project metadata
- realm metadata
- agents
- tasks
- workflows
- runs metadata
- communication
- decisions
- approvals
- memory summaries
- work packets
- repository bindings
- execution reports
- artifact references
- project settings inside RealmOS
- project coordination state

These are management/orchestration records.

## Project Must Own

Each real project/app must own its own dedicated infrastructure:

- project database
- project backend
- project auth
- project storage
- project hosting
- project APIs
- project secrets
- project queues/workers
- project analytics
- project runtime environments
- project deployment pipeline

## Example

RealmOS builds GUING.

RealmOS may store GUING tasks, agents, work packets, decisions, repo bindings, communication, and execution reports.

GUING itself must own guing-product infrastructure, guing-brain-lab infrastructure, guing-runtime-server infrastructure, GUING database, GUING storage, GUING deployment, GUING runtime, and GUING secrets.

GUING must not rely on RealmOS Firebase as its product database.

## Temporary Prototype Exception

A project may temporarily use RealmOS-managed mock/prototype infrastructure only when all are true:

- marked as temporary
- marked as non-production
- approved by the user
- has an exit plan
- has a target dedicated project infrastructure decision
- cannot silently become production

## Forbidden Coupling

Forbidden unless explicitly approved as temporary prototype mode:

- project production app data stored in RealmOS Firestore
- project production users stored in RealmOS Auth
- project production files stored in RealmOS Storage
- project production backend functions mixed into RealmOS Functions
- project production secrets stored in RealmOS secrets
- project runtime workers mixed with RealmOS local workers
- project queues mixed with RealmOS orchestration queue

## Correct Boundary

```text
RealmOS owns orchestration.
Each project owns its product runtime.
```

This prevents lock-in, data leakage, accidental coupling, and messy deployments.
