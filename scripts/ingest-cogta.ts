import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const RELEVANCE_PATTERNS = [
  /province/i,
  /municipal/i,
  /municipality/i,
  /district/i,
  /metro/i,
  /diagnostic/i,
  /dashboard/i,
  /infrastructure/i,
  /service delivery/i,
  /water/i,
  /sanitation/i,
  /finance/i,
  /governance/i,
  /development/i,
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

function isRelevant(title: string, href: string): boolean {
  return RELEVANCE_PATTERNS.some((pattern) => pattern.test(`${title}\n${href}`));
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");
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

  const sourcesResult = await query(
    `
      select id, name, base_url
      from sources
      where active = true
        and source_type = 'gov'
        and (
          name ilike 'CoGTA National Strategic Hub%'
          or base_url ilike '%nationalstrathub.cogta.gov.za%'
        )
        and base_url is not null
      order by name asc
    `
  );

  const results = [];

  for (const source of sourcesResult.rows as Array<{ id: string; name: string; base_url: string }>) {
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
          enqueued: 0,
          errors: [error],
        });
        continue;
      }

      const html = await response.text();
      const pageTitleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const pageTitle = normalizeText(pageTitleMatch?.[1] ?? source.name);
      const pageText = normalizeText(html).slice(0, 3000);
      const pageHash = createHash("sha256")
        .update(`${pageTitle}\n${pageText}`)
        .digest("hex");

      let inserted = 0;
      let skipped = 0;
      let enqueued = 0;
      const errors: string[] = [];

      const existingPage = await query(
        `select id from documents where content_hash = $1 limit 1`,
        [pageHash]
      );

      if (!existingPage.rows[0]) {
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
            values ($1, $2, $3, now(), now(), 'report', 'en', $4, $5, 'cogta-nsh-v1', 'active')
            returning id
          `,
          [source.id, source.base_url, pageTitle, pageText, pageHash]
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
      }

      const anchorRegex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
      const seen = new Set<string>();
      let match: RegExpExecArray | null = anchorRegex.exec(html);
      let fetched = 0;

      while (match && fetched < 40) {
        const title = normalizeText(match[2] ?? "");
        const url = absoluteUrl(source.base_url, match[1] ?? "");
        match = anchorRegex.exec(html);

        if (!title || !url || seen.has(url)) {
          continue;
        }

        seen.add(url);

        if (!url.includes("nationalstrathub.cogta.gov.za") || !isRelevant(title, url)) {
          skipped += 1;
          continue;
        }

        fetched += 1;

        try {
          const contentHash = createHash("sha256")
            .update(`${title}\n${url}`)
            .digest("hex");

          const exists = await query(
            `select id from documents where content_hash = $1 limit 1`,
            [contentHash]
          );

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
              values ($1, $2, $3, now(), now(), 'report', 'en', $4, $5, 'cogta-nsh-v1', 'active')
              returning id
            `,
            [source.id, url, title, title, contentHash]
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

      if (errors.length > 0 && inserted === 0) {
        await markFailure(source.id, errors[0]);
      } else {
        await markSuccess(source.id);
      }

      results.push({
        sourceId: source.id,
        name: source.name,
        fetched,
        inserted,
        skipped,
        enqueued,
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
        enqueued: 0,
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
