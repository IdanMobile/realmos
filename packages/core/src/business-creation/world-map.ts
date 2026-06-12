import type { Agent, Business, WorldMap } from "@realmos/contracts";
import { generateWorldMap } from "../world/generate-world-map";

export function rebuildWorldMap(input: {
  existing?: WorldMap;
  businesses: Business[];
  agents: Agent[];
}): WorldMap {
  return generateWorldMap(input);
}

export { generateWorldMap, WORLD_MAP_VISUAL_AGENT } from "../world/generate-world-map";
