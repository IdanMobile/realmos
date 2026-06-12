import type { Agent, Task, ToolPermission } from "@realmos/contracts";
import { evaluateAction } from "@realmos/governance";
import type { ProposedAction } from "@realmos/governance";

export type CustomAgentBlueprint = {
  name: string;
  role: string;
  directive: string;
  skills: string[];
  limitations: string[];
  tools?: ToolPermission[];
  canCreateAgents?: boolean;
  canExecuteCode?: boolean;
  canSpendMoney?: boolean;
  canContactHumans?: boolean;
};

const MAX_NAME_LENGTH = 64;
const MAX_ROLE_LENGTH = 64;
const MAX_DIRECTIVE_LENGTH = 500;
const MAX_SKILLS = 12;
const MAX_LIMITATIONS = 12;
const MAX_TOOLS = 8;

export function validateCustomAgentBlueprint(
  blueprint: CustomAgentBlueprint
): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (!blueprint.name.trim()) errors.push("Agent name is required.");
  if (blueprint.name.length > MAX_NAME_LENGTH) errors.push(`Agent name must be <= ${MAX_NAME_LENGTH} characters.`);
  if (!blueprint.role.trim()) errors.push("Agent role is required.");
  if (blueprint.role.length > MAX_ROLE_LENGTH) errors.push(`Agent role must be <= ${MAX_ROLE_LENGTH} characters.`);
  if (!blueprint.directive.trim()) errors.push("Agent directive is required.");
  if (blueprint.directive.length > MAX_DIRECTIVE_LENGTH) {
    errors.push(`Agent directive must be <= ${MAX_DIRECTIVE_LENGTH} characters.`);
  }
  if (blueprint.skills.length === 0) errors.push("At least one skill is required.");
  if (blueprint.skills.length > MAX_SKILLS) errors.push(`Skills must be <= ${MAX_SKILLS}.`);
  if (blueprint.limitations.length === 0) errors.push("At least one limitation is required.");
  if (blueprint.limitations.length > MAX_LIMITATIONS) errors.push(`Limitations must be <= ${MAX_LIMITATIONS}.`);
  if ((blueprint.tools?.length ?? 0) > MAX_TOOLS) errors.push(`Tools must be <= ${MAX_TOOLS}.`);

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

export type AgentActivationReview = {
  allowed: boolean;
  requiresApproval: boolean;
  reasons: string[];
  proposedActions: ProposedAction[];
};

export function reviewAgentActivation(agent: Agent): AgentActivationReview {
  const reasons: string[] = [];
  const proposedActions: ProposedAction[] = [];

  if (agent.canExecuteCode) {
    proposedActions.push({
      type: "terminal_command",
      title: `Activate code-capable agent ${agent.name}`,
      description: "Agent can request code/terminal capabilities.",
      requestedByAgentId: agent.id,
      businessId: agent.businessId
    });
  }

  if (agent.canSpendMoney) {
    proposedActions.push({
      type: "spend_money",
      title: `Activate spending-capable agent ${agent.name}`,
      requestedByAgentId: agent.id,
      businessId: agent.businessId
    });
  }

  if (agent.canCreateAgents || agent.canContactHumans) {
    proposedActions.push({
      type: "change_permissions",
      title: `Activate high-privilege agent ${agent.name}`,
      description: "Agent has elevated permissions that require review.",
      requestedByAgentId: agent.id,
      businessId: agent.businessId
    });
  }

  let requiresApproval = false;
  let allowed = true;

  for (const action of proposedActions) {
    const decision = evaluateAction(action);
    if (decision.outcome === "blocked") {
      allowed = false;
      reasons.push(decision.reason);
    }
    if (decision.outcome === "requires_approval") {
      requiresApproval = true;
      reasons.push(decision.reason);
    }
  }

  if (proposedActions.length === 0) {
    reasons.push("Safe default permissions allow draft/testing activation.");
  }

  return { allowed, requiresApproval, reasons, proposedActions };
}
