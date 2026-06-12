import type { Agent, Artifact, Business, Task } from "@realmos/contracts";
import { nowIso } from "../communication-ledger/id";

export function makeArtifactId(businessId: string, relativePath: string): string {
  const slug = `${businessId}_${relativePath}`.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return `artifact_${slug}`;
}

export type SpecKitGenerationInput = {
  business: Business;
  ideaText: string;
  agents: Agent[];
  tasks: Task[];
};

export type GeneratedSpecKitBundle = {
  artifacts: Artifact[];
  files: Array<{ path: string; content: string }>;
};

function artifactPath(relativePath: string): string {
  return relativePath;
}

function teamLines(agents: Agent[]): string {
  return agents.map((agent) => `- ${agent.name} — ${agent.role}`).join("\n");
}

function taskLines(tasks: Task[]): string {
  return tasks.map((task) => `- [ ] ${task.title}`).join("\n");
}

export function generateSpecKitArtifacts(input: SpecKitGenerationInput): GeneratedSpecKitBundle {
  const timestamp = nowIso();
  const { business, ideaText, agents, tasks } = input;

  const files = [
    {
      path: artifactPath("business.md"),
      content: `# ${business.name}

## Mission

${business.mission}

## Status

${business.status}

## Business Type

${business.type}

## Idea

${ideaText}

## Default Team

${teamLines(agents)}

## Initial Goal

Clarify the niche, validate the market, define MVP, create specs, and prepare build roadmap.
`
    },
    {
      path: artifactPath("idea-brief.md"),
      content: `# Idea Brief — ${business.name}

## Problem

Users need a solution described by: ${ideaText}

## Opportunity

Turn this idea into a scoped MVP with explicit acceptance gates before implementation.

## Success Signals

- Clear user problem statement
- MVP scope is bounded
- Risks are documented
- Build tasks are actionable
`
    },
    {
      path: artifactPath("risks.md"),
      content: `# Risks — ${business.name}

## Product Risks

- Scope creep beyond MVP
- Unclear user value proposition

## Technical Risks

- Over-engineering before validation
- Missing governance for risky capabilities

## Operational Risks

- Team coordination without communication ledger discipline

## Mitigations

- Keep MVP non-goals explicit
- Use approval gates for paid/sensitive tools
- Track blockers in communication threads
`
    },
    {
      path: artifactPath("mvp-scope.md"),
      content: `# MVP Scope — ${business.name}

## In Scope (MVP)

- Core user flow for: ${ideaText}
- Operator dashboard visibility (tasks, approvals, costs)
- Safe agent team with governance gates
- SpecKit artifacts before build

## Out of Scope (MVP)

- Production launch and marketing
- Autonomous spending or subscriptions
- Uncontrolled external integrations
- Full game-like world UI

## Validation Milestones

1. Operator confirms problem/solution fit
2. Acceptance gates pass in \`specs/acceptance.md\`
3. Build work packet prepared for project repo
`
    },
    {
      path: artifactPath("roadmap.md"),
      content: `# Roadmap — ${business.name}

## Week 1 — Clarify

- Finalize idea brief and risks
- Confirm MVP scope with operator
- Assign agent tasks

## Week 2 — SpecKit

- Review generated specs
- Lock acceptance gates
- Identify capability/tool needs via Capability Scout

## Week 3 — Build Prep

- Create project infrastructure plan (separate from RealmOS)
- Prepare Cursor work packets
- Set budgets and approval thresholds

## Week 4 — MVP Build

- Implement bounded MVP in project-owned runtime
- Track costs, memory, and audit trail in RealmOS
`
    },
    {
      path: artifactPath("specs/spec.md"),
      content: `# Spec — ${business.name} MVP

## Feature Summary

${ideaText}

## User Stories

### US-01: Core user need

As a user, I want the core experience for ${business.name} so the MVP solves the primary problem.

### US-02: Safe onboarding

As a user, I want a clear onboarding flow with safety controls.

### US-03: Operator visibility

As the operator, I want dashboard visibility into tasks, approvals, and progress.

## MVP Functional Requirements

- business setup
- agent team coordination
- task tracking
- approval gates
- audit trail

## Non-Goals

- full production launch
- autonomous spending
- uncontrolled external integrations
- features not required for MVP validation
`
    },
    {
      path: artifactPath("specs/plan.md"),
      content: `# Plan — ${business.name}

## Phase 1 — Clarify

- Capture idea brief
- Identify risks
- Confirm MVP boundaries

## Phase 2 — SpecKit

- Generate spec, tasks, acceptance
- Review with operator

## Phase 3 — Build

- Implement MVP in project-owned infrastructure
- Keep RealmOS orchestration separate from product runtime

## Verification

- Acceptance gates pass
- Governance gates enforced
`
    },
    {
      path: artifactPath("specs/tasks.md"),
      content: `# Tasks — ${business.name}

## Checklist

${taskLines(tasks)}

## Additional Build Tasks

- [ ] Review generated SpecKit artifacts
- [ ] Confirm non-goals with operator
- [ ] Prepare implementation work packet for Cursor
`
    },
    {
      path: artifactPath("specs/acceptance.md"),
      content: `# Acceptance — ${business.name}

## Gate A — Business Setup

- Business record exists with mission, type, status, and team

## Gate B — SpecKit Artifacts

- business.md, idea-brief.md, risks.md exist
- spec.md, plan.md, tasks.md, acceptance.md exist

## Gate C — Governance

- Risky actions require approval
- Audit events are written

## Gate D — Operator Review

- Operator confirms MVP scope and non-goals
`
    },
    {
      path: artifactPath("contracts/README.md"),
      content: `# Contract Stubs — ${business.name}

Generated placeholder for future typed contracts.

- Define domain entities before implementation
- Keep project runtime contracts separate from RealmOS orchestration contracts
- See \`contracts/business-contract.md\` for first draft entities
`
    },
    {
      path: artifactPath("contracts/business-contract.md"),
      content: `# Business Contract Stub — ${business.name}

## Entities (draft)

- User
- Match / Session (domain-specific)
- Operator audit reference

## Rules

- Project runtime owns product data
- RealmOS owns orchestration metadata only
- Cross-boundary calls must be explicit APIs

## Next Step

Replace this stub with typed contracts before implementation.
`
    }
  ];

  const kindByPath: Record<string, Artifact["kind"]> = {
    "business.md": "report",
    "idea-brief.md": "research",
    "risks.md": "risk",
    "mvp-scope.md": "plan",
    "roadmap.md": "plan",
    "specs/spec.md": "spec",
    "specs/plan.md": "plan",
    "specs/tasks.md": "tasks",
    "specs/acceptance.md": "acceptance",
    "contracts/README.md": "contract",
    "contracts/business-contract.md": "contract"
  };

  const artifacts: Artifact[] = files.map((file) => ({
    id: makeArtifactId(business.id, file.path),
    businessId: business.id,
    kind: kindByPath[file.path] ?? "other",
    title: file.path,
    path: `businesses/${business.id}/${file.path}`,
    content: file.content,
    metadata: {
      generator: "speckit_v0",
      ideaText
    },
    createdAt: timestamp
  }));

  return { artifacts, files };
}

export function assertSpecKitSections(specContent: string): boolean {
  return (
    specContent.includes("## Feature Summary") &&
    specContent.includes("## User Stories") &&
    specContent.includes("## Non-Goals")
  );
}

export function assertTasksChecklist(tasksContent: string): boolean {
  return tasksContent.includes("## Checklist") && tasksContent.includes("- [ ]");
}

export function assertAcceptanceGates(acceptanceContent: string): boolean {
  return acceptanceContent.includes("## Gate A") && acceptanceContent.includes("## Gate B");
}
