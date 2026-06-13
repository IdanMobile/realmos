import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@realmos/contracts": path.resolve(__dirname, "../../packages/contracts/src/index.ts"),
      "@realmos/work-loop/work-packet-lifecycle": path.resolve(
        __dirname,
        "../../packages/work-loop/src/work-packet-lifecycle.ts"
      ),
      "@realmos/work-loop": path.resolve(__dirname, "../../packages/work-loop/src/index.ts")
    };
    return config;
  }
};

export default nextConfig;
