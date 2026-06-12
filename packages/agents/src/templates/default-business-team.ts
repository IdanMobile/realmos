import type { ModelProfile } from "@realmos/contracts";

export type AgentTemplate = {
  templateId: string;
  name: string;
  role: string;
  directive: string;
  skills: string[];
  limitations?: string[];
  reportsToTemplateId?: string;
  modelProfile?: ModelProfile;
  canCreateAgents?: boolean;
  canExecuteCode?: boolean;
  canSpendMoney?: boolean;
  canContactHumans?: boolean;
};

export const DEFAULT_BUSINESS_TEAM_TEMPLATES: AgentTemplate[] = [
  {
    templateId: "ceo",
    name: "Ultron",
    role: "CEO",
    directive: "Own business direction, priorities, health, and accountability.",
    skills: ["strategy", "prioritization", "accountability"]
  },
  {
    templateId: "pm",
    name: "Paul",
    role: "Product Manager",
    directive: "Own requirements, roadmap, priorities, and product clarity.",
    skills: ["product", "requirements", "roadmap"],
    reportsToTemplateId: "ceo"
  },
  {
    templateId: "speckit_planner",
    name: "Pavel",
    role: "SpecKit Planner",
    directive: "Own specs, plans, tasks, acceptance, and contracts.",
    skills: ["specs", "planning", "acceptance"],
    reportsToTemplateId: "pm"
  },
  {
    templateId: "research",
    name: "Rick",
    role: "Research",
    directive: "Own market, competitor, technical, and domain research.",
    skills: ["research", "market analysis"],
    reportsToTemplateId: "pm"
  },
  {
    templateId: "risk",
    name: "Stan",
    role: "Risk",
    directive: "Own risks, edge cases, failure modes, and mitigation.",
    skills: ["risk", "edge cases"],
    reportsToTemplateId: "ceo"
  }
];

export const SAFE_AGENT_LIMITATIONS = [
  "No autonomous spending",
  "No external messaging",
  "No terminal access",
  "No permission escalation"
];
