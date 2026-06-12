# RealmOS — Development Guidelines v1

## Code Principles

- TypeScript first.
- Contracts first.
- Small modules.
- Clear boundaries.
- No magic hidden actions.
- Audit everything important.
- Prefer deterministic services before agentic behavior.
- Mock first, integrate later.
- Write tests for safety logic.

## Module Boundary Rules

### Web

May call API and render UI.  
Should not contain governance/business logic.

### API

Coordinates requests and services.  
Should not directly bypass governance.

### Worker

Runs background jobs.  
All tool execution must still go through governance.

### Contracts

No runtime side effects.

### Governance

Pure policy logic where possible.

### Agents

Should propose and produce artifacts.  
Should not directly execute risky tools.

### Tools

Must be registered.  
Must log requests/results.  
Must check permissions.

## Naming

Use clear names:

- `Business`
- `Agent`
- `Task`
- `ApprovalRequest`
- `Memory`
- `AuditEvent`
- `WorldMap`

Avoid vague names:

- `Thing`
- `Process`
- `Handler2`
- `MagicAgent`

## Testing

Every safety rule gets a test.

## Documentation

Every major new subsystem needs:

- purpose
- input/output
- risk
- test coverage
