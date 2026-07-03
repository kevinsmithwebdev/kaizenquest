import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.local") });

const {
  VERCEL_TOKEN,
  DATABASE_URL: rawDatabaseUrl,
  SESSION_SECRET,
  RESEND_API_KEY,
} = process.env;

if (!VERCEL_TOKEN) {
  console.error(
    "VERCEL_TOKEN is required — create one at https://vercel.com/account/tokens",
  );
  process.exit(1);
}
if (!rawDatabaseUrl || !SESSION_SECRET || !RESEND_API_KEY) {
  console.error(
    "DATABASE_URL, SESSION_SECRET, and RESEND_API_KEY are required in .env.local",
  );
  process.exit(1);
}

let databaseUrl = rawDatabaseUrl;
if (!databaseUrl.includes("-pooler.")) {
  databaseUrl = databaseUrl.replace(".c-", "-pooler.c-");
}

const emailFrom =
  process.env.EMAIL_FROM ?? "Kaizen Quest <onboarding@resend.dev>";
const projectName = process.env.VERCEL_PROJECT_NAME ?? "kaizenquest";

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

async function main() {
  console.log(`Looking up Vercel project: ${projectName}`);
  const { projects } = await api(
    "GET",
    `/v9/projects?search=${encodeURIComponent(projectName)}`,
  );
  const project = projects?.find((entry) => entry.name === projectName);

  if (!project) {
    throw new Error(`Project not found: ${projectName}`);
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

  await upsertEnv("DATABASE_URL", databaseUrl);
  await upsertEnv("SESSION_SECRET", SESSION_SECRET);
  await upsertEnv("RESEND_API_KEY", RESEND_API_KEY);
  await upsertEnv("EMAIL_FROM", emailFrom);

  const teamId = project.accountId;
  const git = project.link;

  console.log("Triggering production deployment...");
  const deployment = await api("POST", `/v13/deployments?teamId=${teamId}`, {
    name: projectName,
    project: projectId,
    target: "production",
    gitSource: git
      ? {
          type: "github",
          org: git.org,
          repo: git.repo,
          ref: git.productionBranch ?? "main",
          repoId: git.repoId,
        }
      : undefined,
  });

  const url = deployment?.url
    ? `https://${deployment.url}`
    : `https://${projectName}.vercel.app`;
  console.log(`Deployment started: ${url}`);
  console.log(
    `Environment configured. Check https://${projectName}.vercel.app once the deployment finishes.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
