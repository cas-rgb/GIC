const { loadEnv } = require("./load-env-cli");

loadEnv();

interface SeedSource {
  id: string;
  name: string;
  sourceType: "news" | "gov" | "internal" | "social" | "ngo";
  baseUrl?: string;
  reliabilityScore: number;
  active: boolean;
}

function getSeedSources(): SeedSource[] {
  const newsSourceId =
    process.env.V2_NEWS_SOURCE_ID ?? "00000000-0000-0000-0000-000000000001";

  return [
    {
      id: newsSourceId,
      name: process.env.V2_NEWS_SOURCE_NAME ?? "Configured RSS Source",
      sourceType: "news",
      baseUrl: process.env.V2_NEWS_RSS_URL,
      reliabilityScore: 0.75,
      active: process.env.V2_NEWS_SOURCE_ACTIVE === "true",
    },
  ];
}

async function upsertSource(source: SeedSource): Promise<void> {
  const { query } = require("../src/lib/db/index");

  await query(
    `
      insert into sources (
        id,
        name,
        source_type,
        base_url,
        reliability_score,
        active,
        created_at,
        updated_at
      )
      values ($1, $2, $3, $4, $5, $6, now(), now())
      on conflict (id)
      do update set
        name = excluded.name,
        source_type = excluded.source_type,
        base_url = excluded.base_url,
        reliability_score = excluded.reliability_score,
        active = excluded.active,
        updated_at = now()
    `,
    [
      source.id,
      source.name,
      source.sourceType,
      source.baseUrl ?? null,
      source.reliabilityScore,
      source.active,
    ]
  );
}

async function main(): Promise<void> {
  const sources = getSeedSources();

  for (const source of sources) {
    await upsertSource(source);
    console.log(`seeded source ${source.id} (${source.name})`);
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
