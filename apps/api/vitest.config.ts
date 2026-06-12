import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/**/*.postgres.test.ts"]
  },
  resolve: {
    alias: {
      "@realmos/contracts": path.resolve(__dirname, "../../packages/contracts/src/index.ts"),
      "@realmos/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
      "@realmos/agents": path.resolve(__dirname, "../../packages/agents/src/index.ts"),
      "@realmos/governance": path.resolve(__dirname, "../../packages/governance/src/index.ts"),
      "@realmos/tools": path.resolve(__dirname, "../../packages/tools/src/index.ts"),
      "@realmos/memory": path.resolve(__dirname, "../../packages/memory/src/index.ts"),
      "@realmos/llm-router": path.resolve(__dirname, "../../packages/llm-router/src/index.ts"),
      "@realmos/intelligence": path.resolve(__dirname, "../../packages/intelligence/src/index.ts"),
      "@realmos/tool-runner": path.resolve(__dirname, "../../packages/tool-runner/src/index.ts"),
      "@realmos/work-loop": path.resolve(__dirname, "../../packages/work-loop/src/index.ts"),
      "@realmos/fleet-control": path.resolve(__dirname, "../../packages/fleet-control/src/index.ts"),
      "@realmos/realm-scope": path.resolve(__dirname, "../../packages/realm-scope/src/index.ts"),
      "@realmos/platform-infra": path.resolve(__dirname, "../../packages/platform-infra/src/index.ts")
    }
  }
});
