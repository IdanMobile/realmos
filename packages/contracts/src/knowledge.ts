export type KnowledgeVaultProvider = "obsidian" | "filesystem_markdown" | "database_only";

export type KnowledgeVaultConfig = {
  id: string;
  provider: KnowledgeVaultProvider;
  rootPath?: string;
  enabled: boolean;
  writeMode: "disabled" | "manual" | "approved_auto";
  createdAt: string;
  updatedAt: string;
};

export type ContextPack = {
  id: string;
  purpose: string;
  memoryRefs: string[];
  summary: string;
  tokenEstimate: number;
  includedScopes: string[];
  excludedReasons?: string[];
  createdAt: string;
};
