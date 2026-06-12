export type BusinessType =
  | "startup"
  | "software_project"
  | "life_domain"
  | "automation"
  | "client"
  | "crypto"
  | "content"
  | "custom";

export type BusinessStatus =
  | "idea"
  | "planning"
  | "building"
  | "active"
  | "paused"
  | "archived";

export type BusinessMetric = {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  trend?: "up" | "down" | "flat";
};

export type RiskItem = {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "mitigated" | "accepted";
};

export type Business = {
  id: string;
  name: string;
  mission: string;
  type: BusinessType;
  status: BusinessStatus;
  ownerUserId: string;
  ceoAgentId?: string;
  agentIds: string[];
  taskIds: string[];
  memoryScopeId: string;
  budgetId?: string;
  metrics: BusinessMetric[];
  risks: RiskItem[];
  createdAt: string;
  updatedAt: string;
};
