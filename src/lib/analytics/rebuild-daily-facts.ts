import { query } from "@/lib/db";

export async function rebuildDailyFacts(
  _payload: {
    province?: string;
    startDate?: string;
    endDate?: string;
  } = {},
): Promise<void> {
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
    left join locations l on l.id = coalesce(si.location_id, s.location_id)
    where si.citizen_pressure_indicator = true
      and si.failure_indicator = true
      and l.province is not null
    group by 1, 2, 3, 4
    on conflict (day, province, municipality, service_domain)
    do update set
      pressure_case_count = excluded.pressure_case_count,
      high_severity_count = excluded.high_severity_count,
      protest_count = excluded.protest_count,
      response_count = excluded.response_count,
      avg_classification_confidence = excluded.avg_classification_confidence,
      source_document_count = excluded.source_document_count
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
    on conflict (day, province, source_type)
    do update set
      source_count = excluded.source_count,
      avg_reliability_score = excluded.avg_reliability_score,
      document_count = excluded.document_count
  `);
}
