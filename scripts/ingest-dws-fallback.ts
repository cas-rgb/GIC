import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const WATER_PATTERNS = [
  /water/i,
  /dam/i,
  /sanitation/i,
  /wastewater/i,
  /sewer/i,
  /pipeline/i,
  /bulk supply/i,
  /transfer/i,
  /reservoir/i,
  /quality/i,
  /drinking water/i,
];

function normalizeText(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function absoluteUrl(baseUrl: string, href: string): string {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

function isWaterRelevant(text: string): boolean {
  return WATER_PATTERNS.some((pattern) => pattern.test(text));
}

function extractProvinces(text: string): string[] {
  const provinces = [
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

  return provinces.filter((province) =>
    text.toLowerCase().includes(province.toLowerCase())
  );
}

async function ensureLocation(
  query: (text: string, params?: unknown[]) => Promise<{ rows: Array<{ id: string }> }>,
  province: string
): Promise<string> {
  const locationKey = ["South Africa", province, "", "Province Wide", ""].join("|");
  const result = await query(
    `
      insert into locations (country, province, district, municipality, ward, location_key)
      values ('South Africa', $1, null, 'Province Wide', null, $2)
      on conflict (location_key)
      do update set
        province = excluded.province,
        municipality = excluded.municipality
      returning id
    `,
    [province, locationKey]
  );

  return result.rows[0].id;
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");
  const { createHash } = require("crypto");

  async function markAttempt(sourceId: string) {
    await query(
      `
        update sources
        set last_attempted_at = now(), updated_at = now()
        where id = $1
      `,
      [sourceId]
    );
  }

  async function markFailure(sourceId: string, error: string) {
    await query(
      `
        update sources
        set last_error = $2, updated_at = now()
        where id = $1
      `,
      [sourceId, error.slice(0, 500)]
    );
  }

  async function markSuccess(sourceId: string) {
    await query(
      `
        update sources
        set last_ingested_at = now(), last_error = null, updated_at = now()
        where id = $1
      `,
      [sourceId]
    );
  }

  const sourcesResult = await query(
    `
      select id, name, base_url, source_type
      from sources
      where active = true
        and base_url is not null
        and name like 'DWS%'
      order by name asc
    `
  );

  const results = [];

  for (const source of sourcesResult.rows as Array<{
    id: string;
    name: string;
    base_url: string;
    source_type: string;
  }>) {
    await markAttempt(source.id);

    try {
      const response = await fetch(source.base_url, { cache: "no-store" });

      if (!response.ok) {
        const error = `fetch failed: ${response.status}`;
        await markFailure(source.id, error);
        results.push({
          sourceId: source.id,
          name: source.name,
          fetched: 0,
          inserted: 0,
          skipped: 0,
          errors: [error],
        });
        continue;
      }

      const html = await response.text();
      const pageTitleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const pageTitle = normalizeText(pageTitleMatch?.[1] ?? source.name);
      const pageText = normalizeText(html);

      const items: Array<{ title: string; url: string; contentText: string }> = [];

      if (isWaterRelevant(`${pageTitle}\n${pageText}`)) {
        items.push({
          title: pageTitle,
          url: source.base_url,
          contentText: pageText.slice(0, 5000),
        });
      }

      const anchorRegex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
      const seen = new Set<string>();
      let match: RegExpExecArray | null = anchorRegex.exec(html);

      while (match && items.length < 30) {
        const title = normalizeText(match[2] ?? "");
        const url = absoluteUrl(source.base_url, match[1] ?? "");
        match = anchorRegex.exec(html);

        if (!title || !url || seen.has(url) || !url.includes("dws.gov.za")) {
          continue;
        }

        seen.add(url);

        if (!isWaterRelevant(`${title}\n${url}`)) {
          continue;
        }

        items.push({
          title,
          url,
          contentText: title,
        });
      }

      let inserted = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const item of items) {
        try {
          const provinces = extractProvinces(`${item.title}\n${item.contentText}`);
          const targets = provinces.length > 0 ? provinces : ["Gauteng"];

          for (const province of targets) {
            const contentHash = createHash("sha256")
              .update(`${item.title}\n${item.url}\n${province}`)
              .digest("hex");

            const exists = await query(
              `select id from documents where content_hash = $1 limit 1`,
              [contentHash]
            );

            if (exists.rows[0]) {
              skipped += 1;
              continue;
            }

            const locationId = await ensureLocation(query, province);
            await query(
              `
                insert into documents (
                  source_id,
                  location_id,
                  url,
                  title,
                  published_at,
                  fetched_at,
                  doc_type,
                  language,
                  content_text,
                  content_hash,
                  parser_version,
                  status
                )
                values ($1, $2, $3, $4, now(), now(), 'report', 'en', $5, $6, 'dws-fallback-v1', 'active')
              `,
              [
                source.id,
                locationId,
                item.url,
                item.title,
                item.contentText.slice(0, 6000),
                contentHash,
              ]
            );

            inserted += 1;
          }
        } catch (error) {
          errors.push(error instanceof Error ? error.message : String(error));
        }
      }

      if (errors.length > 0 && inserted === 0) {
        await markFailure(source.id, errors[0]);
      } else {
        await markSuccess(source.id);
      }

      results.push({
        sourceId: source.id,
        name: source.name,
        fetched: items.length,
        inserted,
        skipped,
        errors,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await markFailure(source.id, message);
      results.push({
        sourceId: source.id,
        name: source.name,
        fetched: 0,
        inserted: 0,
        skipped: 0,
        errors: [message],
      });
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
