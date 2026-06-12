# Create Business Flow Service — Blueprint

## Service Name

`createBusinessFromIdea`

## Inputs

```ts
type CreateBusinessFromIdeaInput = {
  userId: string;
  ideaText: string;
  proposedName?: string;
  businessType?: BusinessType;
};
```

## Outputs

```ts
type CreateBusinessFromIdeaResult = {
  business: Business;
  agents: Agent[];
  tasks: Task[];
  memories: Memory[];
  artifacts: Artifact[];
  auditEvents: AuditEvent[];
};
```

## Flow

```text
1. Validate input.
2. Create run: business_creation.
3. Ask Jarvis/Necromancer for business blueprint.
4. Create Business record.
5. Create default agent team.
6. Create initial tasks.
7. Generate initial artifacts:
   - business.md
   - idea-brief.md
   - risks.md
   - specs/spec.md
   - specs/tasks.md
8. Write memory:
   - idea summary
   - decision to create business
   - generated team summary
9. Create audit events.
10. Rebuild world map nodes.
11. Complete run.
12. Return result.
```

## Pseudocode

```ts
export async function createBusinessFromIdea(input: CreateBusinessFromIdeaInput) {
  const run = await runs.start({ kind: "business_creation", requestedBy: user(input.userId) });

  const business = await businesses.create({
    name: input.proposedName ?? inferName(input.ideaText),
    mission: summarizeMission(input.ideaText),
    type: input.businessType ?? "startup",
    status: "planning",
    ownerUserId: input.userId
  });

  await audit.log("business_created", { businessId: business.id });

  const agents = await necromancer.createDefaultTeam({ businessId: business.id });
  const tasks = await taskFactory.createInitialBusinessTasks({ businessId: business.id, ideaText: input.ideaText });
  const artifacts = await speckit.generateInitialArtifacts({ business, agents, tasks, ideaText: input.ideaText });

  await memory.write({
    scope: "business",
    scopeId: business.id,
    kind: "decision",
    title: "Business created from idea",
    content: input.ideaText
  });

  await world.rebuild();
  await runs.complete(run.id);

  return { business, agents, tasks, artifacts };
}
```
