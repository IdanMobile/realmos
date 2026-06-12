import type { Agent, Business, Task, WorldEdge, WorldMap, WorldNode, WorldNodeStatus } from "@realmos/contracts";
import { nowIso } from "../business-creation/id";

export type GenerateWorldMapInput = {
  existing?: WorldMap;
  businesses: Business[];
  agents: Agent[];
  tasks?: Task[];
};

function taskStatusToNodeStatus(status: Task["status"]): WorldNodeStatus {
  if (status === "blocked") return "blocked";
  if (status === "running") return "active";
  if (status === "done") return "healthy";
  return "warning";
}

function agentStatusToNodeStatus(status: Agent["status"]): WorldNodeStatus {
  if (status === "active") return "active";
  if (status === "paused" || status === "retired") return "offline";
  if (status === "testing") return "warning";
  return "healthy";
}

export function generateWorldMap(input: GenerateWorldMapInput): WorldMap {
  const base = input.existing ?? {
    id: "world_default",
    title: "RealmOS World",
    version: "0.1.0",
    nodes: [],
    edges: [],
    updatedAt: nowIso()
  };

  const jarvisNode: WorldNode =
    base.nodes.find((node) => node.kind === "jarvis_hq") ??
    ({
      id: "node_jarvis_hq",
      kind: "jarvis_hq",
      label: "Jarvis HQ",
      status: "active",
      position: { x: 0, y: 0 },
      visualTheme: "cyan",
      characterEnabled: false
    } satisfies WorldNode);

  const nodes: WorldNode[] = [jarvisNode];
  const edges: WorldEdge[] = [];
  const tasks = input.tasks ?? [];

  input.businesses.forEach((business, businessIndex) => {
    const businessNodeId = `node_${business.id}`;
    nodes.push({
      id: businessNodeId,
      kind: "business_land",
      refType: "business",
      refId: business.id,
      label: business.name,
      status: business.status === "active" ? "active" : "healthy",
      position: { x: -200 + businessIndex * 220, y: 100 },
      visualTheme: "blue",
      characterEnabled: false
    });
    edges.push({
      id: `edge_hq_${business.id}`,
      sourceNodeId: jarvisNode.id,
      targetNodeId: businessNodeId,
      kind: "belongs_to"
    });

    const officeId = `node_${business.id}_office`;
    nodes.push({
      id: officeId,
      kind: "office",
      refType: "business",
      refId: business.id,
      label: `${business.name} Office`,
      status: "healthy",
      position: { x: -180 + businessIndex * 220, y: 150 },
      visualTheme: "indigo",
      characterEnabled: false
    });
    edges.push({
      id: `edge_${business.id}_office`,
      sourceNodeId: businessNodeId,
      targetNodeId: officeId,
      kind: "belongs_to"
    });

    const businessAgents = input.agents.filter((agent) => agent.businessId === business.id);
    businessAgents.forEach((agent, agentIndex) => {
      const roomId = `node_${agent.id}_room`;
      nodes.push({
        id: roomId,
        kind: "room",
        refType: "agent",
        refId: agent.id,
        label: `${agent.name} Room`,
        status: agentStatusToNodeStatus(agent.status),
        position: { x: -160 + agentIndex * 90, y: 200 + businessIndex * 50 },
        visualTheme: "violet",
        characterAvatarId: `avatar_${agent.id}`,
        characterPose: "idle",
        characterEnabled: false
      });
      edges.push({
        id: `edge_${business.id}_${agent.id}_room`,
        sourceNodeId: officeId,
        targetNodeId: roomId,
        kind: "belongs_to"
      });

      const deskId = `node_${agent.id}_desk`;
      nodes.push({
        id: deskId,
        kind: "agent_desk",
        refType: "agent",
        refId: agent.id,
        label: agent.name,
        status: agentStatusToNodeStatus(agent.status),
        position: { x: -150 + agentIndex * 90, y: 230 + businessIndex * 50 },
        visualTheme: "slate",
        characterAvatarId: `avatar_${agent.id}`,
        characterPose: "working",
        characterEnabled: false
      });
      edges.push({
        id: `edge_${business.id}_${agent.id}_desk`,
        sourceNodeId: roomId,
        targetNodeId: deskId,
        kind: "works_on"
      });
    });

    const businessTasks = tasks.filter((task) => task.businessId === business.id);
    businessTasks.forEach((task, taskIndex) => {
      const markerId = `node_task_${task.id}`;
      nodes.push({
        id: markerId,
        kind: "task_marker",
        refType: "task",
        refId: task.id,
        label: task.title,
        status: taskStatusToNodeStatus(task.status),
        position: { x: -140 + taskIndex * 70, y: 280 + businessIndex * 50 },
        visualTheme: task.status === "blocked" ? "rose" : "amber",
        characterEnabled: false
      });
      edges.push({
        id: `edge_task_${task.id}`,
        sourceNodeId: businessNodeId,
        targetNodeId: markerId,
        kind: "depends_on"
      });
    });
  });

  return {
    ...base,
    nodes,
    edges,
    updatedAt: nowIso()
  };
}

export const WORLD_MAP_VISUAL_AGENT = {
  id: "agent_world_map_visual",
  name: "World Map Visual Agent",
  role: "World Map Visual Agent",
  status: "planned" as const,
  description:
    "Placeholder for a future agent that arranges world nodes, themes, and character anchors without implementing animation."
};
