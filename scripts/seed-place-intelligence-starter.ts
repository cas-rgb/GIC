import { createRequire } from "module";
import { execSync } from "child_process";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli") as typeof import("./load-env-cli");

loadEnv();

const steps = [
  "npm.cmd run import:reference:provinces:v2",
  "npm.cmd run import:reference:municipalities:v2",
  "npm.cmd run import:reference:wards:v2",
  "npm.cmd run import:demographics:province:v2",
  "npm.cmd run import:demographics:municipality:v2",
  "npm.cmd run import:demographics:ward:v2",
  "npm.cmd run import:iec:province-results:v2",
  "npm.cmd run import:iec:municipality-results:v2",
  "npm.cmd run import:iec:ward-results:v2",
  "npm.cmd run import:ward-councillors:v2",
  "npm.cmd run import:history:budgets:v2",
  "npm.cmd run import:history:infrastructure:v2",
  "npm.cmd run import:history:issues:v2",
  "npm.cmd run bootstrap:history:v2",
];

function main() {
  for (const step of steps) {
    console.log(`\n>>> ${step}`);
    execSync(step, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
    });
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        stepsRun: steps.length,
      },
      null,
      2
    )
  );
}

main();
