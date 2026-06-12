import type { ModelProfile } from "@realmos/contracts";

export const DEFAULT_MODEL_PROFILE: ModelProfile = {
  defaultModelClass: "local_simple",
  allowOnline: false,
  allowLocal: true,
  requiresApprovalAboveCost: 0.5
};

export const ONLINE_CAPABLE_MODEL_PROFILE: ModelProfile = {
  defaultModelClass: "online_reasoning",
  fallbackModelClass: "local_simple",
  allowOnline: true,
  allowLocal: true,
  maxCostPerRun: 2,
  requiresApprovalAboveCost: 0.5
};

export function normalizeModelProfile(profile: Partial<ModelProfile> = {}): ModelProfile {
  return {
    ...DEFAULT_MODEL_PROFILE,
    ...profile,
    allowLocal: profile.allowLocal ?? true,
    allowOnline: profile.allowOnline ?? false
  };
}

export function assertModelProfileSafe(profile: ModelProfile): void {
  if (!profile.allowLocal && !profile.allowOnline) {
    throw new Error("Model profile must allow local or online models.");
  }
}
