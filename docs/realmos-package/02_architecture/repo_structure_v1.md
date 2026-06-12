# RealmOS — Repo Structure v1

## Recommended Monorepo

```text
realmos/
  README.md
  package.json
  pnpm-workspace.yaml
  turbo.json
  .env.example

  apps/
    web/
      src/
        app/
        components/
        features/
        lib/
        styles/
      package.json

    api/
      src/
        server.ts
        routes/
        modules/
        db/
        config/
      package.json

    worker/
      src/
        worker.ts
        jobs/
        runners/
      package.json

  packages/
    contracts/
      src/
        business.ts
        agent.ts
        task.ts
        memory.ts
        approval.ts
        audit.ts
        budget.ts
        cost.ts
        world.ts
        model.ts
        tool.ts
        run.ts
        artifact.ts
        index.ts

    core/
      src/
        ids.ts
        time.ts
        errors.ts
        result.ts

    agents/
      src/
        templates/
        necromancer/
        council/
        runners/
        reports/

    governance/
      src/
        risk-classifier.ts
        policies.ts
        approval-required.ts
        budget-policy.ts
        governance-kernel.ts

    memory/
      src/
        memory-scope.ts
        memory-writer.ts
        memory-retriever.ts
        summarizer.ts

    tools/
      src/
        tool-registry.ts
        terminal/
        filesystem/
        browser/
        github/

    llm-router/
      src/
        model-profile.ts
        providers/
        router.ts
        cost-estimator.ts

    ui/
      src/
        components/
        cards/
        layout/
        charts/

  specs/
    realmos-mvp/
      spec.md
      plan.md
      tasks.md
      acceptance.md
      contracts/

  docs/
    architecture/
    operations/
    decisions/

  generated/
    businesses/
    artifacts/
    runs/

  scripts/
    seed.ts
    dev-reset.ts
```

## Package Responsibilities

### apps/web

Owns visual dashboard and user interaction.

### apps/api

Owns HTTP API, persistence, and command execution coordination.

### apps/worker

Owns async agent jobs and background tasks.

### packages/contracts

Source of truth for TypeScript domain types.

### packages/core

Shared utilities, IDs, result helpers, errors.

### packages/agents

Agent templates, Necromancer logic, Council logic, agent runners.

### packages/governance

Risk, permission, approval, and budget logic.

### packages/memory

Memory writing, retrieval, summarization, scoping.

### packages/tools

Tool registry and controlled tool runners.

### packages/llm-router

Local/online model routing and cost tracking.

### packages/ui

Reusable UI components.

## Rule

Contracts are the center. UI, API, workers, agents, and tools must all import from contracts rather than inventing local shapes.
