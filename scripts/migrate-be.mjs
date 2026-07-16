#!/usr/bin/env node
/**
 * Apply Prisma migrations for all backend service databases.
 * Requires AUTH_DATABASE_URL, GOALS_DATABASE_URL, ANALYTICS_DATABASE_URL.
 */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") });

const required = [
  "AUTH_DATABASE_URL",
  "GOALS_DATABASE_URL",
  "ANALYTICS_DATABASE_URL",
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`${key} is required (set in .env.local or the environment)`);
    process.exit(1);
  }
}

const services = [
  {
    name: "auth-service",
    config: "apps/auth-service/prisma.config.ts",
  },
  {
    name: "goals-service",
    config: "apps/goals-service/prisma.config.ts",
  },
  {
    name: "analytics-service",
    config: "apps/analytics-service/prisma.config.ts",
  },
];

for (const service of services) {
  console.log(`\n→ Migrating ${service.name}...`);
  const result = spawnSync(
    "yarn",
    ["prisma", "migrate", "deploy", "--config", service.config],
    {
      cwd: root,
      stdio: "inherit",
      shell: true,
      env: process.env,
    },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("\nAll backend migrations applied.");
