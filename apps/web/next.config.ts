import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(projectRoot, "../..");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@kaizen/domain-goals",
    "@kaizen/shared-utils",
    "@kaizen/shared-contracts",
    "@kaizen/shared-api-client",
  ],
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
