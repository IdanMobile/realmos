# RealmOS MVP — Acceptance

## Gate A — Business Creation

- User can create a new business from Jarvis chat.
- Business appears in dashboard.
- Business has mission, type, status, created time.

## Gate B — Agent Team

- Default agents are created.
- Agents have role, directive, scope, status, permissions, model profile.
- Custom agents can be added later.

## Gate C — SpecKit Artifacts

- spec.md exists.
- plan.md exists.
- tasks.md exists.
- acceptance.md exists.
- contract files exist.

## Gate D — Governance

- Terminal command request creates approval.
- Subscription request is blocked until explicit approval.
- High-risk actions cannot execute directly.
- Audit log records approvals and rejections.

## Gate E — Memory

- Global memory can store decisions.
- Business memory is separate.
- Agent memory is separate.
- Memory summaries can be shown.

## Gate F — Cost

- Costs can be recorded per agent/tool/model/business.
- Monthly budget exists.
- Dashboard shows cost summary.

## Gate G — World Contract

- Dashboard can render businesses and agents from world contract data.
- Contract supports future game-like visual world.

## Gate H — Demo

The complete demo works:

> Jarvis, I have an idea for a real-time dating app. Create the ecosystem business and prepare the first spec.


## Gate I — Creator Router

- Need classification exists.
- CreationProposal contract exists.
- Simple deterministic needs are not converted into AI agents.
- Agent creation flow can reference a CreationProposal.
- Tests prove routing behavior.


## Gate J — Capability Scout

- CapabilitySearchReport contract exists.
- New external tools/dependencies can be evaluated.
- Paid/subscription tools require approval.
- Sensitive-permission tools require approval.
- Creator Router can reference Capability Scout before custom build decisions.


## Gate K — System Optimizer

- OptimizationReport contract exists.
- System can record optimization findings and recommendations.
- Recommendations that change cost/risk require approval.

## Gate L — Knowledge Vault / Context Packs

- KnowledgeVaultConfig contract exists.
- ContextPack contract exists.
- Memory can be summarized for token savings.
- Obsidian/local markdown vault is documented as optional.
- Secrets are forbidden from vault memory.

## Gate M — Model / Platform Scout

- ModelPlatformCandidate contract exists.
- ModelRoutingDecision contract exists.
- Model choice can vary by use case.
- Higher-cost/sensitive-provider changes require approval.
- Model decisions include revisit timing.


## Gate N — Agent Communication Ledger

- CommunicationThread contract exists.
- AgentMessage contract exists.
- Agent messages are stored inside threads.
- User can read full thread history.
- Decisions can be extracted from threads.
- Thread summaries/context packs can reduce token usage.
- Archive entries preserve raw thread references.

## Gate O — Always-On Work Loop

- WorkItem contract exists.
- ContinuousWorkPolicy contract exists.
- CursorWorkPacket contract exists.
- CursorCompletionReport contract exists.
- Safe work can continue without manual user start.
- Critical/user-only work pauses and asks for approval.
- RealmOS Self-Build Console is defined.
- Cursor remains the first executor during bootstrap.

## Gate P — Parallel Agent Fleet

- FleetLane contract exists.
- FleetCapacityPolicy contract exists.
- FleetRun contract exists.
- ParallelWorkPlan contract exists.
- Multiple runs can be represented in parallel.
- Dependencies and conflicts can be represented.
- Capacity limits are represented.
- Parallel work does not bypass approval/governance gates.

## Gate Q — Realm Scoping / Repository Boundaries

- Realm contract exists.
- RealmEnvironment contract exists.
- RepositoryBinding contract exists.
- CursorRepositoryContext contract exists.
- Global and realm scopes are distinct.
- Realm-local agents cannot access other realms by default.
- Cursor Work Packets include repository context.
- Repository conflicts can be represented and blocked.

## Gate R — Platform Decisions / Project Infrastructure Isolation

- Firebase is documented as the primary RealmOS cloud platform.
- M1 Pro local node is documented as the local Jarvis/execution node.
- GitHub is documented as the source-control platform.
- Ollama is documented as the local LLM runtime.
- Delayed platforms have explicit adoption conditions.
- RealmOS orchestration infrastructure is separated from project runtime infrastructure.
- ProjectInfrastructurePlan contract exists.
- InfrastructureIsolationViolation contract exists.
- Projects cannot use RealmOS production platform resources as project production infrastructure without explicit temporary prototype approval and exit plan.
