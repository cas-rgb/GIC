import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  await query(`truncate fact_water_reliability_daily`);

  await query(
    `
      insert into fact_water_reliability_daily (
        day,
        province,
        official_document_count,
        official_signal_count,
        official_incident_count,
        avg_source_reliability,
        water_reliability_score
      )
      with official_water_docs as (
        select
          coalesce(date(d.published_at), date(d.created_at)) as day,
          l.province,
          count(distinct d.id)::int as official_document_count,
          round(avg(src.reliability_score)::numeric, 3) as avg_source_reliability
        from documents d
        join sources src on src.id = d.source_id
        join locations l on l.id = d.location_id
        where d.status = 'active'
          and l.province is not null
          and src.source_type in ('gov', 'utility', 'treasury', 'stats')
          and (
            d.parser_version = 'dws-fallback-v1'
            or d.title ~* '(water|sanitation|wastewater|sewer|dam|pipeline|reservoir|transfer)'
            or d.content_text ~* '(water|sanitation|wastewater|sewer|dam|pipeline|reservoir|transfer)'
          )
        group by 1, 2
      ),
      official_water_signals as (
        select
          coalesce(date(s.event_date), date(s.created_at)) as day,
          l.province,
          count(*)::int as official_signal_count
        from signals s
        join documents d on d.id = s.document_id
        join sources src on src.id = d.source_id
        left join locations l on l.id = coalesce(s.location_id, d.location_id)
        where l.province is not null
          and src.source_type in ('gov', 'utility', 'treasury', 'stats')
          and (
            s.summary_text ~* '(water|sanitation|wastewater|sewer|dam|pipeline|reservoir|transfer)'
            or s.signal_type ~* '(water|sanitation|wastewater|sewer)'
          )
        group by 1, 2
      ),
      official_water_incidents as (
        select
          coalesce(date(si.opened_at), date(si.created_at)) as day,
          l.province,
          count(*)::int as official_incident_count
        from service_incidents si
        join signals s on s.id = si.signal_id
        join documents d on d.id = s.document_id
        join sources src on src.id = d.source_id
        left join locations l on l.id = coalesce(si.location_id, s.location_id, d.location_id)
        where l.province is not null
          and src.source_type in ('gov', 'utility', 'treasury', 'stats')
          and si.service_domain = 'Water Infrastructure'
        group by 1, 2
      ),
      all_keys as (
        select day, province from official_water_docs
        union
        select day, province from official_water_signals
        union
        select day, province from official_water_incidents
      )
      select
        k.day,
        k.province,
        coalesce(d.official_document_count, 0) as official_document_count,
        coalesce(s.official_signal_count, 0) as official_signal_count,
        coalesce(i.official_incident_count, 0) as official_incident_count,
        coalesce(d.avg_source_reliability, 0.85) as avg_source_reliability,
        least(
          100,
          round(
            (
              coalesce(d.avg_source_reliability, 0.85) * 55 +
              least(coalesce(d.official_document_count, 0), 8) * 3 +
              least(coalesce(s.official_signal_count, 0), 12) * 1.5 +
              least(coalesce(i.official_incident_count, 0), 8) * 1.5
            )::numeric,
            2
          )
        ) as water_reliability_score
      from all_keys k
      left join official_water_docs d
        on d.day = k.day
       and d.province = k.province
      left join official_water_signals s
        on s.day = k.day
       and s.province = k.province
      left join official_water_incidents i
        on i.day = k.day
       and i.province = k.province
    `
  );

  const summary = await query(
    `
      select
        count(*)::int as "rowCount",
        count(distinct province)::int as "provinceCount"
      from fact_water_reliability_daily
    `
  );

  console.log(JSON.stringify(summary.rows[0] ?? { rowCount: 0, provinceCount: 0 }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
