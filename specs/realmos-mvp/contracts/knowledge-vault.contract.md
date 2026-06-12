# Knowledge Vault / Context Pack Contract

```ts
type KnowledgeVaultConfig = {
  id: string;
  provider: "obsidian" | "filesystem_markdown" | "database_only";
  rootPath?: string;
  enabled: boolean;
  writeMode: "disabled" | "manual" | "approved_auto";
  createdAt: string;
  updatedAt: string;
};

type ContextPack = {
  id: string;
  purpose: string;
  memoryRefs: string[];
  summary: string;
  tokenEstimate: number;
  includedScopes: string[];
  excludedReasons?: string[];
  createdAt: string;
};
```
