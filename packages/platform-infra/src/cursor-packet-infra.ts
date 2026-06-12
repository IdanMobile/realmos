import type { CursorWorkPacket, ProjectInfrastructurePlan } from "@realmos/contracts";
import {
  detectInfrastructureIsolationViolations,
  hasBlockingInfrastructureViolations,
  type PrototypeApprovalInput
} from "./isolation-checks";

export const INFRASTRUCTURE_BOUNDARY_PACKET_RULES = [
  "Do not use RealmOS Firebase, database, auth, storage, or workers as project product runtime.",
  "Project orchestration metadata in RealmOS is allowed; project product data must use dedicated project infra.",
  "Temporary prototype use of RealmOS resources requires explicit user approval and an exit plan.",
  "Delayed platforms (Supabase, Neon, Vercel, etc.) stay delayed unless a real need is documented.",
  "Read PROJECT_INFRASTRUCTURE_ISOLATION.md and PLATFORM_DECISIONS.md before changing infra."
];

export type EnrichInfraPacketInput = {
  packet: CursorWorkPacket;
  plan: ProjectInfrastructurePlan;
  approvals?: import("@realmos/contracts").TemporaryPrototypeInfrastructureApproval[];
};

export function enrichCursorWorkPacketWithInfrastructureBoundary(
  input: EnrichInfraPacketInput
): CursorWorkPacket {
  const approvals = input.approvals ?? [];
  const violations = detectInfrastructureIsolationViolations(input.plan, approvals);
  const blocked = hasBlockingInfrastructureViolations(violations, approvals);

  return {
    ...input.packet,
    filesToRead: [
      ...input.packet.filesToRead,
      "PROJECT_INFRASTRUCTURE_ISOLATION.md",
      "PLATFORM_DECISIONS.md"
    ],
    rules: [
      ...input.packet.rules,
      ...INFRASTRUCTURE_BOUNDARY_PACKET_RULES,
      `Infrastructure mode: ${input.plan.mode} (${input.plan.status})`,
      `Realm infrastructure plan: ${input.plan.id}`
    ],
    expectedOutput: [
      ...input.packet.expectedOutput,
      "Infrastructure boundary respected for project realm",
      violations.length === 0
        ? "No blocking infrastructure isolation violations"
        : `Resolve ${violations.length} infrastructure violation(s) or obtain prototype approval`
    ],
    stopAfter: blocked ? "Resolve infrastructure violations before continuing" : input.packet.stopAfter
  };
}

export type { PrototypeApprovalInput };
