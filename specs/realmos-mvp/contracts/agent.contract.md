# Agent Contract

```ts
type Agent = {
  id: string;
  name: string;
  role: string;
  scope: "global" | "business" | "temporary";
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
  status: "draft" | "testing" | "active" | "paused" | "retired";
  createdAt: string;
  updatedAt: string;
};
```
