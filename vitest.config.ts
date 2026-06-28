import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: [
        "app/actions/auth/**/*.ts",
        "lib/auth/**/*.ts",
        "lib/email/**/*.ts",
        "lib/jwt/**/*.ts",
        "lib/password/**/*.ts",
        "lib/verification-code/**/*.ts",
      ],
      exclude: [
        "app/actions/auth/**/*.test.ts",
        "app/actions/auth/test-helpers.ts",
        "lib/auth/**/*.test.ts",
        "lib/auth/test-helpers.ts",
        "lib/email/**/*.test.ts",
        "lib/jwt/**/*.test.ts",
        "lib/password/**/*.test.ts",
        "lib/verification-code/**/*.test.ts",
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
