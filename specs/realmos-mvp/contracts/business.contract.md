# Business Contract

```ts
type Business = {
  id: string;
  name: string;
  mission: string;
  type: "startup" | "software_project" | "life_domain" | "automation" | "client" | "crypto" | "content" | "custom";
  status: "idea" | "planning" | "building" | "active" | "paused" | "archived";
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
```
