import type { AgentMessage, CommunicationThread } from "@realmos/contracts";
import { filterBlockerAndErrorMessages } from "./filters";
import type { CommunicationAnalyticsSnapshot } from "./types";

export type CommunicationOptimizerHook = {
  name: string;
  metric: string;
  value: number;
  threadIds: string[];
  detail: string;
};

export function buildCommunicationAnalytics(input: {
  threads: CommunicationThread[];
  messages: AgentMessage[];
  decisionCount: number;
}): CommunicationAnalyticsSnapshot {
  const { blockers, errors } = filterBlockerAndErrorMessages(input.messages);
  const threadsWithBlockers = [
    ...new Set(blockers.map((message) => message.threadId))
  ];
  const threadsWithErrors = [...new Set(errors.map((message) => message.threadId))];

  return {
    threadCount: input.threads.length,
    openThreadCount: input.threads.filter((thread) => thread.status === "open").length,
    messageCount: input.messages.length,
    blockerCount: blockers.length,
    errorCount: errors.length,
    decisionCount: input.decisionCount,
    threadsWithBlockers,
    threadsWithErrors
  };
}

export function buildSystemOptimizerCommunicationHooks(
  snapshot: CommunicationAnalyticsSnapshot
): CommunicationOptimizerHook[] {
  const hooks: CommunicationOptimizerHook[] = [];

  if (snapshot.blockerCount > 0) {
    hooks.push({
      name: "communication_blockers",
      metric: "blocker_count",
      value: snapshot.blockerCount,
      threadIds: snapshot.threadsWithBlockers,
      detail: "Threads contain blocker messages that may need escalation or resolution."
    });
  }

  if (snapshot.errorCount > 0) {
    hooks.push({
      name: "communication_errors",
      metric: "error_count",
      value: snapshot.errorCount,
      threadIds: snapshot.threadsWithErrors,
      detail: "Threads contain error reports suitable for System Optimizer review."
    });
  }

  if (snapshot.openThreadCount > 5) {
    hooks.push({
      name: "open_thread_backlog",
      metric: "open_thread_count",
      value: snapshot.openThreadCount,
      threadIds: [],
      detail: "Open communication backlog may indicate coordination bottlenecks."
    });
  }

  return hooks;
}
