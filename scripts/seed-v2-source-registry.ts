import { createRequire } from "module";
import { readdir, readFile } from "fs/promises";
import path from "path";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

interface RegistryRow {
  source_id: string;
  source_name: string;
  source_url: string;
  source_owner: string;
  source_type: string;
  sphere: string;
  province: string;
  municipality: string;
  sector: string;
  data_role: string;
  update_frequency: string;
  access_method: string;
  reliability_tier: string;
  verification_status: string;
  verification_reference: string;
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

function parseCsv(content: string): RegistryRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const header = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(
      header.map((column, index) => [column, values[index] ?? ""])
    ) as unknown as RegistryRow;

    return row;
  });
}

async function upsertRegistryRow(row: RegistryRow): Promise<void> {
  const { query } = require("../src/lib/db/index");

  await query(
    `
      insert into source_registry (
        id,
        source_name,
        source_url,
        source_owner,
        source_type,
        sphere,
        province,
        municipality,
        sector,
        data_role,
        update_frequency,
        access_method,
        reliability_tier,
        verification_status,
        verification_reference,
        notes,
        active,
        created_at,
        updated_at
      )
      values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, false, now(), now()
      )
      on conflict (id)
      do update set
        source_name = excluded.source_name,
        source_url = excluded.source_url,
        source_owner = excluded.source_owner,
        source_type = excluded.source_type,
        sphere = excluded.sphere,
        province = excluded.province,
        municipality = excluded.municipality,
        sector = excluded.sector,
        data_role = excluded.data_role,
        update_frequency = excluded.update_frequency,
        access_method = excluded.access_method,
        reliability_tier = excluded.reliability_tier,
        verification_status = excluded.verification_status,
        verification_reference = excluded.verification_reference,
        notes = excluded.notes,
        updated_at = now()
    `,
    [
      row.source_id,
      row.source_name,
      row.source_url,
      row.source_owner,
      row.source_type,
      row.sphere,
      row.province || null,
      row.municipality || null,
      row.sector,
      row.data_role,
      row.update_frequency || null,
      row.access_method,
      row.reliability_tier,
      row.verification_status,
      row.verification_reference || null,
      row.notes || null,
    ]
  );
}

async function main(): Promise<void> {
  const registryDir = path.resolve(process.cwd(), "data", "source-registry");
  const files = (await readdir(registryDir))
    .filter((filename) => /^verified_.*sources\.csv$/i.test(filename))
    .sort();

  let totalRows = 0;

  for (const filename of files) {
    const csvPath = path.join(registryDir, filename);
    const content = await readFile(csvPath, "utf8");
    const rows = parseCsv(content);

    for (const row of rows) {
      await upsertRegistryRow(row);
    }

    totalRows += rows.length;
  }

  console.log(`seeded ${totalRows} verified registry sources`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
