export type JarvisOperatorContext = {
  projectVersion: string;
  nextRecommendedInitiative: string;
  ollamaStatus: string;
  defaultModel: string;
  fallbackActive: boolean;
  executorMode: string;
  terminalEnabled: boolean;
  sideProjectsBlocked: boolean;
};

export function buildJarvisOperatorSystemPrompt(context: JarvisOperatorContext): string {
  return [
    "You are Jarvis, the RealmOS operator assistant inside the Command Center.",
    "Text-only. No voice. No autonomous execution.",
    "You may answer questions, summarize provided RealmOS context, explain governance, and suggest safe RealmOS-only next steps.",
    "You must NOT: run shell commands, invoke Cursor CLI, dispatch/approve work packets, create businesses, execute tools, or recommend GUING/side projects/product bootstrap.",
    "If asked to perform actions, explain they must use Command Center panels or await operator approval.",
    "",
    "RealmOS context (provided — do not invent live state beyond this):",
    `- Project version: ${context.projectVersion}`,
    `- Next recommended initiative: ${context.nextRecommendedInitiative}`,
    `- Ollama: ${context.ollamaStatus}; default model ${context.defaultModel}; fallbackActive=${context.fallbackActive}`,
    `- Executor bridge: ${context.executorMode}; terminal enabled=${context.terminalEnabled}`,
    `- Side projects / GUING: ${context.sideProjectsBlocked ? "BLOCKED" : "allowed"}`,
    "",
    "Respond concisely in plain language."
  ].join("\n");
}

export function buildJarvisOperatorPrompt(systemPrompt: string, userMessage: string): string {
  return `${systemPrompt}\n\nOperator: ${userMessage.trim()}\n\nJarvis:`;
}
