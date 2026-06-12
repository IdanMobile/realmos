import type { CreateBusinessFromIdeaResult } from "../business-creation/types";
import { createBusinessFromIdea } from "../business-creation/create-business-from-idea";
import type { BusinessCreationStore } from "../business-creation/types";
import { parseJarvisChatMessage } from "./parse-chat";

export type JarvisChatInput = {
  message: string;
  userId?: string;
  execute?: boolean;
};

export type JarvisChatAction =
  | { type: "propose_business_creation"; requiresApproval: false; ideaText: string }
  | { type: "business_created"; businessId: string; businessName: string };

export type JarvisChatResponse = {
  reply: string;
  actions: JarvisChatAction[];
  result?: {
    businessId: string;
    businessName: string;
    createdAgentIds: string[];
    createdTaskIds: string[];
    createdMemoryIds: string[];
  };
};

function summarizeResult(result: CreateBusinessFromIdeaResult): JarvisChatResponse["result"] {
  return {
    businessId: result.business.id,
    businessName: result.business.name,
    createdAgentIds: result.agents.map((agent) => agent.id),
    createdTaskIds: result.tasks.map((task) => task.id),
    createdMemoryIds: result.memories.map((memory) => memory.id)
  };
}

export async function handleJarvisChat(
  store: BusinessCreationStore,
  input: JarvisChatInput
): Promise<JarvisChatResponse> {
  const parsed = parseJarvisChatMessage(input.message);
  const userId = input.userId ?? "user_idan";
  const execute = input.execute ?? true;

  if (parsed.intent !== "create_business_from_idea" || !parsed.ideaText) {
    return { reply: parsed.reply, actions: [] };
  }

  if (!execute) {
    return {
      reply: parsed.reply,
      actions: [{ type: "propose_business_creation", requiresApproval: false, ideaText: parsed.ideaText }]
    };
  }

  const creation = await createBusinessFromIdea(store, {
    userId,
    ideaText: parsed.ideaText,
    proposedName: parsed.proposedName
  });

  return {
    reply: `${parsed.reply} Business "${creation.business.name}" is ready in the dashboard.`,
    actions: [
      {
        type: "business_created",
        businessId: creation.business.id,
        businessName: creation.business.name
      }
    ],
    result: summarizeResult(creation)
  };
}
