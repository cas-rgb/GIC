import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";
import { createRequire } from "module";

import type { QueryResultRow } from "pg";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

const HOURS = Number(process.env.ENRICHMENT_HOURS ?? "6");
const CYCLE_DELAY_MINUTES = Number(process.env.ENRICHMENT_DELAY_MINUTES ?? "20");
const LOG_DIR = path.resolve(process.cwd(), "logs");
const DATA_DIR = path.resolve(process.cwd(), "data", "enrichment");
const RUN_ID = new Date().toISOString().replace(/[:.]/g, "-");
const LOG_PATH = path.join(LOG_DIR, `overnight-enrichment-${RUN_ID}.log`);
const REPORT_PATH = path.join(DATA_DIR, `overnight-enrichment-report-${RUN_ID}.json`);

interface TableCountRow extends QueryResultRow {
  count: string | number;
}

interface CommandResult {
  command: string;
  startedAt: string;
  finishedAt: string;
  exitCode: number | null;
}

interface CycleReport {
  cycleNumber: number;
  startedAt: string;
  finishedAt: string;
  countsBefore: Record<string, number>;
  countsAfter: Record<string, number>;
  commands: CommandResult[];
}

interface OvernightReport {
  runId: string;
  startedAt: string;
  finishedAt: string | null;
  durationHours: number;
  cycleDelayMinutes: number;
  cycles: CycleReport[];
}

const COMMANDS = [
  "npm.cmd run import:firestore:community-signals:v2",
  "npm.cmd run ingest:official:v2",
  "npm.cmd run ingest:rss:v2",
  "npm.cmd run ingest:news:v2",
  "npm.cmd run ingest:citizen-voice:v2",
  "npm.cmd run process:v2:queue",
  "npm.cmd run ingest:municipal-money:v2",
  "npm.cmd run normalize:projects:v2",
  "npm.cmd run rebuild:projects:v2",
  "npm.cmd run rebuild:citizen-voice:v2",
  "npm.cmd run rebuild:leadership:v2",
  "npm.cmd run rebuild:municipal-leadership:v2",
  "node --require ts-node/register --require tsconfig-paths/register scripts/collect-contextual-reference.ts",
];

const COUNT_QUERIES: Record<string, string> = {
  documents: "select count(*)::int as count from documents",
  signals: "select count(*)::int as count from signals",
  serviceIncidents: "select count(*)::int as count from service_incidents",
  sentimentMentions: "select count(*)::int as count from sentiment_mentions",
  citizenVoiceMentions: "select count(*)::int as count from citizen_voice_mentions",
  leaderMentions: "select count(*)::int as count from leader_mentions",
  municipalLeaderMentions: "select count(*)::int as count from municipal_leader_mentions",
  infrastructureProjects: "select count(*)::int as count from infrastructure_projects",
  locations: "select count(*)::int as count from locations",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function appendLog(message: string) {
  fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} ${message}\n`);
}

async function getCounts(): Promise<Record<string, number>> {
  const entries = await Promise.all(
    Object.entries(COUNT_QUERIES).map(async ([key, sql]) => {
      const result = await query<TableCountRow>(sql);
      const count = Number(result.rows[0]?.count ?? 0);
      return [key, count] as const;
    })
  );

  return Object.fromEntries(entries);
}

async function runCommand(command: string): Promise<CommandResult> {
  const startedAt = new Date().toISOString();
  appendLog(`[start] ${command}`);

  return await new Promise<CommandResult>((resolve) => {
    const child = spawn("C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe", ["-Command", command], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (chunk) => {
      appendLog(`[stdout] ${command} :: ${String(chunk).trimEnd()}`);
    });

    child.stderr.on("data", (chunk) => {
      appendLog(`[stderr] ${command} :: ${String(chunk).trimEnd()}`);
    });

    child.on("close", (exitCode) => {
      const finishedAt = new Date().toISOString();
      appendLog(`[finish] ${command} :: exit=${exitCode}`);
      resolve({
        command,
        startedAt,
        finishedAt,
        exitCode,
      });
    });
  });
}

async function main() {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const startedAt = Date.now();
  const maxDurationMs = HOURS * 60 * 60 * 1000;
  const report: OvernightReport = {
    runId: RUN_ID,
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: null,
    durationHours: HOURS,
    cycleDelayMinutes: CYCLE_DELAY_MINUTES,
    cycles: [],
  };

  let cycleNumber = 1;
  while (Date.now() - startedAt < maxDurationMs) {
    const cycleStartedAt = new Date().toISOString();
    appendLog(`=== cycle ${cycleNumber} start ===`);
    const countsBefore = await getCounts();
    const commands: CommandResult[] = [];

    for (const command of COMMANDS) {
      if (Date.now() - startedAt >= maxDurationMs) {
        appendLog(`Skipping remaining commands because max duration was reached.`);
        break;
      }

      commands.push(await runCommand(command));
    }

    const countsAfter = await getCounts();
    const cycleFinishedAt = new Date().toISOString();
    report.cycles.push({
      cycleNumber,
      startedAt: cycleStartedAt,
      finishedAt: cycleFinishedAt,
      countsBefore,
      countsAfter,
      commands,
    });

    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    appendLog(`=== cycle ${cycleNumber} end ===`);
    cycleNumber += 1;

    if (Date.now() - startedAt >= maxDurationMs) {
      break;
    }

    await sleep(CYCLE_DELAY_MINUTES * 60 * 1000);
  }

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  appendLog(`Overnight enrichment run complete. Report written to ${REPORT_PATH}`);
  console.log(
    JSON.stringify(
      {
        logPath: LOG_PATH,
        reportPath: REPORT_PATH,
        cycles: report.cycles.length,
      },
      null,
      2
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    appendLog(`Fatal error: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
    console.error(error);
    process.exit(1);
  });
