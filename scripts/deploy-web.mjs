#!/usr/bin/env node
/**
 * Upsert Vercel production env and deploy the web app.
 *
 * Required in .env.local / env:
 *   VERCEL_TOKEN, SESSION_SECRET, API_GATEWAY_URL
 * Optional:
 *   DATABASE_URL (legacy; only if you still use web Prisma tooling)
 *   VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_SCOPE, VERCEL_PROJECT_NAME
 */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") });

const {
  VERCEL_TOKEN,
  SESSION_SECRET,
  API_GATEWAY_URL,
  DATABASE_URL: rawDatabaseUrl,
  VERCEL_ORG_ID,
  VERCEL_PROJECT_ID,
  VERCEL_SCOPE,
  VERCEL_PROJECT_NAME = "kaizenquest",
} = process.env;

if (!VERCEL_TOKEN) {
  console.error("VERCEL_TOKEN is required");
  process.exit(1);
}
if (!SESSION_SECRET) {
  console.error("SESSION_SECRET is required");
  process.exit(1);
}
if (!API_GATEWAY_URL) {
  console.error(
    "API_GATEWAY_URL is required (public Railway api-gateway HTTPS URL)",
  );
  process.exit(1);
}

let databaseUrl = rawDatabaseUrl;
if (databaseUrl && !databaseUrl.includes("-pooler.")) {
  databaseUrl = databaseUrl.replace(".c-", "-pooler.c-");
}

async function api(method, path, body) {
  const response = await fetch(`https://api.vercel.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `Invalid JSON from Vercel API (${response.status}): ${text.slice(0, 200)}`,
    );
  }

  if (!response.ok) {
    const message = data?.error?.message ?? text;
    throw new Error(
      `Vercel API ${method} ${path} failed (${response.status}): ${message}`,
    );
  }

  return data;
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function upsertViaApi() {
  console.log(`Looking up Vercel project: ${VERCEL_PROJECT_NAME}`);
  const { projects } = await api(
    "GET",
    `/v9/projects?search=${encodeURIComponent(VERCEL_PROJECT_NAME)}`,
  );
  const project = projects?.find((entry) => entry.name === VERCEL_PROJECT_NAME);

  if (!project) {
    throw new Error(`Project not found: ${VERCEL_PROJECT_NAME}`);
  }

  const projectId = project.id;
  const { envs } = await api("GET", `/v9/projects/${projectId}/env`);

  async function upsertEnv(key, value) {
    const existing = envs?.find(
      (env) => env.key === key && env.target?.includes("production"),
    );

    if (existing) {
      await api("PATCH", `/v9/projects/${projectId}/env/${existing.id}`, {
        value,
        target: ["production"],
      });
      console.log(`Updated ${key}`);
      return;
    }

    await api("POST", `/v9/projects/${projectId}/env`, {
      key,
      value,
      type: "encrypted",
      target: ["production"],
    });
    console.log(`Created ${key}`);
  }

  await upsertEnv("SESSION_SECRET", SESSION_SECRET);
  await upsertEnv("API_GATEWAY_URL", API_GATEWAY_URL);
  if (databaseUrl) {
    await upsertEnv("DATABASE_URL", databaseUrl);
  }

  return project;
}

async function main() {
  await upsertViaApi();

  const vercelArgs = ["--token", VERCEL_TOKEN];
  if (VERCEL_SCOPE) {
    vercelArgs.push("--scope", VERCEL_SCOPE);
  }

  if (VERCEL_ORG_ID && VERCEL_PROJECT_ID) {
    process.env.VERCEL_ORG_ID = VERCEL_ORG_ID;
    process.env.VERCEL_PROJECT_ID = VERCEL_PROJECT_ID;
  } else {
    console.log("Linking Vercel project...");
    run("yarn", ["vercel", "link", "--yes", ...vercelArgs]);
  }

  console.log("Pulling production env...");
  run("yarn", [
    "vercel",
    "pull",
    "--yes",
    "--environment=production",
    ...vercelArgs,
  ]);

  console.log("Building...");
  run("yarn", ["vercel", "build", "--prod", ...vercelArgs]);

  console.log("Deploying...");
  run("yarn", ["vercel", "deploy", "--prebuilt", "--prod", ...vercelArgs]);

  console.log("Web deploy complete.");
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
