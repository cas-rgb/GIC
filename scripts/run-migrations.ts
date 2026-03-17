import { readdir, readFile } from "fs/promises";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const { pool, query } = require("../src/lib/db/index");

async function ensureMigrationsTable(): Promise<void> {
  await query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const result = await query(
    `select filename from schema_migrations`
  );
  return new Set(
    result.rows.map((row: { filename: string }) => row.filename)
  );
}

async function applyMigration(filename: string, sql: string): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query(sql);
    await client.query(
      `
        insert into schema_migrations (filename)
        values ($1)
        on conflict (filename) do nothing
      `,
      [filename]
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function main(): Promise<void> {
  const migrationsDir = path.resolve(process.cwd(), "migrations");
  await ensureMigrationsTable();

  const appliedMigrations = await getAppliedMigrations();
  const files = (await readdir(migrationsDir))
    .filter((filename) => filename.endsWith(".sql"))
    .sort();

  for (const filename of files) {
    if (appliedMigrations.has(filename)) {
      continue;
    }

    const absolutePath = path.join(migrationsDir, filename);
    const sql = await readFile(absolutePath, "utf8");
    await applyMigration(filename, sql);
    console.log(`applied ${filename}`);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
