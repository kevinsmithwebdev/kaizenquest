#!/usr/bin/env node
/**
 * Turbopack resolves `next` from the app cwd (apps/web). Yarn hoists it to the
 * workspace root, so on Windows we create junctions under apps/web/node_modules.
 */
import {
  existsSync,
  lstatSync,
  mkdirSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const webNm = path.join(root, "apps", "web", "node_modules");
const packages = ["next", "react", "react-dom"];

const samePath = (a, b) => {
  try {
    return realpathSync(a).toLowerCase() === realpathSync(b).toLowerCase();
  } catch {
    return path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
  }
};

mkdirSync(webNm, { recursive: true });

for (const name of packages) {
  const target = path.join(root, "node_modules", name);
  const link = path.join(webNm, name);

  if (!existsSync(target)) {
    console.warn(`[ensure-web-next-links] missing ${target}`);
    continue;
  }

  if (existsSync(link) && samePath(link, target)) {
    continue;
  }

  if (existsSync(link)) {
    rmSync(link, { recursive: true, force: true });
  }

  if (process.platform === "win32") {
    const result = spawnSync("cmd", ["/c", "mklink", "/J", link, target], {
      encoding: "utf8",
    });
    if (result.status !== 0) {
      console.warn(
        `[ensure-web-next-links] mklink failed for ${name}:`,
        result.stderr || result.stdout,
      );
    }
  } else {
    spawnSync("ln", ["-sfn", target, link], { stdio: "inherit" });
  }
}
