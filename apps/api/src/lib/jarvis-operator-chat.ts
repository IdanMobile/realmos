import {
  buildJarvisOperatorPrompt,
  buildJarvisOperatorSystemPrompt,
  detectUnsafeJarvisRequest,
  handleJarvisChat,
  parseJarvisChatMessage,
  type JarvisChatResponse
} from "@realmos/core";
import {
  getDefaultLocalRoutingModel,
  invokeLocalModel,
  type LocalModelResult
} from "@realmos/llm-router";
import type { HealthReport } from "./health-export";

export type JarvisChatRouting = {
  provider: "ollama";
  source: "ollama" | "stub";
  model: string;
  fallbackActive: boolean;
  executeAllowed: boolean;
  blocked?: boolean;
  blockReason?: string;
};

export type JarvisOperatorChatResponse = JarvisChatResponse & {
  mode: "operator";
  routing: JarvisChatRouting;
};

function routingFromModel(result: LocalModelResult, health: HealthReport): JarvisChatRouting {
  const fallbackActive = result.source === "stub" || health.checks.ollama.fallbackActive;
  return {
    provider: "ollama",
    source: result.source,
    model: result.model,
    fallbackActive,
    executeAllowed: false
  };
}

function blockedResponse(reason: string, health: HealthReport): JarvisOperatorChatResponse {
  return {
    mode: "operator",
    reply: `${reason} Jarvis operator chat is read-only — use Command Center controls for actions.`,
    actions: [],
    routing: {
      provider: "ollama",
      source: health.checks.ollama.fallbackActive ? "stub" : "ollama",
      model: health.checks.ollama.defaultModel,
      fallbackActive: health.checks.ollama.fallbackActive || health.checks.ollama.status !== "ok",
      executeAllowed: false,
      blocked: true,
      blockReason: reason
    }
  };
}

export async function handleJarvisOperatorChat(
  store: Parameters<typeof handleJarvisChat>[0],
  input: { message: string; userId?: string },
  health: HealthReport
): Promise<JarvisOperatorChatResponse> {
  const safety = detectUnsafeJarvisRequest(input.message);
  if (safety.blocked) {
    return blockedResponse(safety.reason ?? "Request blocked.", health);
  }

  const parsed = parseJarvisChatMessage(input.message);
  if (parsed.intent === "create_business_from_idea") {
    const proposal = await handleJarvisChat(store, {
      message: input.message,
      userId: input.userId,
      execute: false
    });
    return {
      ...proposal,
      mode: "operator",
      reply:
        `${proposal.reply} Business creation is not executed from operator chat — use the explicit create-business API or enable execute outside operator mode.`,
      routing: {
        provider: "ollama",
        source: health.checks.ollama.status === "ok" ? "ollama" : "stub",
        model: health.checks.ollama.defaultModel,
        fallbackActive: health.checks.ollama.fallbackActive || health.checks.ollama.status !== "ok",
        executeAllowed: false
      }
    };
  }

  const systemPrompt = buildJarvisOperatorSystemPrompt({
    projectVersion: health.version,
    nextRecommendedInitiative:
      health.checks.runState.latestNextRecommendedInitiative ??
      "0.32 — Necromancer Verification / Operator UI Hardening",
    ollamaStatus: health.checks.ollama.status,
    defaultModel: health.checks.ollama.defaultModel,
    fallbackActive: health.checks.ollama.fallbackActive,
    executorMode: health.checks.executor.mode,
    terminalEnabled: health.checks.terminal.enabled,
    sideProjectsBlocked: true
  });

  const prompt = buildJarvisOperatorPrompt(systemPrompt, input.message);
  const modelResult = await invokeLocalModel({
    model: getDefaultLocalRoutingModel(),
    prompt,
    baseUrl: health.checks.ollama.baseUrl
  });

  const reply =
    modelResult.output.trim() ||
    "I could not produce a response. Check Ollama health or retry with a shorter question.";

  return {
    mode: "operator",
    reply,
    actions: [],
    routing: routingFromModel(modelResult, health)
  };
}
