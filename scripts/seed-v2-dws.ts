import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const DWS_SOURCES = [
  {
    name: "DWS Water Security Dashboard",
    sourceType: "utility",
    baseUrl: "https://www.dws.gov.za/dashboard.aspx",
    reliabilityScore: 0.96,
  },
  {
    name: "DWS NIWIS Water Transfers",
    sourceType: "utility",
    baseUrl: "https://www.dws.gov.za/niwis2/Info/WaterTransfersInfo",
    reliabilityScore: 0.95,
  },
  {
    name: "DWS Media Statements",
    sourceType: "gov",
    baseUrl: "https://www.dws.gov.za/Comms/MediaStatements.aspx",
    reliabilityScore: 0.92,
  },
  {
    name: "DWS Media Statements Archive",
    sourceType: "gov",
    baseUrl: "https://www.dws.gov.za/Comms/MediaStatementsArchive.aspx",
    reliabilityScore: 0.9,
  },
];

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  for (const source of DWS_SOURCES) {
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

  console.log(JSON.stringify({ seeded: DWS_SOURCES.length }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
