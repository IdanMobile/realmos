import type {
  Fleet,
  FleetCapacityPolicy,
  FleetRun,
  ParallelWorkPlan,
  Squad,
  WorkConflict
} from "@realmos/contracts";
import { createDefaultFleet, createDefaultFleetCapacityPolicy } from "@realmos/fleet-control";

export function createDefaultFleetSeed() {
  const timestamp = new Date().toISOString();
  const fleet = createDefaultFleet();
  const capacityPolicy = createDefaultFleetCapacityPolicy();

  const squads: Squad[] = [
    {
      id: "squad_backend",
      fleetId: fleet.id,
      name: "Backend Lane",
      lane: "backend",
      supervisorAgentId: "agent_jarvis",
      agentIds: ["agent_alex_backend"],
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "squad_frontend",
      fleetId: fleet.id,
      name: "Frontend Lane",
      lane: "frontend",
      supervisorAgentId: "agent_jarvis",
      agentIds: ["agent_ui_builder"],
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];

  return {
    fleet,
    capacityPolicy,
    squads,
    fleetRuns: [] as FleetRun[],
    parallelWorkPlans: [] as ParallelWorkPlan[],
    workConflicts: [] as WorkConflict[]
  };
}

export type FleetStoreState = ReturnType<typeof createDefaultFleetSeed>;
