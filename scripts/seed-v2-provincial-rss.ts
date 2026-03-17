import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

function buildFeedUrl(province: string): string {
  const query = encodeURIComponent(`${province} municipality infrastructure service delivery`);
  return `https://news.google.com/rss/search?q=${query}&hl=en-ZA&gl=ZA&ceid=ZA:en`;
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  for (const province of PROVINCES) {
    const name = `Google News ${province} Infrastructure`;
    const baseUrl = buildFeedUrl(province);

    const existing = await query(
      `
        select id
        from sources
        where name = $1
        limit 1
      `,
      [name]
    );

    if (existing.rows[0]) {
      await query(
        `
          update sources
          set
            source_type = 'news',
            base_url = $2,
            reliability_score = 0.700,
            active = true,
            updated_at = now()
          where id = $1
        `,
        [existing.rows[0].id, baseUrl]
      );
      continue;
    }

    await query(
      `
        insert into sources (name, source_type, base_url, reliability_score, active)
        values ($1, 'news', $2, 0.700, true)
      `,
      [name, baseUrl]
    );
  }

  console.log(JSON.stringify({ seeded: PROVINCES.length }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
