export type {
  OptimizationReport,
  KnowledgeVaultConfig,
  ContextPack,
  ModelPlatformCandidate,
  ModelRoutingDecision
} from "@realmos/contracts";

export {
  createOptimizationReport,
  createOptimizationFinding,
  createOptimizationRecommendation
} from "./contracts/optimization-report";
export {
  createKnowledgeVaultConfig,
  assertKnowledgeVaultSafe
} from "./contracts/knowledge-vault-config";
export { buildContextPack, estimateFullMemoryTokens } from "./contracts/context-pack";
export {
  createModelPlatformCandidate,
  DEFAULT_MODEL_CANDIDATES
} from "./contracts/model-platform-candidate";
export {
  createModelRoutingDecision,
  requiresModelChangeApproval
} from "./contracts/model-routing-decision";

export { runSystemOptimizer, type OptimizerInput } from "./system-optimizer/optimizer";
export {
  listModelPlatformCandidates,
  scoutModelForUseCase,
  type ModelScoutInput
} from "./model-scout/scout";
export {
  createDefaultKnowledgeVaultConfig,
  createObsidianVaultPlaceholder,
  planObsidianBridge,
  type ObsidianBridgePlan
} from "./knowledge-vault/vault";
