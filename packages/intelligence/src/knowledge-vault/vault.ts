import type { KnowledgeVaultConfig } from "@realmos/contracts";
import { createKnowledgeVaultConfig } from "../contracts/knowledge-vault-config";

export type ObsidianBridgePlan = {
  status: "planned";
  provider: "obsidian";
  rootPath?: string;
  readEnabled: boolean;
  writeEnabled: boolean;
  notes: string[];
};

export function planObsidianBridge(config: KnowledgeVaultConfig): ObsidianBridgePlan {
  return {
    status: "planned",
    provider: "obsidian",
    rootPath: config.rootPath,
    readEnabled: config.enabled,
    writeEnabled: config.writeMode !== "disabled",
    notes: [
      "Obsidian integration is optional and disabled by default.",
      "Manual or approved_auto writes only; no silent sync.",
      config.rootPath
        ? `Vault root configured at ${config.rootPath}.`
        : "Set rootPath before enabling Obsidian bridge."
    ]
  };
}

export function createDefaultKnowledgeVaultConfig(): KnowledgeVaultConfig {
  return createKnowledgeVaultConfig({
    provider: "database_only",
    enabled: false,
    writeMode: "disabled"
  });
}

export function createObsidianVaultPlaceholder(rootPath: string): KnowledgeVaultConfig {
  return createKnowledgeVaultConfig({
    provider: "obsidian",
    rootPath,
    enabled: false,
    writeMode: "manual"
  });
}
