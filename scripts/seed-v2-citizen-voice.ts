import { createRequire } from "module";
import { readFile } from "fs/promises";
import path from "path";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

interface CitizenVoiceRow {
  query_id: string;
  scope_type: string;
  scope_name: string;
  platform: string;
  issue_family: string;
  query_text: string;
  data_role: string;
  verification_status: string;
  notes: string;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === "\"") {
      if (inQuotes && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsv(content: string): CitizenVoiceRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const header = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(
      header.map((column, index) => [column, values[index] ?? ""])
    ) as unknown as CitizenVoiceRow;
  });
}

async function upsertCitizenVoiceRow(row: CitizenVoiceRow): Promise<void> {
  const { query } = require("../src/lib/db/index");

  await query(
    `
      insert into citizen_voice_query_packs (
        id,
        scope_type,
        scope_name,
        platform,
        issue_family,
        query_text,
        data_role,
        verification_status,
        notes,
        active,
        created_at,
        updated_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, now(), now())
      on conflict (id)
      do update set
        scope_type = excluded.scope_type,
        scope_name = excluded.scope_name,
        platform = excluded.platform,
        issue_family = excluded.issue_family,
        query_text = excluded.query_text,
        data_role = excluded.data_role,
        verification_status = excluded.verification_status,
        notes = excluded.notes,
        updated_at = now()
    `,
    [
      row.query_id,
      row.scope_type,
      row.scope_name,
      row.platform,
      row.issue_family,
      row.query_text,
      row.data_role,
      row.verification_status,
      row.notes || null,
    ]
  );
}

async function main(): Promise<void> {
  const csvPath = path.resolve(
    process.cwd(),
    "data",
    "source-registry",
    "citizen_voice_query_packs.csv"
  );
  const content = await readFile(csvPath, "utf8");
  const rows = parseCsv(content);

  for (const row of rows) {
    await upsertCitizenVoiceRow(row);
  }

  console.log(`seeded ${rows.length} citizen voice query packs`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
