# CURSOR_SSOT.md

# RealmOS Cursor Single Source of Truth

This is the only file Cursor should treat as the active operating source of truth.

Other documents are references, but this file decides:

- what Cursor must read
- what Cursor may do
- what Cursor must not do
- what phase is active
- when Cursor must stop
- what report Cursor must produce

If another file conflicts with this file, this file wins.

---

## 0. Open Folder Rule

The active Cursor workspace must be:

```text
realmos/
```

Do not use the outer ZIP folder as the active project root.

Correct:

```text
realmos_cursor_ready_v1_14/realmos/
```

Wrong:

```text
realmos_cursor_ready_v1_14/
```

---

## 1. Current Active Mode

```text
ACTIVE_MODE = mvp_stabilized
ACTIVE_PHASE = Initiative 0.28 complete — Dogfood RealmOS task; await operator-scoped next initiative
IMPLEMENTATION_ALLOWED = false (unless operator scopes a new initiative)
ARCHITECTURE_CHANGES_ALLOWED = false (unless operator approves)
FEATURE_WORK_ALLOWED = false (unless operator scopes a new initiative)
USER_APPROVAL_REQUIRED_BEFORE_NEXT_PHASE = true
```

SSOT phases 0–12, 6.5–6.8, 2.5–2.6 are implemented and checkpoint-approved.  
Post-MVP initiatives 0.18–0.28 (stabilization, Postgres, CI, Ollama, Firebase baseline, executor bridge, lifecycle, Command Center monitor, self-handoff run state, dogfood governance task) are complete.  
Start new work from `PROJECT_STATE.md`, `latest_cursor_handoff.md`, and operator-scoped initiatives — not Phase 0 bootstrap.

---

## 2. First Prompt To Use In Cursor

Use exactly this prompt:

```text
Read CURSOR_SSOT.md and follow it exactly. Do Phase 0 only. Stop after the Phase 0 report and do not start implementation until I approve.
```

Do not point Cursor to many startup files.  
Do not ask Cursor to “figure out the project.”  
Cursor starts from this file.

---

## 3. Phase 0 Goal

Phase 0 is verification only.

Cursor must:

1. inspect repository structure
2. confirm required files exist
3. install dependencies only if needed
4. run verification commands
5. fix only setup/typecheck/test hygiene if required
6. report results
7. stop

Cursor must not implement product features in Phase 0.

---

## 3.1 No Legacy Startup Docs

Cursor must not use legacy startup/read-order documents as active instructions.

If Cursor sees references to older files such as `START_HERE_FOR_CURSOR.md`, old `18_execution/...` paths, or older package versions, treat them as historical package documentation unless `CURSOR_SSOT.md` explicitly says otherwise.

`CURSOR_SSOT.md` is the active control file.

---

## 4. Required Reference Files

Cursor must read these files, but only through the priority of this SSOT file:

```text
PROJECT_STATE.md
docs/realmos-package/99_handoffs/latest_cursor_handoff.md
docs/realmos-package/99_handoffs/new_chat_prompt.md
SSOT_TODO_CHECKLIST.md
SPECKIT_OPERATING_GUIDE.md
ADD_TDD_WORKFLOW.md
STOP_CHECK_GATES.md
VERIFICATION_COMMANDS.md
REALM_SCOPING_ARCHITECTURE.md
REALM_REPOSITORY_BOUNDARY_STRATEGY.md
PLATFORM_DECISIONS.md
PROJECT_INFRASTRUCTURE_ISOLATION.md
```

These files provide detail.  
They do not override this SSOT file.

---

## 5. Locked Product Decisions

These decisions are locked unless the user explicitly changes them.

### Platform

```text
Firebase = RealmOS primary cloud platform
M2 MacBook (16GB) = local Jarvis/execution node
GitHub = source control
Ollama = local LLM runtime
```

Delayed unless justified:

```text
Supabase
Neon
Vercel
Render
Fly
Railway
BigQuery
Cloud Run
```

### Infrastructure Boundary

```text
RealmOS owns orchestration.
Each project owns its product runtime.
```

RealmOS Firebase/database/runtime may store:

- project metadata
- agents
- tasks
- work packets
- communication
- approvals
- decisions
- repository bindings
- execution reports
- artifact references

RealmOS Firebase/database/runtime must not become the production database/backend/auth/storage/runtime for projects RealmOS creates.

Project apps must own their own:

- database
- backend
- auth
- storage
- hosting
- APIs
- secrets
- queues/workers
- analytics
- deployment pipeline

Temporary prototype/mock use requires explicit user approval and an exit plan.

### Initiative roadmap gate (locked 2026-06-12, reinforced)

**Hard rule:** Do not start, recommend, prepare, mention as next initiative, or scope any side project until the **RealmOS base system is complete and verified**.

Side projects remain blocked until the operator explicitly decides from inside a **working RealmOS/Jarvis environment** what to do next — not from Cursor chat history or roadmap docs.

**Main goal:** Finish RealmOS as much as possible so the operator can move from Cursor IDE into RealmOS and manage tasks, changes, planning, execution, verification, and handoff from RealmOS itself.

