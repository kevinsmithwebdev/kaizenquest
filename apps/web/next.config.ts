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
  // Keep Turbopack's filesystem root at the monorepo root so workspace
  // packages under libs/ resolve, and so hoisted next/ can be found.
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
