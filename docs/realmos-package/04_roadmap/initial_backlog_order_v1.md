# RealmOS — Initial Backlog Order v1

This is the recommended order for actual implementation.

## Sprint 0 — Setup

1. Create monorepo.
2. Add TypeScript tooling.
3. Add lint/typecheck/test scripts.
4. Add contracts package.
5. Add mock data.

## Sprint 1 — Dashboard Shell

1. Web app layout.
2. Jarvis panel.
3. Business panel.
4. Agents panel.
5. Tasks panel.
6. Approval queue.
7. Budget panel.
8. Memory panel.
9. Recent activity.

## Sprint 2 — API + Persistence

1. API server.
2. Postgres connection.
3. Migrations.
4. Repositories.
5. CRUD endpoints.
6. Seed data.
7. API client in web app.

## Sprint 3 — Create Business Flow

1. Chat command.
2. Business creation service.
3. Default agent team creation.
4. Default tasks.
5. Memory entries.
6. Audit events.
7. Dashboard update.

## Sprint 4 — SpecKit Generation

1. Artifact writer.
2. Spec generator.
3. Plan generator.
4. Tasks generator.
5. Acceptance generator.
6. Contract stubs.
7. Artifact browser.

## Sprint 5 — Governance

1. Risk classifier.
2. Approval queue logic.
3. Budget policy.
4. Subscription hard gate.
5. Terminal approval mock.
6. Audit events.

## Sprint 6 — LLM Router

1. Model profile contract.
2. Local provider stub.
3. Online provider stub.
4. Cost estimator.
5. Agent model profile mapping.
6. Approval threshold for online usage.

## Sprint 7 — World v0

1. World contract generator.
2. Business nodes.
3. Agent room nodes.
4. Simple map/card renderer.
5. World Visual Agent placeholder.

## Sprint 8 — Real Tool v0

1. Filesystem writer.
2. Terminal runner with approval.
3. GitHub placeholder.
4. Playwright placeholder.
