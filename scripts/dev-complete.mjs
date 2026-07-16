#!/usr/bin/env node
/**
 * One-shot local stack: Docker infra → Prisma generate/migrate → Nest services → Next.js :3000
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const children = [];
const isWin = process.platform === "win32";

const defaults = {
  API_GATEWAY_URL: "http://localhost:3003",
  AUTH_SERVICE_URL: "http://localhost:3001",
  GOALS_SERVICE_URL: "http://localhost:3002",
  ANALYTICS_SERVICE_URL: "http://localhost:3004",
  AUTH_SERVICE_PORT: "3001",
  GOALS_SERVICE_PORT: "3002",
  GATEWAY_PORT: "3003",
  ANALYTICS_SERVICE_PORT: "3004",
  AUTH_DATABASE_URL: "postgresql://kaizen:kaizen@127.0.0.1:15433/auth_db",
  GOALS_DATABASE_URL: "postgresql://kaizen:kaizen@127.0.0.1:15434/goals_db",
  ANALYTICS_DATABASE_URL:
    "postgresql://kaizen:kaizen@127.0.0.1:15435/analytics_db",
  KAFKA_BROKERS: "localhost:9092",
  SESSION_SECRET:
    process.env.SESSION_SECRET ?? "dev-session-secret-at-least-32-characters!!",
};

const loadEnvFile = (filename) => {
  const filePath = path.join(root, filename);
  if (!existsSync(filePath)) {
    return;
  }

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

loadEnvFile(".env");
loadEnvFile(".env.local");

for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

const log = (message) => {
  console.log(`[dev:complete] ${message}`);
};

/** Windows STATUS_CONTROL_C_EXIT — often Docker Desktop not ready / CLI aborted. */
const formatExitCode = (code) => {
  if (code === 3221225786 || code === 0xc000013a) {
    return `${code} (Windows process aborted — is Docker Desktop running?)`;
  }
  return String(code);
};

/**
 * Spawn without `shell: true` + args (avoids DEP0190 and Git Bash quirks).
 * On Windows, yarn/npm live as `.cmd` shims that need a shell.
 */
const spawnCommand = (command, args, options = {}) => {
  const useShell = isWin;
  const cmd = isWin && command === "yarn" ? "yarn.cmd" : command;
  return spawn(cmd, args, {
    cwd: root,
    stdio: "inherit",
    shell: useShell,
    env: process.env,
    windowsHide: true,
    ...options,
  });
};

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawnCommand(command, args);

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `${command} ${args.join(" ")} exited with ${formatExitCode(code)}`,
          ),
        );
      }
    });
  });

const start = (command, args, label) => {
  log(`starting ${label}…`);
  const child = spawnCommand(command, args);
  children.push({ child, label });
  child.on("exit", (code, signal) => {
    if (code !== 0 && code !== null) {
      log(`${label} exited (${formatExitCode(code) ?? signal})`);
    }
  });
  return child;
};

const waitForPort = (port, host = "127.0.0.1", timeoutMs = 90_000) =>
  new Promise((resolve, reject) => {
    const started = Date.now();

    const tryConnect = () => {
      const socket = net.connect({ port, host }, () => {
        socket.end();
        resolve();
      });

      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }
        setTimeout(tryConnect, 500);
      });
    };

    tryConnect();
  });

const assertDocker = async () => {
  try {
    await run("docker", ["info"]);
  } catch {
    throw new Error(
      "Docker is not available. Start Docker Desktop, wait until it is ready, then retry.",
    );
  }
};

const shutdown = (exitCode = 0) => {
  log("shutting down…");
  for (const { child } of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
  process.exit(exitCode);
};

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

const main = async () => {
  log("checking Docker…");
  await assertDocker();

  log("starting Docker infra…");
  // Call compose directly so failures are not swallowed by nx/yarn exit codes.
  await run("docker", ["compose", "up", "-d"]);

  log("waiting for Postgres (auth)…");
  await waitForPort(15433);

  log("generating Prisma clients…");
  await run("yarn", ["prisma", "generate"]);
  await run("yarn", [
    "prisma",
    "generate",
    "--config",
    "apps/auth-service/prisma.config.ts",
  ]);
  await run("yarn", [
    "prisma",
    "generate",
    "--config",
    "apps/goals-service/prisma.config.ts",
  ]);
  await run("yarn", [
    "prisma",
    "generate",
    "--config",
    "apps/analytics-service/prisma.config.ts",
  ]);

  log("applying service migrations…");
  await run("yarn", [
    "prisma",
    "migrate",
    "deploy",
    "--config",
    "apps/auth-service/prisma.config.ts",
  ]);
  await run("yarn", [
    "prisma",
    "migrate",
    "deploy",
    "--config",
    "apps/goals-service/prisma.config.ts",
  ]);
  await run("yarn", [
    "prisma",
    "migrate",
    "deploy",
    "--config",
    "apps/analytics-service/prisma.config.ts",
  ]);

  start("yarn", ["auth:serve"], "auth-service :3001");
  start("yarn", ["goals:serve"], "goals-service :3002");
  start("yarn", ["analytics:serve"], "analytics-service :3004");

  log("waiting for Nest services…");
  await waitForPort(3001);
  await waitForPort(3002);
  await waitForPort(3004);

  start("yarn", ["gateway:serve"], "api-gateway :3003");
  await waitForPort(3003);

  log("starting Next.js on http://localhost:3000 …");
  const web = start("yarn", ["dev"], "web :3000");

  web.on("exit", (code) => {
    shutdown(code ?? 0);
  });
};

main().catch((error) => {
  console.error(`[dev:complete] ${error.message}`);
  shutdown(1);
});
