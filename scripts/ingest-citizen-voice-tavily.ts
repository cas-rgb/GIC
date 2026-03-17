import { createHash } from "crypto";
import { createRequire } from "module";

import { tavily } from "@tavily/core";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

interface QueryPackRow {
  id: string;
  scope_type: string;
  scope_name: string;
  issue_family: string;
  query_text: string;
}

interface TavilySearchResult {
  url?: string;
  title?: string;
  content?: string;
  published_date?: string | null;
}

const PUBLIC_VOICE_SITE_CONSTRAINT =
  '(site:x.com OR site:twitter.com OR site:facebook.com OR site:instagram.com OR site:tiktok.com OR site:threads.net OR site:linkedin.com OR site:youtube.com OR site:reddit.com OR site:hellopeter.com)';

const MUNICIPALITY_PROVINCE_MAP: Record<string, string> = {
  "City of Johannesburg": "Gauteng",
  "City of Tshwane": "Gauteng",
  Ekurhuleni: "Gauteng",
  Emfuleni: "Gauteng",
  eThekwini: "KwaZulu-Natal",
  "City of Cape Town": "Western Cape",
  "Nelson Mandela Bay": "Eastern Cape",
  "Buffalo City": "Eastern Cape",
  Mangaung: "Free State",
  Polokwane: "Limpopo",
  Mbombela: "Mpumalanga",
  Rustenburg: "North West",
  "Sol Plaatje": "Northern Cape",
  Msunduzi: "KwaZulu-Natal",
  uMhlathuze: "KwaZulu-Natal",
  George: "Western Cape",
  Emalahleni: "Mpumalanga",
  Matjhabeng: "Free State",
  Mahikeng: "North West",
  Lephalale: "Limpopo",
  "Thembisile Hani": "Mpumalanga",
  Mogalakwena: "Limpopo",
  "Saldanha Bay": "Western Cape",
};

function buildExternalId(packId: string, url: string): string {
  return `tavily-cv:${packId}:${createHash("sha1").update(url).digest("hex")}`;
}

function buildContentHash(title: string, content: string, url: string): string {
  return createHash("sha256").update(`${title}\n${content}\n${url}`).digest("hex");
}

async function ensureSocialSource(queryFn: <T>(text: string, params?: unknown[]) => Promise<{ rows: T[] }>) {
  const existing = await queryFn<{ id: string }>(
    `
      select id
      from sources
      where name = 'Tavily Citizen Voice'
        and source_type = 'social'
      order by created_at asc
      limit 1
    `
  );

  if (existing.rows[0]?.id) {
    return existing.rows[0].id;
  }

  const inserted = await queryFn<{ id: string }>(
    `
      insert into sources (
        name,
        source_type,
        base_url,
        reliability_score,
        active,
        created_at,
        updated_at
      )
      values ('Tavily Citizen Voice', 'social', 'https://tavily.com', 0.650, true, now(), now())
      returning id
    `
  );

  return inserted.rows[0].id;
}

async function ensureLocation(
  queryFn: <T>(text: string, params?: unknown[]) => Promise<{ rows: T[] }>,
  pack: QueryPackRow
) {
  const province =
    pack.scope_type === "province" ? pack.scope_name : MUNICIPALITY_PROVINCE_MAP[pack.scope_name] ?? null;
  const municipality = pack.scope_type === "municipality" ? pack.scope_name : null;

  if (!province && !municipality) {
    return null;
  }

  const locationKey = ["South Africa", province ?? "", "", municipality ?? "", ""].join("|");
  const result = await queryFn<{ id: string }>(
    `
      insert into locations (country, province, district, municipality, ward, location_key)
      values ('South Africa', $1, null, $2, null, $3)
      on conflict (location_key)
      do update set
        province = excluded.province,
        municipality = excluded.municipality
      returning id
    `,
    [province, municipality, locationKey]
  );

  return result.rows[0]?.id ?? null;
}

