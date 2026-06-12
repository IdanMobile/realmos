# Capability Scout / Tool Finder v1

## Decision

Add a **Capability Scout** layer to RealmOS.

Before RealmOS creates a new agent, deterministic module, automation, or workflow, it should check whether an existing capability already solves the need.

Existing capability can mean:

- internal RealmOS tool
- existing agent
- existing workflow
- existing deterministic module
- MCP server
- Cursor skill/rule
- ChatGPT skill
- npm package
- Python package
- GitHub repo
- API/SaaS product
- n8n node/template
- browser extension
- CLI tool
- local app
- macOS Shortcut/AppleScript
- third-party automation platform
- paid subscription/service, with approval

## Why This Is Needed

RealmOS should not rebuild everything.

The best solution may be:

- already installed
- available as open source
- available as a package
- cheaper as SaaS
- safer as deterministic code
- easier as n8n automation
- better as MCP/tool integration
- not worth building now

This saves time, money, and complexity.

## Relationship to Creator Router

The **Creator Router** decides the type of solution needed.

The **Capability Scout** finds the best existing capability for that type.

Recommended flow:

```text
Need appears
  ↓
Creator Router classifies need
  ↓
Capability Scout searches existing options
  ↓
Decision:
  - reuse existing
  - integrate existing
  - configure existing
  - wrap existing
  - build custom
  - ask human
  ↓
Governance approves if risk/cost/tool access required
  ↓
Implementation
```

## Scout Responsibilities

Capability Scout must answer:

1. Does RealmOS already have this capability?
2. Is there an existing open-source package?
3. Is there a maintained API/SaaS/tool?
4. Is there an MCP server?
5. Is there a Cursor/IDE/plugin skill?
6. Is there an n8n node/template?
7. Is there a CLI/local app?
8. Is it safe?
9. Is it maintained?
10. Is it cheaper/faster than building?
11. Does it require money/subscription?
12. Does it require sensitive permissions?
13. Should we integrate, wrap, automate, or build?

## Capability Types

```ts
type CapabilitySource =
  | "internal"
  | "mcp_server"
  | "cursor_skill"
  | "chatgpt_skill"
  | "npm_package"
  | "python_package"
  | "github_repo"
  | "api_saas"
  | "n8n_node"
  | "n8n_template"
  | "browser_extension"
  | "cli_tool"
  | "local_app"
  | "macos_shortcut"
  | "third_party_app"
  | "custom_build";
```

## Capability Evaluation Criteria

Every candidate should be scored on:

- fit to need
- maintenance/activity
- security/privacy risk
- cost
- integration effort
- reliability
- vendor lock-in
- local/offline support
- API quality
- documentation quality
- testability
- governance impact

## Capability Decision Types

```text
reuse_as_is
configure_existing
integrate_api
wrap_with_tool_adapter
automate_with_n8n
build_custom_deterministic
build_custom_agentic
reject
ask_user
```

## Hard Rules

### Subscriptions

If a capability requires a subscription, RealmOS may recommend it, but must not subscribe without explicit approval.

### Spending

If a capability costs money, it must create an approval request.

### Sensitive Access

If a capability requires email, files, browser session, GitHub, camera, microphone, crypto exchange, or private data access, Governance must approve.

### Security

Untrusted tools must not get broad permissions.

### No Blind Installation

Do not install random packages/plugins without:

- purpose
- source
- maintenance check
- security/risk review
- approval if needed

## Capability Scout Output

```ts
type CapabilityCandidate = {
  id: string;
  name: string;
  source: CapabilitySource;
  url?: string;
  summary: string;
  fitScore: number; // 0-100
  costProfile: "free" | "freemium" | "paid" | "unknown";
  requiresSubscription: boolean;
  requiresApproval: boolean;
  permissionsRequired: string[];
  integrationEffort: "low" | "medium" | "high";
  riskLevel: "low" | "medium" | "high" | "critical";
  maintenanceSignal: "unknown" | "low" | "medium" | "high";
  recommendation:
    | "reuse_as_is"
    | "configure_existing"
    | "integrate_api"
    | "wrap_with_tool_adapter"
    | "automate_with_n8n"
    | "build_custom_deterministic"
    | "build_custom_agentic"
    | "reject"
    | "ask_user";
  reasoning: string;
};

type CapabilitySearchReport = {
  id: string;
  needSummary: string;
  creationProposalId?: string;
  searchedSources: CapabilitySource[];
  candidates: CapabilityCandidate[];
  recommendation: CapabilityCandidate;
  buildVsBuyDecision: "use_existing" | "build_custom" | "hybrid" | "ask_user";
  createdAt: string;
};
```

## When to Use Capability Scout

Use it before:

- creating new agent
- creating new workflow
- building a deterministic module
- integrating external tool
- installing package
- adding MCP server
- adding n8n node
- subscribing to service
- connecting sensitive account
- adding browser automation
- adding CLI tool

## When Not Needed

Skip full scout for:

- trivial internal code
- already-decided architecture primitives
- tests
- local type definitions
- docs
- immediate fixes with no external dependency

## Cursor Rule

Before adding a new dependency, package, plugin, external service, MCP server, n8n node, or custom agent, Cursor must create or reference a CapabilitySearchReport.

No new third-party dependency should be added without explaining:

- why it is needed
- alternatives considered
- risk
- cost
- approval requirement
