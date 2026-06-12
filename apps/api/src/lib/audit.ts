import type { AuditEvent } from "@realmos/contracts";
import { randomUUID } from "node:crypto";
import type { RealmOSDatabase } from "../db/types";

type AuditInput = Omit<AuditEvent, "id" | "createdAt">;

export async function recordAudit(db: RealmOSDatabase, input: AuditInput): Promise<AuditEvent> {
  const event: AuditEvent = {
    id: `audit_${randomUUID()}`,
    createdAt: new Date().toISOString(),
    ...input
  };

  return db.appendAuditEvent(event);
}
