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

  const liveDocs = await query(`
    select id, title, content_text, url
    from documents
    where parser_version = 'registry-rss-v1'
      and status = 'active'
  `);

  const irrelevantLiveIds = liveDocs.rows
    .filter((row: { title: string; content_text: string; url: string }) =>
      !isInfrastructureRelevant(row.title, row.content_text, row.url)
    )
    .map((row: { id: string }) => row.id);

  const demoDocs = await query(`
    select id
    from documents
    where parser_version = 'seed-v2'
  `);

  const demoIds = demoDocs.rows.map((row: { id: string }) => row.id);
  const archiveIds = [...new Set([...irrelevantLiveIds, ...demoIds])];

  if (archiveIds.length > 0) {
    await query(
      `
        delete from service_incidents
        where signal_id in (
          select id
          from signals
          where document_id = any($1::uuid[])
        )
      `,
      [archiveIds]
    );

    await query(
      `
        delete from signals
        where document_id = any($1::uuid[])
      `,
      [archiveIds]
    );

    await query(
      `
        update documents
        set status = 'archived'
        where id = any($1::uuid[])
      `,
      [archiveIds]
    );
  }

  await query(`truncate table fact_service_pressure_daily`);
  await query(`truncate table fact_source_reliability_daily`);

  await query(`
    insert into fact_service_pressure_daily (
      day,
      province,
      municipality,
      service_domain,
      pressure_case_count,
      high_severity_count,
      protest_count,
      response_count,
      avg_classification_confidence,
      source_document_count
    )
    select
      coalesce(date(si.opened_at), date(s.created_at)) as day,
      l.province,
      l.municipality,
      si.service_domain,
      count(*) as pressure_case_count,
      count(*) filter (where si.severity = 'High') as high_severity_count,
      count(*) filter (where si.protest_indicator = true) as protest_count,
      count(*) filter (where si.response_indicator = true) as response_count,
      round(avg(si.classification_confidence)::numeric, 3) as avg_classification_confidence,
      count(distinct s.document_id) as source_document_count
    from service_incidents si
    join signals s on s.id = si.signal_id
    join documents d on d.id = s.document_id
    left join locations l on l.id = coalesce(si.location_id, s.location_id)
    where si.citizen_pressure_indicator = true
      and si.failure_indicator = true
      and d.status = 'active'
    group by 1, 2, 3, 4
  `);

  await query(`
    insert into fact_source_reliability_daily (
      day,
      province,
      source_type,
      source_count,
      avg_reliability_score,
      document_count
    )
    select
      coalesce(date(d.published_at), date(d.created_at)) as day,
      l.province,
      src.source_type,
      count(distinct src.id) as source_count,
      round(avg(src.reliability_score)::numeric, 3) as avg_reliability_score,
      count(distinct d.id) as document_count
    from documents d
    join sources src on src.id = d.source_id
    left join locations l on l.id = d.location_id
    where d.status = 'active'
      and l.province is not null
    group by 1, 2, 3
  `);

  console.log(
    JSON.stringify(
      {
        archivedDemoDocuments: demoIds.length,
        archivedIrrelevantLiveDocuments: irrelevantLiveIds.length,
        archivedTotal: archiveIds.length,
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
