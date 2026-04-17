import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      canvas: { browser: "./lib/empty.ts" },
    },
  },
  serverExternalPackages: ["@azure-rest/ai-document-intelligence"],
};

export default nextConfig;
