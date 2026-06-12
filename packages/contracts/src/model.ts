export type ModelClass = "local_simple" | "online_reasoning" | "online_coding" | "tool_specific";

export type ModelProfile = {
  defaultModelClass: ModelClass;
  fallbackModelClass?: ModelClass;
  maxCostPerRun?: number;
  requiresApprovalAboveCost?: number;
  allowOnline: boolean;
  allowLocal: boolean;
};
