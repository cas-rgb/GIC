import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const RELEVANCE_PATTERNS = [
  /municipal/i,
  /municipality/i,
  /service delivery/i,
  /infrastructure/i,
  /water/i,
  /sewer/i,
  /sanitation/i,
  /wastewater/i,
  /electricity/i,
  /power outage/i,
  /load shedding/i,
  /road/i,
  /pothole/i,
  /bridge/i,
  /transport/i,
  /housing/i,
  /settlement/i,
  /refuse/i,
  /waste collection/i,
  /stormwater/i,
  /flood/i,
  /clinic/i,
  /hospital/i,
  /utility/i,
];

function isInfrastructureRelevant(title: string, contentText: string, url: string): boolean {
  const corpus = `${title}\n${contentText}\n${url}`;
  return RELEVANCE_PATTERNS.some((pattern) => pattern.test(corpus));
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");
  const { parseStringPromise } = require("xml2js");
  const { createHash } = require("crypto");

  async function markAttempt(sourceId: string) {
    await query(
      `
        update sources
        set
          last_attempted_at = now(),
          updated_at = now()
        where id = $1
      `,
      [sourceId]
    );
  }

  async function markFailure(sourceId: string, error: string) {
    await query(
      `
        update sources
        set
          last_error = $2,
          updated_at = now()
        where id = $1
      `,
      [sourceId, error.slice(0, 500)]
    );
  }

  async function markSuccess(sourceId: string) {
    await query(
      `
        update sources
        set
          last_ingested_at = now(),
          last_error = null,
          updated_at = now()
        where id = $1
      `,
      [sourceId]
    );
  }

  const sourcesResult = await query(`
    select
      id,
      source_type,
      base_url,
      active
    from sources
    where active = true
      and base_url is not null
      and source_type in ('news', 'ngo')
    order by id asc
  `);

  const sources = sourcesResult.rows.map((row: {
    id: string;
    source_type:
      | "news"
      | "gov"
      | "internal"
      | "social"
      | "ngo"
      | "treasury"
      | "utility"
      | "stats"
      | "research"
      | "watchdog";
    base_url: string;
    active: boolean;
  }) => ({
    sourceId: row.id,
    sourceType: row.source_type,
    baseUrl: row.base_url,
    active: row.active,
  }));

  if (sources.length === 0) {
    throw new Error("no active RSS sources configured in sources table");
  }

  const results = [];

  for (const source of sources) {
    await markAttempt(source.sourceId);

    const response = await fetch(source.baseUrl, { cache: "no-store" });

    if (!response.ok) {
      await markFailure(source.sourceId, `rss fetch failed: ${response.status}`);
      results.push({
        sourceId: source.sourceId,
        baseUrl: source.baseUrl,
        fetched: 0,
        inserted: 0,
        skipped: 0,
        enqueued: 0,
        errors: [`rss fetch failed: ${response.status}`],
      });
      continue;
    }

    const xml = await response.text();
    const parsed = await parseStringPromise(xml);
    const items = parsed?.rss?.channel?.[0]?.item ?? [];

    let inserted = 0;
    let skipped = 0;
    let enqueued = 0;
    const errors: string[] = [];

    for (const item of items.slice(0, 25)) {
      try {
        const guidValue = item.guid?.[0];
        const externalId =
          typeof guidValue === "string"
            ? guidValue
            : guidValue?._ ?? item.link?.[0];

        const title = (item.title?.[0] ?? "Untitled").replace(/\s+/g, " ").trim();
        const contentText = (
          item.description?.[0] ?? item["content:encoded"]?.[0] ?? ""
        )
          .replace(/\s+/g, " ")
          .trim();
        const url = item.link?.[0] ?? "";

        if (!title || !contentText || !url) {
          skipped += 1;
          continue;
        }

        if (!isInfrastructureRelevant(title, contentText, url)) {
          skipped += 1;
          continue;
        }

        const contentHash = createHash("sha256")
          .update(`${title}\n${contentText}`)
          .digest("hex");

        const existsResult = await query(
          `
            select exists(
              select 1
              from documents
              where content_hash = $1
            ) as exists
          `,
          [contentHash]
        );

        if (existsResult.rows[0]?.exists) {
          skipped += 1;
          continue;
        }

        const documentResult = await query(
          `
            insert into documents (
              source_id,
              external_id,
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
            values ($1, $2, $3, $4, $5, now(), 'article', 'en', $6, $7, 'registry-rss-v1', 'active')
            returning id
          `,
          [
            source.sourceId,
            externalId ?? null,
            url,
            title,
            item.pubDate?.[0] ? new Date(item.pubDate[0]).toISOString() : null,
            contentText,
            contentHash,
          ]
        );

        inserted += 1;

        await query(
          `
            insert into job_queue (job_type, payload)
            values (
              'process_document',
              $1::jsonb
            )
          `,
          [
            JSON.stringify({
              documentId: documentResult.rows[0].id,
              sourceId: source.sourceId,
              parserVersion: "processor-v1",
              processingMode: "full",
            }),
          ]
        );

        enqueued += 1;
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    results.push({
      sourceId: source.sourceId,
      baseUrl: source.baseUrl,
      fetched: items.length,
      inserted,
      skipped,
      enqueued,
      errors,
    });

    if (errors.length > 0 && inserted === 0) {
      await markFailure(source.sourceId, errors[0]);
    } else {
      await markSuccess(source.sourceId);
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
