# RealmOS — ADD + TDD Workflow

The project must be built using:

- **ADD — Architecture Driven Development**
- **TDD — Test Driven Development**

## ADD: Architecture Driven Development

Before implementation, every phase must define:

1. Architecture boundary.
2. Contracts affected.
3. Data flow.
4. Safety/governance impact.
5. Tests required.
6. Stop checkpoint.

## TDD: Test Driven Development

For every implementation unit:

1. Write failing test.
2. Implement minimal code.
3. Make test pass.
4. Refactor.
5. Add integration test if flow crosses modules.
6. Update audit/memory/cost behavior if relevant.

## Required Flow Per Phase

```text
Read architecture
↓
Read contracts
↓
Write tests
↓
Implement
↓
Run tests/typecheck
↓
Update docs if needed
↓
STOP CHECK
```

## TDD Examples

### Governance

Test first:

```text
subscription action requires approval
```

Then implement `requiresApproval`.

### Necromancer

Test first:

```text
default business team includes CEO and PM
```

Then implement template factory.

### Memory

Test first:

```text
business agent cannot access unrelated business memory
```

Then implement memory scope guard.

### SpecKit

Test first:

```text
generated spec has User Stories and Acceptance Criteria
```

Then implement generator.

## ADD Check Questions

Before coding, Cursor/agent must answer:

- Which package owns this?
- Which contract does it use?
- Does it touch governance?
- Does it write memory?
- Does it create cost?
- Does it need audit?
- Does it require approval?
- What tests prove it works?

## Rule

If a task touches tool execution, spending, messaging, permissions, camera/mic, trading, or deletion, Governance must be implemented/tested first.
