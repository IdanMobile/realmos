import type { Agent } from "@realmos/contracts";
import { DEFAULT_BUSINESS_TEAM_TEMPLATES, SAFE_AGENT_LIMITATIONS } from "../templates/default-business-team";
import type { AgentTemplate } from "../templates/default-business-team";

function nowIso(): string {
  return new Date().toISOString();
}

function makeAgentId(businessName: string, template: AgentTemplate): string {
  const slug = `${businessName}_${template.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40);
  return `agent_${slug}_${Date.now().toString(36)}`;
}

function defaultModelProfile(): Agent["modelProfile"] {
  return {
    defaultModelClass: "local_simple",
    allowOnline: false,
    allowLocal: true
  };
}

export function createAgentFromTemplate(input: {
  template: AgentTemplate;
  businessId: string;
  businessIdForMemory: string;
  agentId: string;
  reportsToAgentId?: string;
}): Agent {
  const timestamp = nowIso();

  return {
    id: input.agentId,
    name: input.template.name,
    role: input.template.role,
    scope: "business",
    businessId: input.businessId,
    directive: input.template.directive,
    skills: input.template.skills,
    limitations: input.template.limitations ?? SAFE_AGENT_LIMITATIONS,
    tools: [],
    memoryAccess: [{ scope: "business", access: "read_write", allowedScopeIds: [input.businessIdForMemory] }],
    modelProfile: input.template.modelProfile ?? defaultModelProfile(),
    reportsTo: input.reportsToAgentId,
    canCreateAgents: input.template.canCreateAgents ?? false,
    canExecuteCode: input.template.canExecuteCode ?? false,
    canSpendMoney: input.template.canSpendMoney ?? false,
    canContactHumans: input.template.canContactHumans ?? false,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export type DefaultTeamResult = {
  agents: Agent[];
  ceoAgentId: string;
  agentIdsByKey: Record<"ceo" | "pm", string>;
};

export function createDefaultBusinessTeam(businessId: string, businessName: string): DefaultTeamResult {
  const templateIdsToAgentIds = Object.fromEntries(
    DEFAULT_BUSINESS_TEAM_TEMPLATES.map((template) => [template.templateId, makeAgentId(businessName, template)])
  ) as Record<string, string>;

  const agents = DEFAULT_BUSINESS_TEAM_TEMPLATES.map((template) =>
    createAgentFromTemplate({
      template,
      businessId,
      businessIdForMemory: businessId,
      agentId: templateIdsToAgentIds[template.templateId],
      reportsToAgentId: template.reportsToTemplateId
        ? templateIdsToAgentIds[template.reportsToTemplateId]
        : undefined
    })
  );

  const ceoAgentId = templateIdsToAgentIds.ceo;
  const pmAgentId = templateIdsToAgentIds.pm;
  if (!ceoAgentId || !pmAgentId) {
    throw new Error("Default business team must include CEO and PM templates.");
  }

  return {
    agents,
    ceoAgentId,
    agentIdsByKey: { ceo: ceoAgentId, pm: pmAgentId }
  };
}
