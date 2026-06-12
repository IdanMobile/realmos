# RealmOS — SpecKit Operating Guide for Cursor

Cursor must treat this project as a **SpecKit-driven build**.

This means implementation should be driven by:

```text
/specs/realmos-mvp/spec.md
/specs/realmos-mvp/plan.md
/specs/realmos-mvp/tasks.md
/specs/realmos-mvp/acceptance.md
/specs/realmos-mvp/contracts/
```

In this package, the source SpecKit files are located at:

```text
03_speckit/specs/realmos-mvp/
```

When creating the real repo, copy them into:

```text
/specs/realmos-mvp/
```

---

# SpecKit Principles

## 1. Spec Before Code

Do not implement a feature until the relevant spec, plan, tasks, and acceptance are clear.

## 2. Tasks Drive Implementation

Use:

```text
/specs/realmos-mvp/tasks.md
```

as the implementation task list, together with:

```text
18_execution/SSOT_TODO_CHECKLIST.md
```

The SSOT checklist controls phase order.  
The SpecKit tasks define feature-level implementation work.

## 3. Acceptance Drives Done

Use:

```text
/specs/realmos-mvp/acceptance.md
```

to decide if a feature is complete.

## 4. Contracts Drive Boundaries

Use:

```text
/specs/realmos-mvp/contracts/
```

to align APIs, data models, tool boundaries, and generated artifacts.

## 5. No Feature Without Gate

Every meaningful feature must map to:

- requirement
- task
- acceptance gate
- test
- audit/governance behavior if relevant

---

# SpecKit + ADD + TDD Workflow

For each phase:

```text
1. Read SSOT phase.
2. Read matching SpecKit spec/plan/tasks/acceptance.
3. Confirm architecture boundary.
4. Write tests first.
5. Implement minimal code.
6. Run verification.
7. Stop at STOP CHECK.
8. Update task status.
```

---

# Required Cursor Behavior

Cursor should always answer internally:

```text
Which SpecKit requirement am I implementing?
Which task ID/checklist item does this map to?
Which acceptance gate proves it is done?
Which tests prove it works?
Does this affect governance, memory, cost, tool use, or audit?
```

---

# Mapping: SSOT Phases to SpecKit

| SSOT Phase | SpecKit Source |
|---|---|
| Phase 0 Setup | plan.md + tasks.md |
| Phase 1 Contracts | contracts/ + spec.md FRs |
| Phase 2 Dashboard | spec.md US-02, FR-11 |
| Phase 3 API/Persistence | plan.md + contracts |
| Phase 4 Governance | spec.md FR-06 to FR-10 |
| Phase 5 Business Creation | spec.md US-01, FR-01 to FR-05 |
| Phase 6 Necromancer | spec.md US-03, FR-03 to FR-04 |
| Phase 7 SpecKit Generation | spec.md US-04, FR-12 |
| Phase 8 Memory | spec.md US-07, FR-05 |
| Phase 9 Cost/Models | spec.md US-06, FR-13 to FR-14 |
| Phase 10 World | spec.md US-09, FR-15 |
| Phase 11 Tools | spec.md US-05, FR-17 |
| Phase 12 MVP Stabilization | acceptance.md |

---

# How to Update SpecKit During Development

If implementation reveals missing details:

1. Do not silently improvise.
2. Update the relevant SpecKit file.
3. Add or update tasks.
4. Add or update acceptance criteria.
5. Add ADR if architecture changes.
6. Continue implementation.

---

# SpecKit Folder in Real Repo

Cursor should create/copy this structure:

```text
/specs/
  realmos-mvp/
    spec.md
    plan.md
    tasks.md
    acceptance.md
    contracts/
      agent.contract.md
      approval.contract.md
      business.contract.md
      memory.contract.md
      task.contract.md
      world.contract.md
```

---

# SpecKit Stop Rule

If a feature does not have clear acceptance criteria, Cursor must stop and update the SpecKit files before coding it.

Do not implement vague features.
