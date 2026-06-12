# Model / Platform Scout v1

## Decision

RealmOS should not hardcode one AI provider or model.

Add a **Model / Platform Scout** that evaluates which AI/model/platform is best per use case and can re-evaluate when new models/tools appear.

## Why

AI providers change quickly.

Examples of provider/platform differences:

- OpenAI offers model catalogs, built-in tools, Agents SDK, function/tool calling, and remote MCP support.
- Claude offers strong coding/agentic workflows and computer-use tooling.
- Gemini may be useful for multimodal, Google ecosystem, long context, and image/video cases.
- Kimi/Moonshot changes model versions and may offer strong long-context/coding/agent capabilities.
- Local models via Ollama may be best for cheap/private/simple tasks.

Provider capability, cost, speed, context length, tool access, and model availability change over time.

## What Model Scout Evaluates

- reasoning quality
- coding quality
- tool support
- MCP support
- computer/browser use support
- context length
- multimodal support
- structured output support
- latency
- price
- rate limits
- privacy/data policy
- local/offline availability
- API stability
- deprecation risk
- ecosystem fit
- agent framework/tooling
- region/account availability

## Model Use Cases

```text
simple classification
memory summarization
deep architecture
coding implementation
code review
vision/image understanding
document analysis
research synthesis
browser/computer use
agentic workflows
structured extraction
long-context recall
creative ideation
safety/governance review
```

## Output

```ts
type ModelPlatformCandidate = {
  id: string;
  provider: "openai" | "anthropic" | "google" | "kimi" | "local_ollama" | "other";
  modelName: string;
  useCases: string[];
  strengths: string[];
  weaknesses: string[];
  toolSupport: string[];
  contextWindow?: number;
  costProfile: "free_local" | "low" | "medium" | "high" | "unknown";
  privacyProfile: "local" | "cloud_standard" | "enterprise" | "unknown";
  riskLevel: "low" | "medium" | "high";
  status: "candidate" | "approved" | "deprecated" | "blocked";
};

type ModelRoutingDecision = {
  id: string;
  useCase: string;
  selectedProvider: string;
  selectedModel: string;
  fallbackModels: string[];
  reason: string;
  approvalRequired: boolean;
  maxCostPerRun?: number;
  revisitAfterDays: number;
  createdAt: string;
};
```

## Routing Principle

Use the cheapest/safest model that is good enough.

Suggested starting policy:

- local model: summaries, classifications, memory cleanup
- strong online reasoning model: architecture, product decisions, complex planning
- strong coding model: implementation/debugging/code review
- multimodal model: images/video/docs/screenshots
- computer-use capable model/tool: only after explicit approval
- fallback: if provider is unavailable, route to next approved model

## Re-Evaluation

Model Scout should re-check periodically:

- monthly by default
- when a provider releases major model/tooling
- when costs change
- when quality issues repeat
- when a model is deprecated
- before enabling expensive/autonomous workflows

## Governance

Model changes require approval when they:

- increase cost
- send sensitive data to a new provider
- enable new tool powers
- use computer/browser control
- use camera/mic/vision on private data
- require subscription/API key
