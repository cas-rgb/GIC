import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

async function main() {
  const result = await query<{ community: string; count: number }>(
    `
      select
        btrim(split_part(title, '|', 2)) as community,
        count(*)::int as count
      from documents
      where parser_version = 'legacy-community-signals-v1'
        and status = 'active'
        and location_id is null
      group by btrim(split_part(title, '|', 2))
      order by count(*) desc, community asc
    `
  );

  console.log(JSON.stringify(result.rows, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
