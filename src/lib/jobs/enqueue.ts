import { query } from "@/lib/db";
import { ProcessDocumentJob } from "@/lib/processing/types";

export async function enqueueProcessDocument(
  payload: ProcessDocumentJob,
): Promise<void> {
  await query(
    `
      insert into job_queue (job_type, payload)
      values ('process_document', $1::jsonb)
    `,
    [JSON.stringify(payload)],
  );
}

export async function enqueueEmbedDocument(payload: {
  documentId: string;
}): Promise<void> {
  await query(
    `
      insert into job_queue (job_type, payload)
      values ('embed_document', $1::jsonb)
    `,
    [JSON.stringify(payload)],
  );
}

export async function enqueueRebuildDailyFacts(
  payload: {
    province?: string;
    startDate?: string;
    endDate?: string;
  } = {},
): Promise<void> {
  await query(
    `
      insert into job_queue (job_type, payload)
      values ('rebuild_daily_facts', $1::jsonb)
    `,
    [JSON.stringify(payload)],
  );
}
