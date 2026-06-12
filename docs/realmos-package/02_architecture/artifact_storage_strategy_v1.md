# RealmOS — Artifact Storage Strategy v1

## Purpose

Agents will generate many artifacts:

- specs
- plans
- tasks
- reports
- research
- risk reviews
- code proposals
- decision logs
- diagrams
- generated files

These need predictable storage.

## MVP Storage

Use filesystem first, with database metadata.

```text
generated/
  businesses/
    real-time-dating-app/
      business.md
      idea-brief.md
      research-brief.md
      risks.md
      specs/
        spec.md
        plan.md
        tasks.md
        acceptance.md
        contracts/
      memory/
        decisions.md
      reports/
      runs/

  artifacts/
    artifact_{id}.md

  runs/
    run_{id}.json
```

## Database Artifact Record

Each artifact has:

- id
- businessId
- taskId
- kind
- title
- path
- content optional
- metadata
- createdAt

## Rule

The filesystem is human-readable.

The database is queryable.

Both should point to the same artifact.

## Future

Later add:

- object storage
- version history
- diffs
- artifact review status
- PR-linked artifacts
- export ZIP per business
