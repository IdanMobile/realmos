import type { CreationProposal, CreationType } from "@realmos/contracts";

export type CreationClassification = Pick<
  CreationProposal,
  | "recommendedCreationType"
  | "reasoningRequired"
  | "repeatability"
  | "riskLevel"
  | "costProfile"
  | "approvalRequired"
  | "proposedOwner"
  | "whyNotSimpler"
  | "acceptanceCriteria"
>;

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(phrase));
}

export function classifyCreationNeed(needSummary: string): CreationClassification {
  const text = needSummary.trim().toLowerCase();

  if (includesAny(text, ["approve", "user must", "human decision", "manual approval"])) {
    return {
      recommendedCreationType: "human_task",
      reasoningRequired: false,
      repeatability: "one_time",
      riskLevel: "medium",
      costProfile: "free_local",
      approvalRequired: true,
      proposedOwner: "human",
      whyNotSimpler: "The need explicitly requires human judgment or approval.",
      acceptanceCriteria: ["Human completes or approves the task.", "Decision is recorded in audit/memory."]
    };
  }

  if (includesAny(text, ["validate", "schema", "calculate", "permission check", "enum", "status map"])) {
    return {
      recommendedCreationType: "deterministic_module",
      reasoningRequired: false,
      repeatability: "recurring",
      riskLevel: "low",
      costProfile: "free_local",
      approvalRequired: false,
      proposedOwner: "deterministic_engineer",
      whyNotSimpler: "Predictable rule-based logic is cheaper and easier to test than an AI agent.",
      acceptanceCriteria: ["Module has deterministic tests.", "Behavior is stable for identical inputs."]
    };
  }

  if (includesAny(text, ["schedule", "n8n", "webhook", "cron", "sync job"])) {
    return {
      recommendedCreationType: "automation_workflow",
      reasoningRequired: false,
      repeatability: "recurring",
      riskLevel: "medium",
      costProfile: "low",
      approvalRequired: false,
      proposedOwner: "automation_architect",
      whyNotSimpler: "A repeatable automation workflow is simpler than a conversational agent.",
      acceptanceCriteria: ["Workflow runs on schedule or trigger.", "Failures are logged and visible."]
    };
  }

  if (includesAny(text, ["multi-step", "orchestrat", "handoff", "planner and reviewer"])) {
    return {
      recommendedCreationType: "agentic_workflow",
      reasoningRequired: true,
      repeatability: "recurring",
      riskLevel: "medium",
      costProfile: "medium",
      approvalRequired: false,
      proposedOwner: "agentic_orchestrator",
      whyNotSimpler: "Multiple coordinated roles need a workflow, not a single standalone agent.",
      acceptanceCriteria: ["Workflow defines roles and stopping conditions.", "Each step is auditable."]
    };
  }

  if (includesAny(text, ["governance", "policy", "deterministic", "validator"]) && includesAny(text, ["explain", "recommend"])) {
    return {
      recommendedCreationType: "hybrid_system",
      reasoningRequired: true,
      repeatability: "recurring",
      riskLevel: "medium",
      costProfile: "low",
      approvalRequired: false,
      proposedOwner: "deterministic_engineer",
      whyNotSimpler: "Core checks should stay deterministic with an optional reasoning layer.",
      acceptanceCriteria: ["Deterministic core passes tests.", "Reasoning layer stays advisory."]
    };
  }

  return classifyAsAiAgent(needSummary);
}

function classifyAsAiAgent(needSummary: string): CreationClassification {
  const text = needSummary.trim().toLowerCase();
  const highRisk = includesAny(text, ["financial", "security", "deploy", "terminal", "subscription"]);

  return {
    recommendedCreationType: "ai_agent" satisfies CreationType,
    reasoningRequired: true,
    repeatability: includesAny(text, ["ongoing", "continuous", "always"]) ? "continuous" : "recurring",
    riskLevel: highRisk ? "high" : "medium",
    costProfile: highRisk ? "high" : "low",
    approvalRequired: highRisk,
    proposedOwner: "necromancer",
    whyNotSimpler: "The need involves ambiguity, language, or judgment that benefits from an AI agent.",
    acceptanceCriteria: [
      "Agent has explicit scope, directive, and limitations.",
      "Activation requires governance review and a test task."
    ]
  };
}
