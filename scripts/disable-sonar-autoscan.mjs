import { readFileSync } from "node:fs";

const readSonarProperty = (name) => {
  const properties = readFileSync("sonar-project.properties", "utf8");
  const match = properties.match(new RegExp(`^${name}=(.+)$`, "m"));
  return match?.[1]?.trim();
};

const token = process.env.SONAR_TOKEN;
const projectKey = readSonarProperty("sonar.projectKey");
const organization = readSonarProperty("sonar.organization");

if (!token || !projectKey || !organization) {
  process.exit(0);
}

const credentials = Buffer.from(`${token}:`).toString("base64");

const response = await fetch("https://sonarcloud.io/api/autoscan/activation", {
  method: "POST",
  headers: {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({
    organization,
    project: projectKey,
    enable: "false",
  }),
});

if (!response.ok) {
  const text = await response.text();
  console.warn(
    `Could not disable SonarCloud Automatic Analysis via API (${response.status}).`,
  );
  if (text) {
    console.warn(text);
  }
  console.warn(
    `Disable it manually: https://sonarcloud.io/project/analysis_method?id=${projectKey}`,
  );
  process.exit(0);
}

console.log("Disabled SonarCloud Automatic Analysis for CI.");
