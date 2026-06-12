# RealmOS — Testing Strategy v1

## Testing Goals

RealmOS must be safe, deterministic where possible, and easy to debug.

## Test Types

### Unit Tests

For pure logic:

- risk classifier
- approval rules
- budget policy
- memory scoping
- ID generation
- agent template creation
- world contract generation

### Integration Tests

For module flows:

- create business
- create default agent team
- generate SpecKit artifacts
- create approval request
- write memory
- write audit log
- record cost

### API Tests

For endpoints:

- business CRUD
- agent CRUD
- Jarvis create-business command
- approval approve/reject
- memory create/list
- cost summary

### UI Tests

For dashboard:

- renders businesses
- renders agents
- renders approval queue
- approve/reject buttons
- task board columns
- cost panel
- memory panel

### Golden Output Tests

For generated artifacts:

- spec.md stable structure
- plan.md stable structure
- tasks.md stable structure
- acceptance.md stable structure
- contracts generated

### Safety Tests

Must always pass:

- subscription action requires approval
- money spend requires approval
- message sending requires approval
- camera/mic requires approval
- permission change requires approval
- hiding logs blocked
- terminal command approval required in MVP

## Suggested Tooling

- Vitest for unit/integration
- Playwright for UI later
- Supertest/Fastify inject for API
- Snapshot/golden tests for artifacts

## Rule

No feature is considered done if it bypasses audit logging.
