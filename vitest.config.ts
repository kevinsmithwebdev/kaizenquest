import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["app/actions/auth/**/*.ts"],
      exclude: [
        "app/actions/auth/**/*.test.ts",
        "app/actions/auth/test-helpers.ts",
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
