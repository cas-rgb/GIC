import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

function mapRegistryTypeToOperationalType(
  sourceType: string
): "news" | "gov" | "internal" | "social" | "ngo" {
  switch (sourceType) {
    case "official_gov":
    case "treasury":
    case "utility":
    case "stats":
      return "gov";
    case "news":
      return "news";
    case "ngo":
    case "research":
    case "watchdog":
      return "ngo";
    default:
      return "internal";
  }
}

function mapReliabilityTierToScore(reliabilityTier: string): number {
  switch (reliabilityTier) {
    case "tier_1":
      return 0.95;
    case "tier_2":
      return 0.85;
    case "tier_3":
      return 0.7;
    default:
      return 0.5;
  }
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  const registryResult = await query(`
    select
      id,
      source_name,
      source_url,
      source_type,
      reliability_tier,
      connector_url
    from source_registry
    where ingestion_enabled = true
      and connector_type is not null
      and connector_url is not null
    order by source_name asc
  `);

  for (const row of registryResult.rows) {
    await query(
      `
        insert into sources (
          name,
          source_type,
          base_url,
          reliability_score,
          active,
          external_registry_id,
          created_at,
          updated_at
        )
        values ($1, $2, $3, $4, true, $5, now(), now())
        on conflict (external_registry_id)
        do update set
          name = excluded.name,
          source_type = excluded.source_type,
          base_url = excluded.base_url,
          reliability_score = excluded.reliability_score,
          active = true,
          updated_at = now()
      `,
      [
        row.source_name,
        mapRegistryTypeToOperationalType(row.source_type),
        row.connector_url ?? row.source_url,
        mapReliabilityTierToScore(row.reliability_tier),
        row.id,
      ]
    );
  }

  console.log(
    JSON.stringify(
      {
        synced: registryResult.rows.length,
      },
      null,
      2
    )
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
