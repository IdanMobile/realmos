import type { AgentMessage, AgentMessageType } from "@realmos/contracts";

const BLOCKER_TYPES = new Set<AgentMessageType>(["blocker"]);
const ERROR_TYPES = new Set<AgentMessageType>(["error_report"]);
const DECISION_TYPES = new Set<AgentMessageType>([
  "decision_proposal",
  "decision_accepted",
  "decision_rejected"
]);

export function isBlockerMessage(message: AgentMessage): boolean {
  return BLOCKER_TYPES.has(message.type);
}

export function isErrorMessage(message: AgentMessage): boolean {
  return ERROR_TYPES.has(message.type);
}

export function isDecisionMessage(message: AgentMessage): boolean {
  return DECISION_TYPES.has(message.type);
}

export function filterMessagesByType(
  messages: AgentMessage[],
  types: AgentMessageType[]
): AgentMessage[] {
  const allowed = new Set(types);
  return messages.filter((message) => allowed.has(message.type));
}

export function filterBlockerAndErrorMessages(messages: AgentMessage[]): {
  blockers: AgentMessage[];
  errors: AgentMessage[];
} {
  return {
    blockers: messages.filter(isBlockerMessage),
    errors: messages.filter(isErrorMessage)
  };
}