**RealmOS base system must be completed and verified first**, including:

- Command Center
- navigation
- UI correctness against locked project screenshots / UI references
- Jarvis local interaction path
- Necromancer
- work packet lifecycle
- executor bridge
- run monitor
- durable run-state / self-handoff
- approvals
- verification reporting
- memory/state persistence
- safety/governance
- local Ollama path
- Postgres persistence
- Firebase baseline only as platform wiring
- all other RealmOS base modules already introduced in this project

**Next roadmap remains RealmOS-only** until the base system is complete and verified.

Firebase baseline (Initiative 0.23) is **platform wiring only** — it does not unlock product work or side-project bootstrap.

**Forbidden — do not start, recommend, prepare, or scope (until base system complete):**

```text
GUING
any previous side project
any product bootstrap
any external client/project work
any “project idea” initiative
any non-RealmOS work
product work outside RealmOS
UI polish not required for RealmOS operation
voice / Jarvis personality work
unrelated product features
operator choice: GUING
side project once ready
```

**Allowed upcoming RealmOS-only initiatives (examples — operator approval still required):**

```text
0.32 — Necromancer Verification / Operator UI Hardening
0.33 — Verification Evidence Capture
0.34 — Command Center Task Creation / Operator Flow Hardening
0.35 — Safe Local Executor Consumer Design (no auto-exec without approval)
RealmOS replaces Cursor IDE as primary operator surface
```

**Recommended next initiative:** `0.33 — Verification Evidence Capture`.

Cursor must not recommend GUING, sync-agent product work, side projects, external project work, or UI polish as the default next step while this gate is active.

### Realm / Project Boundary

```text
RealmOS Global Layer != Project / Realm Ecosystem
```

Global RealmOS owns:

- Jarvis
- global dashboard
- governance
- global agents
- global tools
- global settings
- global approvals
- global work queue
- global audit

Each project/realm owns local:

- agents
- tasks
- workflows
- runs
- communication
- memory
- artifacts
- decisions
- analytics
- data
- settings
- repository bindings
- infrastructure plan

### Repository Boundary

Every Cursor Work Packet must declare:

```text
realm
repository
branch/worktree
allowed paths
forbidden paths
verification commands
stop conditions
```

No ambiguous repo work is allowed.

---

## 6. Cursor Operating Rules

Cursor must:

- read before editing
- follow SpecKit + ADD/TDD
- make the smallest safe change
- avoid broad rewrites
- avoid architecture changes unless the active phase requests it
- run verification before claiming success
- continue automatically through safe SSOT tasks unless blocked
- update reports/checklists when work is completed
- preserve the locked decisions above
- monitor context usage during long sessions (see Section 11)
- write durable handoff files before context limits force unsafe work

Cursor must not:

- use `/summarize` or chat compression as the primary context-management strategy
- ask the user to approve routine continuation between safe SSOT phases
- say "continuing automatically" and then stop without doing the next safe task
- end a response by only identifying the "next safe task", "next up", "ready to continue", or "starting at" — if that task is safe, deterministic, listed in `SSOT_TODO_CHECKLIST.md`, and requires no human-only action, Cursor must begin it in the same run
- create Firebase resources in Phase 0
- connect GitHub in Phase 0
- configure Ollama in Phase 0
- implement UI features in Phase 0
- create new architecture in Phase 0
- mix RealmOS infra with project app infra
- mix global RealmOS with project/realm ecosystems
- touch forbidden paths from a work packet
- continue implementation when context is at 85%+ (handoff only)
- recommend or start GUING, side projects, product bootstrap, external client/project work, or any non-RealmOS work while the base-system gate is active (see Section 5)

---

## 7. Verification Commands

Cursor should use the commands from `VERIFICATION_COMMANDS.md`.

Default clean-start check:

```bash
pnpm install
pnpm check:clean-start
```

If dependency install is not needed, Cursor may skip `pnpm install` and explain why.

---

## 7.1 Testing & Quality Gate (locked — Initiative 0.28)

Every new initiative or capability must include tests and verification before being marked **PASS**.

**Rules:**

- Every new initiative/capability must include tests for new behavior.
- No initiative can be marked **PASS** without relevant tests or an **explicit documented test gap** in the initiative audit.
- Required verification gates (run before claiming PASS):

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm check:clean-start
pnpm demo:mvp          # when MVP paths touched
pnpm test:postgres     # when persistence/Postgres paths touched
```

**Coverage expectations by change type:**

| Change type | Required tests |
|-------------|----------------|
| New public contracts | Contract/schema tests |
| New services | Unit tests |
| New API routes | API/integration tests |
| New persistence | Round-trip tests (memory + Postgres when applicable) |
| New UI/operator flows | Component/client tests; document E2E gaps in audit |
| New safety/governance behavior | Regression tests |

**Forbidden:**

- Removing or weakening tests to pass CI without explicit operator approval.
- Silent test skips (`.skip`, `it.skip`, disabled jobs) without audit documentation.
- Marking PASS when core new behavior is untested without listing the gap under audit **remaining risks**.

**Untestable or deferred areas** must be listed in the initiative audit under **remaining risks** with rationale and follow-up initiative.

---

## 8. Phase 0 Report Format

Cursor must stop and report in this format:

```text
# Phase 0 Report

