import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(workspaceRoot, "apps/web");

export default defineConfig({
  resolve: {
    alias: {
      "@": webRoot,
      "@kaizen/shared-utils": path.join(
        workspaceRoot,
        "libs/shared/utils/src/index.ts",
      ),
      "@kaizen/shared-contracts": path.join(
        workspaceRoot,
        "libs/shared/contracts/src/index.ts",
      ),
      "@kaizen/domain-goals": path.join(
        workspaceRoot,
        "libs/domain/goals/src/index.ts",
      ),
    },
  },
  test: {
    environment: "node",
    include: [
      "apps/web/**/*.test.ts",
      "apps/web/**/*.test.tsx",
      "libs/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "apps/web/app/actions/auth/**/*.ts",
        "apps/web/lib/auth/**/*.ts",
        "apps/web/lib/jwt/**/*.ts",
        "apps/web/lib/password/**/*.ts",
      ],
      exclude: [
        "apps/web/app/actions/auth/**/*.test.ts",
        "apps/web/app/actions/auth/test-helpers.ts",
        "apps/web/lib/auth/**/*.test.ts",
        "apps/web/lib/auth/test-helpers.ts",
        "apps/web/lib/jwt/**/*.test.ts",
        "apps/web/lib/password/**/*.test.ts",
      ],
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
    },
  },
});
