import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@realmos/contracts": path.resolve(__dirname, "../../packages/contracts/src/index.ts"),
      "@realmos/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
      "@realmos/intelligence": path.resolve(__dirname, "../../packages/intelligence/src/index.ts"),
      "@realmos/work-loop/work-packet-lifecycle": path.resolve(
        __dirname,
        "../../packages/work-loop/src/work-packet-lifecycle.ts"
      ),
      "@realmos/work-loop": path.resolve(__dirname, "../../packages/work-loop/src/index.ts"),
      "@realmos/fleet-control": path.resolve(__dirname, "../../packages/fleet-control/src/index.ts"),
      "@realmos/realm-scope": path.resolve(__dirname, "../../packages/realm-scope/src/index.ts"),
      "@realmos/platform-infra": path.resolve(__dirname, "../../packages/platform-infra/src/index.ts")
    }
  }
});
