import type { FirebaseRealmOSUsage, LocalNodeUsage } from "@realmos/contracts";
import { buildFirebaseRuntimeConfigFromEnv } from "./firebase-config";

export type FirebaseBaselineConfig = {
  projectId: string;
  enabledUsages: FirebaseRealmOSUsage[];
  notes: string;
  placeholder: true;
};

export type LocalNodeConfig = {
  runtime: "m1_pro_macbook" | "m2_macbook_16gb";
  hostname: string;
  enabledUsages: LocalNodeUsage[];
  ollamaHost: string;
  notes: string;
  placeholder: true;
};

export type GitHubSourceControlConfig = {
  organization: string;
  defaultRemote: string;
  actionsEnabled: false;
  notes: string;
  placeholder: true;
};

export type OllamaRuntimeConfig = {
  baseUrl: string;
  defaultModels: string[];
  offlineFallback: true;
  notes: string;
  placeholder: true;
};

export function buildOllamaRuntimeConfigFromEnv(): OllamaRuntimeConfig {
  const baseUrl = (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(/\/$/, "");
  const defaultModel = (
    process.env.OLLAMA_DEFAULT_MODEL?.trim() ||
    process.env.REALMOS_LOCAL_MODEL?.trim() ||
    "llama3.2:3b"
  ).replace(/^ollama\//, "");

  return {
    baseUrl,
    defaultModels: [defaultModel],
    offlineFallback: true,
    notes: "Local Ollama runtime for Jarvis conversation, summaries, routing, and offline fallback.",
    placeholder: true
  };
}

export const FIREBASE_BASELINE_CONFIG: FirebaseBaselineConfig = {
  projectId: "not-configured",
  enabledUsages: [
    "auth",
    "hosting",
    "firestore",
    "storage",
    "functions",
    "realtime_dashboard_state",
    "realm_metadata",
    "coordination_state",
    "approvals",
    "communication",
    "work_packets",
    "execution_reports"
  ],
  notes: "Firebase stores RealmOS coordination only — not project product runtime.",
  placeholder: true
};

export function buildFirebaseBaselineConfigFromEnv(): FirebaseBaselineConfig {
  const runtime = buildFirebaseRuntimeConfigFromEnv();
  return {
    projectId: runtime.projectId ?? FIREBASE_BASELINE_CONFIG.projectId,
    enabledUsages: runtime.enabledUsages,
    notes: runtime.notes,
    placeholder: true
  };
}

export const M1_PRO_LOCAL_NODE_CONFIG: LocalNodeConfig = {
  runtime: "m1_pro_macbook",
  hostname: "m1-pro.local",
  enabledUsages: [
    "local_llm",
    "local_jarvis_conversations",
    "local_workers",
    "local_scheduler",
    "repo_worktree_execution",
    "private_files",
    "private_memory_vault",
    "local_automation",
    "sync_agent"
  ],
  ollamaHost: "http://127.0.0.1:11434",
  notes: "M1 Pro placeholder — local Jarvis execution node.",
  placeholder: true
};

export const GITHUB_SOURCE_CONTROL_CONFIG: GitHubSourceControlConfig = {
  organization: "idan",
  defaultRemote: "origin",
  actionsEnabled: false,
  notes: "GitHub is source control only — not runtime.",
  placeholder: true
};

export const OLLAMA_LOCAL_LLM_CONFIG: OllamaRuntimeConfig = {
  baseUrl: "http://127.0.0.1:11434",
  defaultModels: ["llama3.2:3b"],
  offlineFallback: true,
  notes: "Local Ollama runtime for Jarvis conversation, summaries, routing, and offline fallback.",
  placeholder: true
};

export function buildLocalNodeConfigFromEnv(): LocalNodeConfig {
  return {
    ...M1_PRO_LOCAL_NODE_CONFIG,
    ollamaHost: buildOllamaRuntimeConfigFromEnv().baseUrl
  };
}
