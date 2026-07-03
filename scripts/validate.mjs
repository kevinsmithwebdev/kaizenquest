import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const readSonarProjectKey = () => {
  const properties = readFileSync("sonar-project.properties", "utf8");
  const match = properties.match(/^sonar\.projectKey=(.+)$/m);
  return match?.[1]?.trim();
};

const run = (command) => {
  execSync(command, { stdio: "inherit" });
};

const printAutomaticAnalysisHelp = () => {
  const projectKey = readSonarProjectKey() ?? "your-project-key";

  console.error(`
SonarCloud rejected CI analysis because Automatic Analysis is enabled.

Your pipeline uses CI-based analysis (sonar-project.properties + coverage).
SonarCloud allows only one analysis method per project.

Fix:
  1. Open https://sonarcloud.io/project/analysis_method?id=${projectKey}
  2. Sign in as a project administrator
  3. Turn off Automatic Analysis
  4. Re-run CI

Note: Organization admins may not see this toggle unless they also have
project-level admin rights.
`);
};

const runSonar = () => {
  try {
    execSync("yarn sonar", {
      encoding: "utf8",
      stdio: ["inherit", "pipe", "pipe"],
    });
  } catch (error) {
    const output = `${error.stdout ?? ""}${error.stderr ?? ""}`;

    if (output.includes("Automatic Analysis is enabled")) {
      printAutomaticAnalysisHelp();
    } else if (output) {
      process.stderr.write(output);
    }

    process.exit(error.status ?? 1);
  }
};

run("yarn typecheck");
run("yarn test:coverage");

if (process.env.SONAR_TOKEN) {
  run("node scripts/disable-sonar-autoscan.mjs");
  runSonar();
} else if (process.env.CI) {
  console.error("SONAR_TOKEN is required in CI.");
  process.exit(1);
} else {
  console.log("Skipping Sonar scan (set SONAR_TOKEN to run locally).");
}
