import { createHash } from "crypto";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

interface RssItem {
  guid?: Array<{ _: string } | string>;
  link?: string[];
  title?: string[];
  pubDate?: string[];
  description?: string[];
  "content:encoded"?: string[];
  category?: string[];
}

interface ParsedRss {
  rss?: {
    channel?: Array<{
      item?: RssItem[];
    }>;
  };
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function computeContentHash(title: string, contentText: string): string {
  return createHash("sha256")
    .update(`${title}\n${contentText}`)
    .digest("hex");
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db") as typeof import("../src/lib/db");
  const { parseStringPromise } = require("xml2js") as typeof import("xml2js");

  const sourceResult = await query<{
    id: string;
    source_type: string;
    base_url: string | null;
    active: boolean;
  }>(
    `
      select id, source_type, base_url, active
      from sources
      where source_type = 'news'
        and active = true
        and base_url is not null
      order by id asc
      limit 1
    `
  );

  const source = sourceResult.rows[0];

  if (!source?.base_url) {
    throw new Error("active news source not configured");
  }

  const response = await fetch(source.base_url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`rss fetch failed: ${response.status}`);
  }

  const xml = await response.text();
  const parsed = (await parseStringPromise(xml)) as ParsedRss;
  const items = parsed.rss?.channel?.[0]?.item ?? [];

  const result = {
    fetched: items.length,
    inserted: 0,
    skipped: 0,
    enqueued: 0,
    errors: [] as string[],
  };

  for (const item of items.slice(0, 25)) {
    try {
      const guidValue = item.guid?.[0];
      const externalId =
        typeof guidValue === "string"
          ? guidValue
          : guidValue?._ ?? item.link?.[0];

      const title = normalizeWhitespace(item.title?.[0] ?? "Untitled");
      const contentText = normalizeWhitespace(
        item.description?.[0] ?? item["content:encoded"]?.[0] ?? ""
      );
      const url = item.link?.[0] ?? "";

      if (!title || !contentText || !url) {
        result.skipped += 1;
        continue;
      }

      const contentHash = computeContentHash(title, contentText);
      const existsResult = await query<{ exists: boolean }>(
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
        result.skipped += 1;
        continue;
      }

      const inserted = await query<{ id: string }>(
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
          values ($1, $2, $3, $4, $5, now(), 'article', 'en', $6, $7, 'ingestion-v1', 'active')
          returning id
        `,
        [
          source.id,
          externalId ?? null,
          url,
          title,
          item.pubDate?.[0] ? new Date(item.pubDate[0]).toISOString() : null,
          contentText,
          contentHash,
        ]
      );

      result.inserted += 1;

      await query(
        `
          insert into job_queue (job_type, payload)
          values ('process_document', $1::jsonb)
        `,
        [
          JSON.stringify({
            documentId: inserted.rows[0].id,
            sourceId: source.id,
            parserVersion: "processor-v1",
            processingMode: "full",
          }),
        ]
      );

      result.enqueued += 1;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  console.log(JSON.stringify(result, null, 2));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
