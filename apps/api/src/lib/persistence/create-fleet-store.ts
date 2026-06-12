import type {
  Fleet,
  FleetCapacityPolicy,
  FleetRun,
  ParallelWorkPlan,
  Squad,
  WorkConflict
} from "@realmos/contracts";
import type { OperationalPersistenceAdapter } from "./operational-adapter";
import { OperationalTables } from "./operational-tables";
import { createDefaultFleetSeed, type FleetStoreState } from "../fleet-seed";

export type FleetStore = {
  getFleet(): Promise<Fleet>;
  saveFleet(fleet: Fleet): Promise<Fleet>;
  getCapacityPolicy(): Promise<FleetCapacityPolicy>;
  saveCapacityPolicy(policy: FleetCapacityPolicy): Promise<FleetCapacityPolicy>;
  listSquads(): Promise<Squad[]>;
  listFleetRuns(): Promise<FleetRun[]>;
  createFleetRun(run: FleetRun): Promise<FleetRun>;
  updateFleetRun(id: string, patch: Partial<FleetRun>): Promise<FleetRun | null>;
  listParallelWorkPlans(): Promise<ParallelWorkPlan[]>;
  createParallelWorkPlan(plan: ParallelWorkPlan): Promise<ParallelWorkPlan>;
  listWorkConflicts(): Promise<WorkConflict[]>;
  appendWorkConflicts(conflicts: WorkConflict[]): Promise<WorkConflict[]>;
  resetFromSeed(seed: Partial<FleetStoreState>): Promise<void>;
};

export function createFleetStore(adapter: OperationalPersistenceAdapter): FleetStore {
  async function ensureDefaults(): Promise<FleetStoreState> {
    const defaults = createDefaultFleetSeed();
    const fleet = await adapter.readOne<Fleet>(OperationalTables.fleet, defaults.fleet.id);
    if (fleet) {
      const [capacityPolicy, squads] = await Promise.all([
        adapter.readOne<FleetCapacityPolicy>(
          OperationalTables.fleetCapacityPolicy,
          defaults.capacityPolicy.id
        ),
        adapter.readTable<Squad>(OperationalTables.squads)
      ]);
      return {
        fleet,
        capacityPolicy: capacityPolicy ?? defaults.capacityPolicy,
        squads: squads.length > 0 ? squads : defaults.squads,
        fleetRuns: await adapter.readTable<FleetRun>(OperationalTables.fleetRuns),
        parallelWorkPlans: await adapter.readTable<ParallelWorkPlan>(OperationalTables.parallelWorkPlans),
        workConflicts: await adapter.readTable<WorkConflict>(OperationalTables.workConflicts)
      };
    }
    await adapter.upsertOne(OperationalTables.fleet, defaults.fleet);
    await adapter.upsertOne(OperationalTables.fleetCapacityPolicy, defaults.capacityPolicy);
    await adapter.replaceTable(OperationalTables.squads, defaults.squads);
    return defaults;
  }

  return {
    async getFleet() {
      const defaults = createDefaultFleetSeed();
      const fleet = await adapter.readOne<Fleet>(OperationalTables.fleet, defaults.fleet.id);
      return structuredClone(fleet ?? (await ensureDefaults()).fleet);
    },
    saveFleet: (fleet) => adapter.upsertOne(OperationalTables.fleet, fleet),
    async getCapacityPolicy() {
      const defaults = createDefaultFleetSeed();
      const policy = await adapter.readOne<FleetCapacityPolicy>(
        OperationalTables.fleetCapacityPolicy,
        defaults.capacityPolicy.id
      );
      return structuredClone(policy ?? (await ensureDefaults()).capacityPolicy);
    },
    saveCapacityPolicy: (policy) => adapter.upsertOne(OperationalTables.fleetCapacityPolicy, policy),
    async listSquads() {
      const squads = await adapter.readTable<Squad>(OperationalTables.squads);
      if (squads.length === 0) {
        return (await ensureDefaults()).squads;
      }
      return squads;
    },
    listFleetRuns: () => adapter.readTable<FleetRun>(OperationalTables.fleetRuns),
    createFleetRun: (run) => adapter.upsertOne(OperationalTables.fleetRuns, run),
    async updateFleetRun(id, patch) {
      const current = await adapter.readOne<FleetRun>(OperationalTables.fleetRuns, id);
      if (!current) return null;
      const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
      return adapter.upsertOne(OperationalTables.fleetRuns, updated);
    },
    listParallelWorkPlans: () => adapter.readTable<ParallelWorkPlan>(OperationalTables.parallelWorkPlans),
    createParallelWorkPlan: (plan) => adapter.upsertOne(OperationalTables.parallelWorkPlans, plan),
    listWorkConflicts: () => adapter.readTable<WorkConflict>(OperationalTables.workConflicts),
    async appendWorkConflicts(conflicts) {
      for (const conflict of conflicts) {
        await adapter.upsertOne(OperationalTables.workConflicts, conflict);
      }
      return conflicts;
    },
    async resetFromSeed(seed) {
      const defaults = createDefaultFleetSeed();
      await adapter.upsertOne(OperationalTables.fleet, seed.fleet ?? defaults.fleet);
      await adapter.upsertOne(
        OperationalTables.fleetCapacityPolicy,
        seed.capacityPolicy ?? defaults.capacityPolicy
      );
      await adapter.replaceTable(OperationalTables.squads, seed.squads ?? defaults.squads);
      await adapter.replaceTable(OperationalTables.fleetRuns, seed.fleetRuns ?? []);
      await adapter.replaceTable(OperationalTables.parallelWorkPlans, seed.parallelWorkPlans ?? []);
      await adapter.replaceTable(OperationalTables.workConflicts, seed.workConflicts ?? []);
    }
  };
}
