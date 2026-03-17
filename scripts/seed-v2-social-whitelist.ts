import { createRequire } from "module";
import { readFile } from "fs/promises";
import path from "path";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

interface SocialWhitelistRow {
  account_id: string;
  platform: string;
  account_name: string;
  account_url: string;
  account_owner: string;
  owner_type: string;
  province: string;
  municipality: string;
  sector: string;
  data_role: string;
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

function parseCsv(content: string): SocialWhitelistRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const header = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(
      header.map((column, index) => [column, values[index] ?? ""])
    ) as unknown as SocialWhitelistRow;
  });
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db/index");
  const csvPath = path.resolve(
    process.cwd(),
    "data",
    "source-registry",
    "verified_social_accounts.csv"
  );

  const content = await readFile(csvPath, "utf8");
  const rows = parseCsv(content).filter(
    (row) => row.verification_status === "verified"
  );

  for (const row of rows) {
    await query(
      `
        insert into social_account_whitelist (
          id,
          platform,
          account_name,
          account_url,
          account_owner,
          owner_type,
          province,
          municipality,
          sector,
          data_role,
          verification_status,
          verification_reference,
          notes,
          active,
          created_at,
          updated_at
        )
        values (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,false,now(),now()
        )
        on conflict (id)
        do update set
          platform = excluded.platform,
          account_name = excluded.account_name,
          account_url = excluded.account_url,
          account_owner = excluded.account_owner,
          owner_type = excluded.owner_type,
          province = excluded.province,
          municipality = excluded.municipality,
          sector = excluded.sector,
          data_role = excluded.data_role,
          verification_status = excluded.verification_status,
          verification_reference = excluded.verification_reference,
          notes = excluded.notes,
          updated_at = now()
      `,
      [
        row.account_id,
        row.platform,
        row.account_name,
        row.account_url,
        row.account_owner,
        row.owner_type,
        row.province || null,
        row.municipality || null,
        row.sector,
        row.data_role,
        row.verification_status,
        row.verification_reference || null,
        row.notes || null,
      ]
    );
  }

  console.log(`seeded ${rows.length} verified social accounts`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
