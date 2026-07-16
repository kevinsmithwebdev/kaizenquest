import * as esbuild from "esbuild";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const service = process.argv[2];

const services = {
  "auth-service": "apps/auth-service/src/main.ts",
  "goals-service": "apps/goals-service/src/main.ts",
  "analytics-service": "apps/analytics-service/src/main.ts",
  "api-gateway": "apps/api-gateway/src/main.ts",
};

if (!service || !(service in services)) {
  console.error(
    `Usage: node scripts/build-service.mjs <${Object.keys(services).join("|")}>`,
  );
  process.exit(1);
}

const outDir = resolve(root, "dist/apps", service);
mkdirSync(outDir, { recursive: true });

const alias = {
  "@kaizen/shared-utils": resolve(root, "libs/shared/utils/src/index.ts"),
  "@kaizen/shared-contracts": resolve(
    root,
    "libs/shared/contracts/src/index.ts",
  ),
  "@kaizen/shared-nestjs": resolve(root, "libs/shared/nestjs/src/index.ts"),
  "@kaizen/shared-api-client": resolve(
    root,
    "libs/shared/api-client/src/index.ts",
  ),
  "@kaizen/domain-goals": resolve(root, "libs/domain/goals/src/index.ts"),
  "@kaizen/domain-auth": resolve(root, "libs/domain/auth/src/index.ts"),
};

await esbuild.build({
  absWorkingDir: root,
  entryPoints: [resolve(root, services[service])],
  outfile: resolve(outDir, "main.mjs"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  packages: "external",
  sourcemap: true,
  alias,
  logLevel: "info",
});

console.log(`Built ${service} → dist/apps/${service}/main.mjs`);
