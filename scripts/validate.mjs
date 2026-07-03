import { execSync } from "node:child_process";

const run = (command) => {
  execSync(command, { stdio: "inherit" });
};

run("yarn typecheck");
run("yarn test:coverage");

if (process.env.SONAR_TOKEN) {
  run("yarn sonar");
} else if (process.env.CI) {
  console.error("SONAR_TOKEN is required in CI.");
  process.exit(1);
} else {
  console.log("Skipping Sonar scan (set SONAR_TOKEN to run locally).");
}
