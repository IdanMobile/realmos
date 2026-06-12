# Project Infrastructure Isolation Contract

RealmOS infrastructure must not become the runtime infrastructure for projects RealmOS creates or manages.

```text
RealmOS owns orchestration.
Each project owns its product runtime.
```

RealmOS may store project metadata, agents, tasks, work packets, decisions, communication, approvals, and execution reports.

The actual project/app must own its own database, backend, auth, storage, hosting, APIs, secrets, queues, analytics, and runtime infrastructure.

Temporary use of RealmOS resources for project mock/prototype mode requires explicit approval and exit plan.
