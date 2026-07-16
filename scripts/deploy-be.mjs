#!/usr/bin/env node
/**
 * Deploy Nest services to Railway.
 *
 * Requires:
 *   - Railway CLI (`npm i -g @railway/cli` or use yarn dlx)
 *   - RAILWAY_TOKEN (project token) or an interactive `railway login`
 *   - RAILWAY_PROJECT_ID (recommended for CI; or `railway link` locally)
 *
 * Deploys: auth-service, goals-service, analytics-service, api-gateway
 * (Kafka/Redpanda is created once manually — see docs/deploy.md)
 *
 * Usage: yarn deploy:be
 *        yarn deploy:be --service=api-gateway
 */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") });

const ALL_SERVICES = [
  "auth-service",
  "goals-service",
  "analytics-service",
  "api-gateway",
];

const serviceArg = process.argv.find((a) => a.startsWith("--service="));
const only = serviceArg ? serviceArg.slice("--service=".length) : null;
const services = only ? [only] : ALL_SERVICES;

if (only && !ALL_SERVICES.includes(only)) {
  console.error(
    `Unknown service: ${only}. Expected one of: ${ALL_SERVICES.join(", ")}`,
  );
  process.exit(1);
}

if (!process.env.RAILWAY_TOKEN && !process.env.RAILWAY_API_TOKEN) {
  console.warn(
    "Warning: RAILWAY_TOKEN not set — relying on railway CLI login / linked project.",
  );
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: process.env,
    ...opts,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function railwayAvailable() {
  const result = spawnSync("railway", ["version"], {
    cwd: root,
    shell: true,
    stdio: "pipe",
  });
  return result.status === 0;
}

if (!railwayAvailable()) {
  console.error("Railway CLI not found. Install with: npm i -g @railway/cli");
  process.exit(1);
}

const projectId = process.env.RAILWAY_PROJECT_ID;
const environment =
  process.env.RAILWAY_ENVIRONMENT_ID ?? process.env.RAILWAY_ENVIRONMENT;

for (const service of services) {
  console.log(`\n→ Deploying ${service}...`);
  // Each Railway service must be preconfigured (Dockerfile.service + SERVICE var).
  // See railway/*.toml and docs/deploy.md.
  const args = ["up", "--service", service, "--detach", "--ci"];
  if (projectId) {
    args.push("--project", projectId);
  }
  if (environment) {
    args.push("--environment", environment);
  }
  run("railway", args);
}

console.log("\nBackend deploy triggered for:", services.join(", "));
console.log(
  "Ensure Kafka (Redpanda) is running and Neon URLs + SESSION_SECRET are set — see docs/deploy.md",
);
