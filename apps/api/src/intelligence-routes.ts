import type { FastifyInstance } from "fastify";
import {
  buildContextPack,
  createDefaultKnowledgeVaultConfig,
  listModelPlatformCandidates,
  planObsidianBridge,
  runSystemOptimizer,
  scoutModelForUseCase
} from "@realmos/intelligence";
import type { RealmOSDatabase } from "./db/types";

export function registerIntelligenceRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/intelligence/optimizer/report", async (request) => {
    const query = request.query as {
      scope?: "global" | "business" | "agent";
      scopeId?: string;
    };

    const [threads, messages, costs] = await Promise.all([
      db.listCommunicationThreads(),
      db.listCommunicationMessages(),
      db.listCostEntries()
    ]);

    const blockers = messages.filter((message) => message.type === "blocker").length;
    const errors = messages.filter((message) => message.type === "error_report").length;
    const onlineCostUsd = costs
      .filter((entry) => entry.provider !== "ollama")
      .reduce((sum, entry) => sum + entry.amount, 0);

    const memories = await db.listMemories();
    const { baselineTokens, savingsTokens, pack } = buildContextPack({
      purpose: "optimizer_snapshot",
      memories,
      maxTokens: 800
    });

    const report = runSystemOptimizer({
      scope: query.scope ?? "global",
      scopeId: query.scopeId,
      communicationBlockerCount: blockers,
      communicationErrorCount: errors,
      openThreadCount: threads.filter((thread) => thread.status === "open").length,
      tokenBaseline: baselineTokens,
      tokenPackEstimate: pack.tokenEstimate,
      onlineCostUsd
    });

    return { report, contextPack: pack, tokenSavings: savingsTokens };
  });

  app.get("/api/intelligence/model-scout/candidates", async () => ({
    items: listModelPlatformCandidates()
  }));

  app.post("/api/intelligence/model-scout/scout", async (request) => {
    const body = request.body as Parameters<typeof scoutModelForUseCase>[0];
    return scoutModelForUseCase(body);
  });

  app.get("/api/intelligence/knowledge-vault/config", async () => ({
    config: createDefaultKnowledgeVaultConfig()
  }));

  app.post("/api/intelligence/knowledge-vault/obsidian-plan", async (request) => {
    const body = request.body as { rootPath: string };
    const config = createDefaultKnowledgeVaultConfig();
    return planObsidianBridge({ ...config, provider: "obsidian", rootPath: body.rootPath });
  });
}
