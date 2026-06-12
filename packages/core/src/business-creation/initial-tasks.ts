import type { Task } from "@realmos/contracts";
import { makeScopedId, nowIso } from "./id";

export function createInitialBusinessTasks(input: {
  businessId: string;
  businessName: string;
  ideaText: string;
  agentIdsByKey: Record<"ceo" | "pm", string>;
  pavelAgentId: string;
  rickAgentId: string;
  stanAgentId: string;
}): Task[] {
  const timestamp = nowIso();

  const templates: Array<{
    title: string;
    goal: string;
    assignedAgentId?: string;
    priority: Task["priority"];
  }> = [
    {
      title: "Capture idea brief and business mission",
      goal: `Document the core idea: ${input.ideaText}`,
      assignedAgentId: input.agentIdsByKey.pm,
      priority: "high"
    },
    {
      title: "Draft initial spec outline",
      goal: "Prepare the first SpecKit spec outline for MVP scope.",
      assignedAgentId: input.pavelAgentId,
      priority: "high"
    },
    {
      title: "Research market and competitors",
      goal: "Identify comparable products, gaps, and positioning.",
      assignedAgentId: input.rickAgentId,
      priority: "medium"
    },
    {
      title: "Identify top risks",
      goal: "List the highest product, technical, and operational risks.",
      assignedAgentId: input.stanAgentId,
      priority: "medium"
    },
    {
      title: "Align CEO priorities",
      goal: `Set initial priorities for ${input.businessName}.`,
      assignedAgentId: input.agentIdsByKey.ceo,
      priority: "medium"
    }
  ];

  return templates.map((template) => ({
    id: makeScopedId("task", `${input.businessName}_${template.title}`),
    businessId: input.businessId,
    title: template.title,
    goal: template.goal,
    assignedAgentId: template.assignedAgentId,
    status: "todo",
    priority: template.priority,
    requiresApproval: false,
    dependencies: [],
    artifacts: [],
    auditEventIds: [],
    createdAt: timestamp,
    updatedAt: timestamp
  }));
}
