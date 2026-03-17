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
  /sanitation/i,
  /wastewater/i,
  /sewer/i,
  /electricity/i,
  /power/i,
  /road/i,
  /transport/i,
  /bridge/i,
  /flood/i,
  /dam/i,
  /bulk supply/i,
  /pipeline/i,
  /refurbishment/i,
  /project/i,
  /housing/i,
  /settlement/i,
  /eskom debt/i,
];

function isRelevant(text: string): boolean {
  return RELEVANCE_PATTERNS.some((pattern) => pattern.test(text));
}

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

async function ingestRssSource(
  source: { id: string; name: string; base_url: string },
  query: (text: string, params?: unknown[]) => Promise<{ rows: any[] }>
) {
  const { parseStringPromise } = require("xml2js");
  const { createHash } = require("crypto");

  const response = await fetch(source.base_url, { cache: "no-store" });
  if (!response.ok) {
    return {
      sourceId: source.id,
      name: source.name,
      fetched: 0,
      inserted: 0,
      skipped: 0,
      enqueued: 0,
      errors: [`fetch failed: ${response.status}`],
    };
  }

  const xml = await response.text();
  const parsed = await parseStringPromise(xml);
  const items = parsed?.rss?.channel?.[0]?.item ?? [];

  let inserted = 0;
  let skipped = 0;
  let enqueued = 0;
  const errors: string[] = [];

  for (const item of items.slice(0, 30)) {
    try {
      const title = normalizeText(item.title?.[0] ?? "");
      const contentText = normalizeText(item.description?.[0] ?? item["content:encoded"]?.[0] ?? "");
      const url = item.link?.[0] ?? "";

      if (!title || !url || !isRelevant(`${title}\n${contentText}`)) {
        skipped += 1;
        continue;
      }

      const contentHash = createHash("sha256").update(`${title}\n${contentText}`).digest("hex");
      const exists = await query(`select 1 from documents where content_hash = $1 limit 1`, [contentHash]);
      if (exists.rows[0]) {
        skipped += 1;
        continue;
      }

      const insertedDoc = await query(
        `
          insert into documents (
            source_id,
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
          values ($1, $2, $3, $4, now(), 'article', 'en', $5, $6, 'official-gov-v1', 'active')
          returning id
        `,
        [
          source.id,
          url,
          title,
          item.pubDate?.[0] ? new Date(item.pubDate[0]).toISOString() : null,
          contentText || title,
          contentHash,
        ]
      );

      await query(
        `
          insert into job_queue (job_type, payload)
          values ('process_document', $1::jsonb)
        `,
        [
          JSON.stringify({
            documentId: insertedDoc.rows[0].id,
            sourceId: source.id,
            parserVersion: "processor-v1",
            processingMode: "full",
          }),
        ]
      );

      inserted += 1;
      enqueued += 1;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return {
    sourceId: source.id,
    name: source.name,
    fetched: items.length,
    inserted,
    skipped,
    enqueued,
    errors,
  };
}

async function ingestHtmlSource(
  source: { id: string; name: string; base_url: string },
  query: (text: string, params?: unknown[]) => Promise<{ rows: any[] }>
) {
  const { createHash } = require("crypto");

  const response = await fetch(source.base_url, { cache: "no-store" });
  if (!response.ok) {
    return {
      sourceId: source.id,
      name: source.name,
      fetched: 0,
      inserted: 0,
      skipped: 0,
      enqueued: 0,
      errors: [`fetch failed: ${response.status}`],
    };
  }

  const html = await response.text();
  const anchorRegex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
  const matches: Array<{ url: string; title: string }> = [];
  let match: RegExpExecArray | null = anchorRegex.exec(html);

  while (match) {
    const title = normalizeText(match[2] ?? "");
    const url = absoluteUrl(source.base_url, match[1] ?? "");
    if (title && url && isRelevant(title)) {
      matches.push({ title, url });
    }
    match = anchorRegex.exec(html);
  }

  let inserted = 0;
  let skipped = 0;
  let enqueued = 0;
  const errors: string[] = [];

  for (const item of matches.slice(0, 40)) {
    try {
      const contentHash = createHash("sha256").update(`${item.title}\n${item.url}`).digest("hex");
      const exists = await query(`select 1 from documents where content_hash = $1 limit 1`, [contentHash]);
      if (exists.rows[0]) {
        skipped += 1;
        continue;
      }

      const insertedDoc = await query(
        `
          insert into documents (
            source_id,
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
          values ($1, $2, $3, now(), now(), 'notice', 'en', $4, $5, 'official-gov-v1', 'active')
          returning id
        `,
        [source.id, item.url, item.title, item.title, contentHash]
      );

      await query(
        `
          insert into job_queue (job_type, payload)
          values ('process_document', $1::jsonb)
        `,
        [
          JSON.stringify({
            documentId: insertedDoc.rows[0].id,
            sourceId: source.id,
            parserVersion: "processor-v1",
            processingMode: "full",
          }),
        ]
      );

      inserted += 1;
      enqueued += 1;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return {
    sourceId: source.id,
    name: source.name,
    fetched: matches.length,
    inserted,
    skipped,
    enqueued,
    errors,
  };
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

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
    select id, name, base_url
    from sources
    where active = true
      and source_type = 'gov'
      and base_url is not null
    order by name asc
  `);

  const results = [];

  for (const source of sourcesResult.rows as Array<{ id: string; name: string; base_url: string }>) {
    await markAttempt(source.id);

    const result = source.base_url.endsWith(".xml")
      ? await ingestRssSource(source, query)
      : await ingestHtmlSource(source, query);

    results.push(result);

    if (result.errors.length > 0 && result.inserted === 0) {
      await markFailure(source.id, result.errors[0]);
    } else {
      await markSuccess(source.id);
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
