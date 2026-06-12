import type { Agent, CreationProposal } from "@realmos/contracts";
import type { CustomAgentBlueprint } from "./governance-review";
import { validateCustomAgentBlueprint, reviewAgentActivation } from "./governance-review";
import { markAgentTesting } from "./lifecycle";
import { checkReuseBeforeCreate } from "./reuse-check";
import { createAgentTestTask } from "./test-task";
import { SAFE_AGENT_LIMITATIONS } from "../templates/default-business-team";

function nowIso(): string {
  return new Date().toISOString();
}

function makeCustomAgentId(businessId: string, name: string): string {
  const slug = `${businessId}_${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);
  return `agent_${slug}_${Date.now().toString(36)}`;
}

export function buildCustomAgentDraft(input: {
  blueprint: CustomAgentBlueprint;
  businessId: string;
}): Agent {
  const timestamp = nowIso();

  return {
    id: makeCustomAgentId(input.businessId, input.blueprint.name),
    name: input.blueprint.name.trim(),
    role: input.blueprint.role.trim(),
    scope: "business",
    businessId: input.businessId,
    directive: input.blueprint.directive.trim(),
    skills: input.blueprint.skills,
    limitations: input.blueprint.limitations,
    tools: input.blueprint.tools ?? [],
    memoryAccess: [{ scope: "business", access: "read_write", allowedScopeIds: [input.businessId] }],
    modelProfile: {
      defaultModelClass: "local_simple",
      allowOnline: false,
      allowLocal: true
    },
    canCreateAgents: input.blueprint.canCreateAgents ?? false,
    canExecuteCode: input.blueprint.canExecuteCode ?? false,
    canSpendMoney: input.blueprint.canSpendMoney ?? false,
    canContactHumans: input.blueprint.canContactHumans ?? false,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export type PrepareAgentCreationResult =
  | { status: "invalid_proposal"; reason: string }
  | { status: "invalid_blueprint"; errors: string[] }
  | { status: "reuse"; agent: Agent; reason: string }
  | { status: "blocked"; agent: Agent; reasons: string[] }
  | {
      status: "ready";
      agent: Agent;
      testTask: ReturnType<typeof createAgentTestTask>;
      governance: ReturnType<typeof reviewAgentActivation>;
      proposal: CreationProposal;
    };

export function prepareAgentCreationFromProposal(input: {
  proposal: CreationProposal;
  blueprint: CustomAgentBlueprint;
  businessId: string;
  existingAgents: Agent[];
}): PrepareAgentCreationResult {
  if (input.proposal.recommendedCreationType !== "ai_agent") {
    return {
      status: "invalid_proposal",
      reason: `Creation type ${input.proposal.recommendedCreationType} should not become a new AI agent.`
    };
  }

  const blueprintValidation = validateCustomAgentBlueprint(input.blueprint);
  if (!blueprintValidation.valid) {
    return { status: "invalid_blueprint", errors: blueprintValidation.errors };
  }

  const reuse = checkReuseBeforeCreate(input.existingAgents, {
    businessId: input.businessId,
    role: input.blueprint.role
  });
  if (reuse.outcome === "reuse") {
    return { status: "reuse", agent: reuse.agent, reason: reuse.reason };
  }

  const draft = buildCustomAgentDraft({
    blueprint: {
      ...input.blueprint,
      limitations:
        input.blueprint.limitations.length > 0 ? input.blueprint.limitations : SAFE_AGENT_LIMITATIONS
    },
    businessId: input.businessId
  });

  const governance = reviewAgentActivation(draft);
  if (!governance.allowed) {
    return { status: "blocked", agent: draft, reasons: governance.reasons };
  }

  const testingAgent = markAgentTesting(draft);
  const testTask = createAgentTestTask(testingAgent, input.businessId);

  return {
    status: "ready",
    agent: testingAgent,
    testTask,
    governance,
    proposal: input.proposal
  };
}
