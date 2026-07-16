#!/usr/bin/env node
/**
 * Upsert API_GATEWAY_URL + SESSION_SECRET on the Vercel production project.
 * Used by CI and can be run locally when VERCEL_* secrets are set.
 */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.local") });

const {
  VERCEL_TOKEN,
  VERCEL_PROJECT_ID,
  VERCEL_ORG_ID,
  API_GATEWAY_URL,
  SESSION_SECRET,
} = process.env;

if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
  console.error("VERCEL_TOKEN and VERCEL_PROJECT_ID are required");
  process.exit(1);
}
if (!API_GATEWAY_URL || !SESSION_SECRET) {
  console.error("API_GATEWAY_URL and SESSION_SECRET are required");
  process.exit(1);
}

const teamQs = VERCEL_ORG_ID ? `?teamId=${VERCEL_ORG_ID}` : "";

async function api(method, path, body) {
  const url = `https://api.vercel.com${path}${teamQs}`;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `${method} ${path}: ${data?.error?.message ?? response.status}`,
    );
  }
  return data;
}

const { envs } = await api("GET", `/v9/projects/${VERCEL_PROJECT_ID}/env`);

async function upsert(key, value) {
  const existing = envs?.find(
    (env) => env.key === key && env.target?.includes("production"),
  );
  if (existing) {
    await api("PATCH", `/v9/projects/${VERCEL_PROJECT_ID}/env/${existing.id}`, {
      value,
      target: ["production"],
    });
    console.log(`Updated ${key}`);
    return;
  }
  await api("POST", `/v9/projects/${VERCEL_PROJECT_ID}/env`, {
    key,
    value,
    type: "encrypted",
    target: ["production"],
  });
  console.log(`Created ${key}`);
}

await upsert("API_GATEWAY_URL", API_GATEWAY_URL);
await upsert("SESSION_SECRET", SESSION_SECRET);
console.log("Vercel production env upserted.");
