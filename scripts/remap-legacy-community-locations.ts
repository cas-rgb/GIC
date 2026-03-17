import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const { getLegacyCommunityAlias } = require("../src/lib/legacy/community-aliases") as typeof import("../src/lib/legacy/community-aliases");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

interface LegacyDocumentRow {
  id: string;
  title: string;
  content_text: string;
}

function buildLocationKey(country: string, province: string | null, municipality: string | null, ward: string | null) {
  return [country, province ?? "", "", municipality ?? "", ward ?? ""].join("|");
}

function extractCommunity(title: string, contentText: string): string | null {
  const titleParts = title.split("|").map((part) => part.trim()).filter(Boolean);
  if (titleParts.length > 1) {
    return titleParts[titleParts.length - 1];
  }

  const match = contentText.match(/Legacy community signal from (.+?)\./i);
  return match?.[1]?.trim() ?? null;
}

async function ensureLocation(province: string | null, municipality: string | null, ward: string | null) {
  const result = await query<{ id: string }>(
    `
      insert into locations (country, province, district, municipality, ward, location_key)
      values ('South Africa', $1, null, $2, $3, $4)
      on conflict (location_key)
      do update set
        province = excluded.province,
        municipality = excluded.municipality,
        ward = excluded.ward
      returning id
    `,
    [province, municipality, ward, buildLocationKey("South Africa", province, municipality, ward)]
  );

  return result.rows[0]?.id ?? null;
}

async function main() {
  const docs = await query<LegacyDocumentRow>(
    `
      select id, title, content_text
      from documents
      where parser_version = 'legacy-community-signals-v1'
        and status = 'active'
    `
  );

  let updated = 0;
  let unmatched = 0;

  for (const row of docs.rows) {
    const community = extractCommunity(row.title, row.content_text);
    const alias = getLegacyCommunityAlias(community);

    if (!alias) {
      unmatched += 1;
      continue;
    }

    const locationId = await ensureLocation(
      alias.province,
      alias.municipality ?? null,
      alias.ward ?? null
    );

    await query(
      `
        update documents
        set location_id = $2
        where id = $1
      `,
      [row.id, locationId]
    );

    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        total: docs.rows.length,
        updated,
        unmatched,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
