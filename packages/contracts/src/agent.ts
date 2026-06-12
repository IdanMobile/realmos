import type { ToolPermission } from "./tool";
import type { ModelProfile } from "./model";
import type { MemoryPermission } from "./memory";

export type AgentScope = "global" | "business" | "temporary";
export type AgentStatus = "draft" | "testing" | "active" | "paused" | "retired";

export type Agent = {
  id: string;
  name: string;
  role: string;
  scope: AgentScope;
  businessId?: string;
  directive: string;
  agenda?: string;
  skills: string[];
  limitations: string[];
  tools: ToolPermission[];
  memoryAccess: MemoryPermission[];
  modelProfile: ModelProfile;
  budgetId?: string;
  reportsTo?: string;
  canCreateAgents: boolean;
  canExecuteCode: boolean;
  canSpendMoney: boolean;
  canContactHumans: boolean;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
};
