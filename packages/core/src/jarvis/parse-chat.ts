import { inferBusinessName } from "../business-creation/infer-name";

export type JarvisChatIntent = "create_business_from_idea" | "unknown";

export type JarvisChatParseResult = {
  intent: JarvisChatIntent;
  reply: string;
  ideaText?: string;
  proposedName?: string;
};

const CREATE_BUSINESS_PATTERNS = [
  /create (?:the )?ecosystem business/i,
  /create (?:a )?business from (?:this )?idea/i,
  /prepare the first spec/i
];

export function parseJarvisChatMessage(message: string): JarvisChatParseResult {
  const normalized = message.trim();
  const isCreateBusiness = CREATE_BUSINESS_PATTERNS.some((pattern) => pattern.test(normalized));

  if (!isCreateBusiness) {
    return {
      intent: "unknown",
      reply:
        'I can create ecosystem businesses from ideas. Try: "Jarvis, I have an idea for a real-time dating app. Create the ecosystem business and prepare the first spec."'
    };
  }

  const ideaMatch = normalized.match(/idea for (?:a |an )?(.+?)(?:[.,]|,\s*create|\s+create|\s+prepare)/i);
  const ideaText = ideaMatch?.[1]?.trim() ?? normalized;
  const proposedName = inferBusinessName(ideaText);

  return {
    intent: "create_business_from_idea",
    ideaText,
    proposedName,
    reply: `Creating ecosystem business "${proposedName}" and preparing the first spec tasks.`
  };
}

export const REAL_TIME_DATING_APP_DEMO_MESSAGE =
  "Jarvis, I have an idea for a real-time dating app. Create the ecosystem business and prepare the first spec.";

export function isRealTimeDatingAppDemoCommand(message: string): boolean {
  return message.trim().toLowerCase() === REAL_TIME_DATING_APP_DEMO_MESSAGE.toLowerCase();
}
