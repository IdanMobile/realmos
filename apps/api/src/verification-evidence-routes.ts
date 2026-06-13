import type { FastifyInstance } from "fastify";
import type { VerificationCiMetadataInput, VerificationEvidenceInput } from "@realmos/contracts";
import {
  buildCiVerificationEvidenceRecord,
  buildVerificationEvidenceRecord,
  summarizeVerificationEvidence,
  updateRunStateFromEvidence,
  updateRunStateFromWorkPacket
} from "@realmos/work-loop";
import type { RealmOSDatabase } from "./db/types";
import { recordAudit } from "./lib/audit";
import { runStateHandoffStore } from "./lib/run-state-handoff-store";
import { verificationEvidenceStore } from "./lib/verification-evidence-store";
import { workPacketLifecycleStore } from "./lib/work-packet-lifecycle-store";

async function syncRunStateEvidence(input: {
  workPacketId?: string;
  runStateId?: string;
  initiativeId: string;
}): Promise<void> {
  const records = await verificationEvidenceStore.listVerificationEvidenceRecords();
  const summary = summarizeVerificationEvidence({
    initiativeId: input.initiativeId,
    workPacketId: input.workPacketId,
    runStateId: input.runStateId,
    records
  });

  const runState =
    (input.runStateId ? await runStateHandoffStore.getRunState(input.runStateId) : null) ??
    (input.workPacketId
      ? await runStateHandoffStore.getRunStateByPacketId(input.workPacketId)
      : null);

  if (!runState) return;

  let updatedState = updateRunStateFromEvidence(runState, summary).state;

  const packet = await workPacketLifecycleStore.getWorkPacketLifecycleRecord(runState.sourcePacketId);
  if (packet) {
    const synced = updateRunStateFromWorkPacket(updatedState, packet);
    updatedState = { ...synced.state, evidenceSummary: summary };
    updatedState.handoffTextSummary = synced.state.handoffTextSummary;
    updatedState.newChatPromptText = synced.state.newChatPromptText;
  }

  await runStateHandoffStore.updateRunState(runState.id, updatedState);
}

export function registerVerificationEvidenceRoutes(app: FastifyInstance, db: RealmOSDatabase): void {
  app.get("/api/verification/evidence", async (request) => {
    const query = request.query as {
      workPacketId?: string;
      runStateId?: string;
      initiativeId?: string;
    };

    const records = await verificationEvidenceStore.listVerificationEvidenceRecords();
    const filtered = records.filter((record) => {
      if (query.workPacketId && record.workPacketId !== query.workPacketId) return false;
      if (query.runStateId && record.runStateId !== query.runStateId) return false;
      if (query.initiativeId && record.initiativeId !== query.initiativeId) return false;
      return true;
    });

    return { items: filtered.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt)) };
  });

  app.get("/api/verification/evidence/summary", async (request, reply) => {
    const query = request.query as {
      workPacketId?: string;
      runStateId?: string;
      initiativeId?: string;
    };

    if (!query.initiativeId?.trim()) {
      return reply.code(400).send({ error: "initiativeId is required" });
    }

    const records = await verificationEvidenceStore.listVerificationEvidenceRecords();
    return summarizeVerificationEvidence({
      initiativeId: query.initiativeId.trim(),
      workPacketId: query.workPacketId,
      runStateId: query.runStateId,
      records
    });
  });

  app.post("/api/verification/evidence", async (request, reply) => {
    const body = request.body as VerificationEvidenceInput;
    const built = buildVerificationEvidenceRecord(body);

    if (!built.record) {
      return reply.code(400).send({ error: "Validation failed", details: built.errors });
    }

    await verificationEvidenceStore.createVerificationEvidenceRecord(built.record);

    await recordAudit(db, {
      actorType: "user",
      actorId: body.operatorId,
      eventType: "run_completed",
      summary: `Verification evidence attached: ${built.record.gateId}`,
      payload: {
        evidenceId: built.record.id,
        gateId: built.record.gateId,
        workPacketId: built.record.workPacketId,
        runStateId: built.record.runStateId
      }
    });

    await syncRunStateEvidence({
      workPacketId: built.record.workPacketId,
      runStateId: built.record.runStateId,
      initiativeId: built.record.initiativeId
    });

    const summary = summarizeVerificationEvidence({
      initiativeId: built.record.initiativeId,
      workPacketId: built.record.workPacketId,
      runStateId: built.record.runStateId,
      records: await verificationEvidenceStore.listVerificationEvidenceRecords()
    });

    return reply.code(201).send({ record: built.record, summary });
  });

  app.post("/api/verification/evidence/ci", async (request, reply) => {
    const body = request.body as VerificationCiMetadataInput;
    const built = buildCiVerificationEvidenceRecord(body);

    if (!built.record) {
      return reply.code(400).send({ error: "Validation failed", details: built.errors });
    }

    await verificationEvidenceStore.createVerificationEvidenceRecord(built.record);

    await recordAudit(db, {
      actorType: "user",
      actorId: body.operatorId,
      eventType: "run_completed",
      summary: `CI verification evidence linked: ${built.record.gateId}`,
      payload: {
        evidenceId: built.record.id,
        ciRunUrl: built.record.ciRunUrl,
        commitSha: built.record.commitSha
      }
    });

    await syncRunStateEvidence({
      workPacketId: built.record.workPacketId,
      runStateId: built.record.runStateId,
      initiativeId: built.record.initiativeId
    });

    const summary = summarizeVerificationEvidence({
      initiativeId: built.record.initiativeId,
      workPacketId: built.record.workPacketId,
      runStateId: built.record.runStateId,
      records: await verificationEvidenceStore.listVerificationEvidenceRecords()
    });

    return reply.code(201).send({ record: built.record, summary });
  });
}
