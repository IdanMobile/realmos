import type { FastifyInstance } from "fastify";
import type { ModelProfile } from "@realmos/contracts";
import { createApprovalRequestFromAction } from "@realmos/governance";
import { invokeRoutedModel, routeAndLogCost, routeModelRequest, summarizeRecordedCost } from "@realmos/llm-router";
import { createCostLoggerStore } from "./lib/cost-store";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";

export function registerModelRouterRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  const store = createCostLoggerStore(db);

  app.post("/api/models/route", async (request) => {
    const body = request.body as {
      taskSummary?: string;
      complexity?: "simple" | "complex";
      modelProfile?: ModelProfile;
      businessId?: string;
      agentId?: string;
      estimatedTokens?: number;
      logCost?: boolean;
    };

    const modelProfile: ModelProfile = body.modelProfile ?? {
      defaultModelClass: "local_simple",
      allowOnline: false,
      allowLocal: true
    };

    const input = {
      taskSummary: body.taskSummary ?? "",
      complexity: body.complexity,
      modelProfile,
      estimatedTokens: body.estimatedTokens,
      businessId: body.businessId,
      agentId: body.agentId
    };

    if (body.logCost) {
      const result = await routeAndLogCost(store, input);
      if (result.costEntry) {
        await recordAudit(db, {
          actorType: "system",
          businessId: body.businessId,
          eventType: "cost_recorded",
          summary: `Recorded cost ${result.costEntry.amount} ${result.costEntry.currency}`,
          payload: { costId: result.costEntry.id, provider: result.costEntry.provider }
        });
      }
      return result;
    }

    const budgets = await db.listBudgets();
    return { decision: routeModelRequest(input, budgets) };
  });

  app.post("/api/models/invoke", async (request, reply) => {
    const body = request.body as {
      taskSummary?: string;
      prompt?: string;
      complexity?: "simple" | "complex";
      modelProfile?: ModelProfile;
      businessId?: string;
      agentId?: string;
      estimatedTokens?: number;
    };

    const modelProfile: ModelProfile = body.modelProfile ?? {
      defaultModelClass: "local_simple",
      allowOnline: false,
      allowLocal: true
    };

    const outcome = await invokeRoutedModel(store, {
      taskSummary: body.taskSummary ?? "",
      prompt: body.prompt ?? body.taskSummary ?? "",
      complexity: body.complexity,
      modelProfile,
      estimatedTokens: body.estimatedTokens,
      businessId: body.businessId,
      agentId: body.agentId
    });

    if (outcome.status === "pending_approval") {
      const approval = createApprovalRequestFromAction(
        {
          type: "other",
          title: "Online model invocation",
          description: `Estimated cost $${outcome.decision.estimatedCostUsd.toFixed(4)} for ${body.taskSummary ?? "model task"}`,
          payload: {
            taskSummary: body.taskSummary,
            prompt: body.prompt,
            decision: outcome.decision
          },
          requestedByAgentId: body.agentId,
          businessId: body.businessId
        },
        {
          outcome: "requires_approval",
          riskLevel: "medium",
          reason: "Model cost exceeds approval threshold."
        }
      );
      const saved = await db.createApproval(approval);
      await recordAudit(db, {
        actorType: "system",
        businessId: body.businessId,
        eventType: "approval_requested",
        summary: "Model invocation requires approval",
        payload: { approvalId: saved.id, estimatedCostUsd: outcome.decision.estimatedCostUsd }
      });
      return reply.code(202).send({ ...outcome, approval: saved });
    }

    if (outcome.status === "completed" && outcome.costEntry) {
      await recordAudit(db, {
        actorType: "system",
        businessId: body.businessId,
        eventType: "cost_recorded",
        summary: `Model invoke cost ${outcome.costEntry.amount} ${outcome.costEntry.currency}`,
        payload: { costId: outcome.costEntry.id, source: outcome.source }
      });
    }

    return outcome;
  });

  app.get("/api/costs/summary", async () => {
    const entries = await db.listCostEntries();
    return summarizeRecordedCost(entries);
  });
}
