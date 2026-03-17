import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const COGTA_SOURCES = [
  {
    name: "CoGTA National Strategic Hub",
    sourceType: "gov",
    baseUrl: "https://nationalstrathub.cogta.gov.za/",
    reliabilityScore: 0.96,
  },
  {
    name: "CoGTA National Strategic Hub Diagnostic Profiles",
    sourceType: "gov",
    baseUrl: "https://nationalstrathub.cogta.gov.za/diagnostic-profiles/",
    reliabilityScore: 0.97,
  },
  {
    name: "CoGTA National Strategic Hub Dashboards",
    sourceType: "gov",
    baseUrl: "https://nationalstrathub.cogta.gov.za/data-tools/dashboards/",
    reliabilityScore: 0.95,
  },
];

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  for (const source of COGTA_SOURCES) {
    const existing = await query(
      `
        select id
        from sources
        where name = $1
        limit 1
      `,
      [source.name]
    );

    if (existing.rows[0]) {
      await query(
        `
          update sources
          set
            source_type = $2,
            base_url = $3,
            reliability_score = $4,
            active = true,
            updated_at = now()
          where id = $1
        `,
        [existing.rows[0].id, source.sourceType, source.baseUrl, source.reliabilityScore]
      );
      continue;
    }

    await query(
      `
        insert into sources (name, source_type, base_url, reliability_score, active)
        values ($1, $2, $3, $4, true)
      `,
      [source.name, source.sourceType, source.baseUrl, source.reliabilityScore]
    );
  }

  console.log(JSON.stringify({ seeded: COGTA_SOURCES.length }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
