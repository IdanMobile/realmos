import type { Fleet, FleetCapacityPolicy } from "@realmos/contracts";
import { nowIso } from "./id";
import { createDefaultFleetCapacityPolicy } from "./capacity-policy";

export function createDefaultFleet(patch: Partial<Fleet> = {}): Fleet {
  const timestamp = nowIso();
  return {
    id: "fleet_realm_os",
    name: "RealmOS Bootstrap Fleet",
    supervisorAgentId: "agent_jarvis",
    capacityPolicyId: createDefaultFleetCapacityPolicy().id,
    active: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...patch
  };
}

export { createDefaultFleetCapacityPolicy };
