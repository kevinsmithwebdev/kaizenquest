import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(root, ".env.local") });

const { VERCEL_TOKEN } = process.env;
const projectName = process.env.VERCEL_PROJECT_NAME ?? "kaizenquest";

if (!VERCEL_TOKEN) {
  console.error(
    "VERCEL_TOKEN is required in .env.local — create one at https://vercel.com/account/tokens",
  );
  process.exit(1);
}

const response = await fetch(
  `https://api.vercel.com/v9/projects?search=${encodeURIComponent(projectName)}`,
  { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } },
);

const data = await response.json();
if (!response.ok) {
  console.error(
    data?.error?.message ?? `Vercel API error (${response.status})`,
  );
  process.exit(1);
}

const project = data.projects?.find((entry) => entry.name === projectName);
if (!project) {
  console.error(`Project not found: ${projectName}`);
  process.exit(1);
}

console.log(
  "Add these GitHub Actions secrets for kevinsmithwebdev/kaizenquest:",
);
console.log(
  "https://github.com/kevinsmithwebdev/kaizenquest/settings/secrets/actions",
);
console.log("");
console.log("VERCEL_TOKEN        = (your token — already in .env.local)");
console.log(`VERCEL_ORG_ID       = ${project.accountId}`);
console.log(`VERCEL_PROJECT_ID   = ${project.id}`);
console.log("");
console.log("Only VERCEL_TOKEN is required if CI uses 'vercel link --repo'.");
