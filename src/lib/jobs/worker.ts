import { query } from "@/lib/db";
import { rebuildDailyFacts } from "@/lib/analytics/rebuild-daily-facts";
import { createDocumentProcessor } from "@/lib/processing/run-document";

type JobType =
  | "ingest_document"
  | "process_document"
  | "embed_document"
  | "rebuild_daily_facts";

interface JobRow {
  id: string;
  job_type: JobType;
  payload: Record<string, unknown>;
  attempts: number;
  max_attempts: number;
}

async function claimNextJob(): Promise<JobRow | null> {
  const result = await query<JobRow>(`
    with next_job as (
      select id
      from job_queue
      where status = 'queued'
        and run_after <= now()
      order by created_at asc
      for update skip locked
      limit 1
    )
    update job_queue jq
    set
      status = 'running',
      attempts = attempts + 1,
      updated_at = now()
    from next_job
    where jq.id = next_job.id
    returning jq.id, jq.job_type, jq.payload, jq.attempts, jq.max_attempts
  `);

  return result.rows[0] ?? null;
}

async function markCompleted(jobId: string): Promise<void> {
  await query(
    `
      update job_queue
      set status = 'completed',
          updated_at = now()
      where id = $1
    `,
    [jobId]
  );
}

async function markFailed(
  jobId: string,
  errorMessage: string,
  attempts: number,
  maxAttempts: number
): Promise<void> {
  const status = attempts >= maxAttempts ? "failed" : "queued";

  await query(
    `
      update job_queue
      set
        status = $2,
        last_error = $3,
        run_after = case
          when $2 = 'queued' then now() + interval '5 minutes'
          else run_after
        end,
        updated_at = now()
      where id = $1
    `,
    [jobId, status, errorMessage]
  );
}

async function handleJob(job: JobRow): Promise<void> {
  switch (job.job_type) {
    case "process_document": {
      const processor = createDocumentProcessor();
      await processor.process(job.payload as never);
      await query(
        `
          insert into job_queue (job_type, payload)
          values ('rebuild_daily_facts', '{}'::jsonb)
        `
      );
      return;
    }
    case "rebuild_daily_facts":
      await rebuildDailyFacts(job.payload);
      return;
    case "embed_document":
      return;
    case "ingest_document":
      throw new Error("ingest_document handler not implemented yet");
    default:
      throw new Error(`unsupported job type: ${job.job_type satisfies never}`);
  }
}

export async function runWorkerOnce(): Promise<boolean> {
  const job = await claimNextJob();

  if (!job) {
    return false;
  }

  try {
    await handleJob(job);
    await markCompleted(job.id);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    await markFailed(job.id, errorMessage, job.attempts, job.max_attempts);
  }

  return true;
}
