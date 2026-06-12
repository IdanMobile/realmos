import type { KnowledgeVaultConfig, KnowledgeVaultProvider } from "@realmos/contracts";

function nowIso(): string {
  return new Date().toISOString();
}

export function createKnowledgeVaultConfig(input: {
  provider: KnowledgeVaultProvider;
  rootPath?: string;
  enabled?: boolean;
  writeMode?: KnowledgeVaultConfig["writeMode"];
  id?: string;
}): KnowledgeVaultConfig {
  const timestamp = nowIso();
  return {
    id: input.id ?? `vault_${Date.now().toString(36)}`,
    provider: input.provider,
    rootPath: input.rootPath,
    enabled: input.enabled ?? false,
    writeMode: input.writeMode ?? "disabled",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function assertKnowledgeVaultSafe(config: KnowledgeVaultConfig): void {
  if (config.provider === "obsidian" && config.writeMode === "approved_auto" && !config.rootPath) {
    throw new Error("Obsidian vault requires rootPath before approved_auto writes.");
  }
}
