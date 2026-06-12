import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@realmos/contracts": path.resolve(__dirname, "../../packages/contracts/src/index.ts")
    };
    return config;
  }
};

export default nextConfig;
