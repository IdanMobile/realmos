import type { FastifyInstance } from "fastify";
import type { WorkItem } from "@realmos/contracts";
import { buildParallelWorkPlan, type FleetPlanWorkItem } from "@realmos/fleet-control";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";
import { buildFleetConsole, fleetStore } from "./lib/fleet-store";

export function registerFleetRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/fleet/console", async () =>
    buildFleetConsole({
      getFleet: () => fleetStore.getFleet(),
      getCapacityPolicy: () => fleetStore.getCapacityPolicy(),
      listSquads: () => fleetStore.listSquads(),
      listFleetRuns: () => fleetStore.listFleetRuns(),
      listParallelWorkPlans: () => fleetStore.listParallelWorkPlans(),
      listWorkConflicts: () => fleetStore.listWorkConflicts()
    })
  );

  app.get("/api/fleet/runs", async () => ({ items: await fleetStore.listFleetRuns() }));

  app.get("/api/fleet/plans", async () => ({ items: await fleetStore.listParallelWorkPlans() }));

  app.post("/api/fleet/plans/build", async (request, reply) => {
    const body = request.body as {
      title?: string;
      workItemIds?: string[];
      items?: Array<{
        workItemId: string;
        scopePaths?: string[];
        packagePaths?: string[];
        lane?: FleetPlanWorkItem["lane"];
      }>;
      dependencyEdges?: Array<{ fromWorkItemId: string; toWorkItemId: string }>;
    };

    const fleet = await fleetStore.getFleet();
    const policy = await fleetStore.getCapacityPolicy();
    const allWorkItems = await db.listWorkItems();
    const existingRuns = await fleetStore.listFleetRuns();

    let planItems: FleetPlanWorkItem[] = [];

    if (body.items?.length) {
      planItems = [];
      for (const entry of body.items) {
        const workItem = allWorkItems.find((item) => item.id === entry.workItemId);
        if (!workItem) continue;
        planItems.push({
          workItem,
          scopePaths: entry.scopePaths,
          packagePaths: entry.packagePaths,
          lane: entry.lane
        });
      }
    } else if (body.workItemIds?.length) {
      planItems = body.workItemIds
        .map((id) => allWorkItems.find((item) => item.id === id))
        .filter((item): item is WorkItem => Boolean(item))
        .map((workItem) => ({ workItem }));
    }

    if (planItems.length === 0) {
      return reply.code(400).send({ error: "No valid work items found for fleet plan." });
    }

    const result = buildParallelWorkPlan({
      fleet,
      policy,
      title: body.title ?? "Parallel work plan",
      items: planItems,
      existingRuns,
      dependencyEdges: body.dependencyEdges
    });

    await fleetStore.createParallelWorkPlan(result.plan);
    await fleetStore.appendWorkConflicts(result.conflicts);

    for (const run of result.proposedRuns) {
      await fleetStore.createFleetRun(run);
    }

    await recordAudit(db, {
      actorType: "system",
      eventType: "run_completed",
      summary: `Fleet plan built: ${result.plan.title} (${result.coordinationMode})`,
      payload: {
        planId: result.plan.id,
        executionBlocked: result.executionBlocked,
        conflictCount: result.conflicts.length
      }
    });

    return reply.code(201).send({
      ...result,
      note: "Planning only — uncontrolled swarm execution is disabled."
    });
  });

  app.post("/api/fleet/runs/:id/mark-ready", async (request, reply) => {
    const { id } = request.params as { id: string };
    const run = (await fleetStore.listFleetRuns()).find((item) => item.id === id);
    if (!run) return reply.code(404).send({ error: "Fleet run not found" });

    if (run.status === "blocked") {
      return reply.code(409).send({
        error: "Blocked fleet run cannot be marked ready until conflicts are resolved."
      });
    }

    const updated = await fleetStore.updateFleetRun(id, { status: "ready" });
    return updated;
  });
}
