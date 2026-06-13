export {
  DEFAULT_BUSINESS_TEAM_TEMPLATES,
  SAFE_AGENT_LIMITATIONS,
  type AgentTemplate
} from "./templates/default-business-team";

export {
  createAgentFromTemplate,
  createDefaultBusinessTeam,
  type DefaultTeamResult
} from "./necromancer/template-factory";

export { checkReuseBeforeCreate, findReusableAgent, type ReuseCheckResult } from "./necromancer/reuse-check";

export {
  activateAgent,
  canAssignTaskToAgent,
  isValidLifecycleTransition,
  markAgentTesting,
  pauseAgent,
  retireAgent
} from "./necromancer/lifecycle";

export { classifyCreationNeed, type CreationClassification } from "./necromancer/creator-router";
export { createCreationProposal } from "./necromancer/proposal";

export {
  reviewAgentActivation,
  validateCustomAgentBlueprint,
  type AgentActivationReview,
  type CustomAgentBlueprint
} from "./necromancer/governance-review";

export { createAgentTestTask } from "./necromancer/test-task";

export {
  buildCustomAgentDraft,
  prepareAgentCreationFromProposal,
  type PrepareAgentCreationResult
} from "./necromancer/create-from-proposal";

export {
  detectNecromancerCandidates,
  findNecromancerCandidate,
  isSideProjectScope,
  type NecromancerCandidate,
  type NecromancerCandidateClassification,
  type NecromancerCandidateKind,
  type NecromancerRecommendedAction,
  type NecromancerRiskLevel
} from "./necromancer/candidates";

export {
  prepareNecromancerRecommendation,
  type NecromancerRecommendation
} from "./necromancer/recommendations";

export {
  isBlockedNecromancerActionText,
  validateNecromancerOperatorAction,
  type NecromancerActionValidation,
  type NecromancerOperatorAction
} from "./necromancer/operator-actions";