## Files inspected
- ...

## Commands run
- ...

## Result
PASS / FAIL

## Fixes made
- ...

## Risks / blockers
- ...

## Architecture changes
None.

## Product feature changes
None.

## Next recommended action
Prepare Phase 1 work packet / Fix blocker / Ask user decision.

## Approval needed
Yes / No
```

---

## 9. How To Continue After Phase 0

After Phase 0 passes, the user should not reuse the first prompt.

Use:

```text
Read CURSOR_SSOT.md. Based on the latest Phase 0 report and SSOT_TODO_CHECKLIST.md, prepare the next safe Phase 1 work packet. Do not implement yet. Show goal, files, risks, verification commands, and stop conditions.
```

After the user approves the work packet:

```text
Read CURSOR_SSOT.md. Execute the approved Phase 1 work packet only. Follow ADD/TDD and STOP_CHECK_GATES.md. Stop after the phase report.
```

---

## 10. Transition To RealmOS Self-Management

Cursor is the bootstrap builder.

RealmOS becomes the work manager only when these are working:

- Self-Build Console
- Work Loop
- Communication Ledger
- Realm/project scoping
- Repository bindings
- Local node connection
- Work packet creation
- Execution report import

When ready, RealmOS must explicitly report:

```text
RealmOS can now manage work packets internally.
Use RealmOS Self-Build Console for next work selection.
Cursor is now only the code executor.
```

Until that happens, Cursor remains the bootstrap executor and must follow this SSOT.

---

## 11. Context Handoff and New-Chat Continuation

Do **not** use `/summarize` or chat compression as the primary context-management strategy.

When a Cursor chat becomes long, durable repo files are the source of truth for continuation.

### Handoff folder

```text
docs/realmos-package/99_handoffs/
```

Required files:

```text
latest_cursor_handoff.md
new_chat_prompt.md
```

### Context thresholds

Cursor must monitor context usage during long work sessions:

| Context usage | Required action |
|---|---|
| 70% | Continue, but stay aware |
| 75% | Prepare handoff soon |
| 80% | Write/update handoff files now |
| 85% | Stop new implementation after the current atomic edit; write/update handoff files; write/update `new_chat_prompt.md`; tell the user to open a new Cursor chat |
| 90%+ | Do not continue implementation. Handoff only |
| 100% | Unsafe. User may need to revert to the last safe point |

### Correct continuation strategy

1. Write durable handoff files into the repo.
2. Write a durable new-chat continuation prompt into the repo.
3. Stop.
4. Tell the user to open a new Cursor chat and paste the continuation prompt.
5. The new chat resumes from `CURSOR_SSOT.md` + latest handoff.

### `latest_cursor_handoff.md` must include

- current completed phases
- current active phase
- last safe point
- exact next task
- files changed
- important decisions
- tests passing/failing
- commands last run
- known blockers
- risks
- current operating mode
- whether user action is needed
- exact resume instructions

### New chat startup order

In a fresh Cursor chat, Cursor must read in this order:

1. `CURSOR_SSOT.md`
2. `docs/realmos-package/99_handoffs/latest_cursor_handoff.md`
3. `PROJECT_STATE.md`
4. `SSOT_TODO_CHECKLIST.md`

Then continue from the exact next safe task.

### Automatic continuation rule

Identifying a next safe task is **not** a stopping condition. A **critical safety checkpoint** means implement safety-first scaffolding, dry-run mode, contracts, tests, and approval gates first — not stop before doing any work. Stop only when real command execution would be enabled or a human-only action is required.

When a phase report or checkpoint completes, Cursor must:

1. Briefly record the completed phase report (if applicable).
2. Update state/checklists/handoff when needed.
3. **Immediately begin** the next safe task in the same run.

For normal implementation checkpoints:

- continue automatically through safe SSOT tasks
- do not stop after routine PASS phase reports
- do not ask the user to approve routine continuation
- actually perform the next safe task; do not only announce continuation
- do not end responses with phrases such as "Next safe task…", "Next up…", "Ready to continue…", "Continuing automatically…", or "Starting at…" unless stopping for a real blocker listed below

A task is safe to start immediately when it is:

- deterministic
- already listed in `SSOT_TODO_CHECKLIST.md`
- covered by existing architecture/contracts
- not blocked on human-only action

Stop only for real human-only actions, such as:

- external account login/connection
- Firebase/GitHub/Ollama/local machine credentials or manual setup
- payment/subscription/billing
- secrets/API keys/env values
- destructive actions
- unresolved test failures that cannot be safely fixed
- architecture conflicts with `CURSOR_SSOT.md`
- production deployment or public exposure
- Cursor execution/context limits (85%+ handoff rule)

When stopping for handoff, Cursor must end with:

```text
Context handoff prepared. Open a new Cursor chat and paste the prompt from docs/realmos-package/99_handoffs/new_chat_prompt.md.
```
