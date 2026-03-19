import { query } from "@/lib/db";

export interface InsertDocumentInput {
  sourceId: string;
  externalId?: string;
  url: string;
  title: string;
  publishedAt?: string | null;
  docType: "article" | "report" | "tender" | "budget" | "notice";
  language: string;
  contentText: string;
  contentHash: string;
  parserVersion: string;
}

export async function documentExistsByHash(
  contentHash: string,
): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `
      select exists(
        select 1
        from documents
        where content_hash = $1
      ) as exists
    `,
    [contentHash],
  );

  return result.rows[0]?.exists ?? false;
}

export async function insertDocument(
  input: InsertDocumentInput,
): Promise<string> {
  const result = await query<{ id: string }>(
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
      values ($1, $2, $3, $4, $5, now(), $6, $7, $8, $9, $10, 'active')
      returning id
    `,
    [
      input.sourceId,
      input.externalId ?? null,
      input.url,
      input.title,
      input.publishedAt ?? null,
      input.docType,
      input.language,
      input.contentText,
      input.contentHash,
      input.parserVersion,
    ],
  );

  return result.rows[0].id;
}