async function main(): Promise<void> {
  const apiKey = process.env.TAVILY_API_KEY || process.env.NEXT_PUBLIC_TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not configured");
  }

  const client = tavily({ apiKey });
  const { query: rawQuery } = require("../src/lib/db");
  const query = rawQuery as <TRow>(
    text: string,
    params?: unknown[]
  ) => Promise<{ rows: TRow[]; rowCount: number | null }>;

  const sourceId = await ensureSocialSource(query);
  const packsResult = await query<QueryPackRow>(
    `
      select
        id,
        scope_type,
        scope_name,
        issue_family,
        query_text
      from citizen_voice_query_packs
      where active = true
        and verification_status = 'verified'
        and platform = 'public_social'
      order by
        case when scope_type = 'municipality' then 0 else 1 end,
        scope_name asc,
        issue_family asc
      limit 160
    `
  );

  let fetched = 0;
  let inserted = 0;
  let skipped = 0;
  let enqueued = 0;
  const errors: Array<{ packId: string; message: string }> = [];

  await query(
    `
      update sources
      set last_attempted_at = now(), updated_at = now()
      where id = $1
    `,
    [sourceId]
  );

  for (const pack of packsResult.rows) {
    const locationId = await ensureLocation(query, pack);
    const scopedQuery = `${pack.query_text} ${PUBLIC_VOICE_SITE_CONSTRAINT}`;

    try {
      const response = await client.search(scopedQuery, {
        searchDepth: "advanced",
        maxResults: 5,
        includeAnswer: false,
        topic: "general",
        timeRange: "month",
      });

      const results = ((response as { results?: TavilySearchResult[] }).results ?? []).filter(
        (result) => result.url && result.title && result.content
      );

      fetched += results.length;

      for (const result of results) {
        const url = result.url as string;
        const title = (result.title as string).replace(/\s+/g, " ").trim().slice(0, 300);
        const contentText = (result.content as string).replace(/\s+/g, " ").trim();

        if (!title || !contentText) {
          skipped += 1;
          continue;
        }

        const contentHash = buildContentHash(title, contentText, url);
        const exists = await query<{ exists: boolean }>(
          `
            select exists(
              select 1 from documents where content_hash = $1
            ) as exists
          `,
          [contentHash]
        );

        if (exists.rows[0]?.exists) {
          skipped += 1;
          continue;
        }

        const externalId = buildExternalId(pack.id, url);
        const documentResult = await query<{ id: string }>(
          `
            insert into documents (
              source_id,
              location_id,
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
            values ($1, $2, $3, $4, $5, $6, now(), 'article', 'en', $7, $8, 'tavily-citizen-v1', 'active')
            returning id
          `,
          [
            sourceId,
            locationId,
            externalId,
            url,
            title,
            result.published_date ? new Date(result.published_date).toISOString() : null,
            contentText,
            contentHash,
          ]
        );

        inserted += 1;

        await query(
          `
            insert into job_queue (job_type, payload)
            values ('process_document', $1::jsonb)
          `,
          [
            JSON.stringify({
              documentId: documentResult.rows[0].id,
              sourceId,
              parserVersion: "processor-v1",
              processingMode: "full",
            }),
          ]
        );

        enqueued += 1;
      }
    } catch (error) {
      errors.push({
        packId: pack.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (errors.length > 0 && inserted === 0) {
    await query(
      `
        update sources
        set last_error = $2, updated_at = now()
        where id = $1
      `,
      [sourceId, errors[0].message.slice(0, 500)]
    );
  } else {
    await query(
      `
        update sources
        set last_ingested_at = now(), last_error = null, updated_at = now()
        where id = $1
      `,
      [sourceId]
    );
  }

  console.log(
    JSON.stringify(
      {
        packsProcessed: packsResult.rows.length,
        fetched,
        inserted,
        skipped,
        enqueued,
        errorCount: errors.length,
        errors: errors.slice(0, 10),
      },
      null,
      2
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
