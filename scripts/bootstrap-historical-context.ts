import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

const SOURCE_NAME = "Governed platform backfill";
const SOURCE_URL = "internal://governed-history-bootstrap";
const VERIFICATION_TIER = "governed";

async function clearPriorBackfill() {
  await query(`delete from province_infrastructure_history where source_name = $1`, [SOURCE_NAME]);
  await query(`delete from municipality_infrastructure_history where source_name = $1`, [SOURCE_NAME]);
  await query(`delete from ward_infrastructure_history where source_name = $1`, [SOURCE_NAME]);
  await query(`delete from historical_issue_events where source_name = $1`, [SOURCE_NAME]);
  await query(`delete from budget_allocations where source_name = $1`, [SOURCE_NAME]);
}

async function seedProvinceHistory() {
  const result = await query<{
    province: string;
    service_domain: string | null;
    period_year: number | null;
    incident_count: number;
    high_count: number;
    protest_count: number;
    last_event_date: string | null;
  }>(
    `
      select
        l.province,
        lower(si.service_domain) as service_domain,
        extract(year from coalesce(si.opened_at, s.event_date, d.published_at, d.created_at))::int as period_year,
        count(*)::int as incident_count,
        count(*) filter (where si.severity = 'High')::int as high_count,
        count(*) filter (where si.protest_indicator = true)::int as protest_count,
        max(coalesce(si.opened_at, s.event_date, d.published_at, d.created_at))::text as last_event_date
      from service_incidents si
      join signals s on s.id = si.signal_id
      left join documents d on d.id = s.document_id
      join locations l on l.id = coalesce(si.location_id, s.location_id)
      where l.province is not null
      group by 1, 2, 3
      having count(*) > 0
    `
  );

  for (const row of result.rows) {
    const summaryText = `Observed ${row.incident_count} governed ${row.service_domain ?? "service"} incidents in ${row.province} during ${row.period_year ?? "the recorded period"}, including ${row.high_count} high-severity cases and ${row.protest_count} protest-linked events.`;
    await query(
      `
        insert into province_infrastructure_history (
          province_name,
          issue_family,
          service_domain,
          event_date,
          period_year,
          severity,
          summary_text,
          source_name,
          source_url,
          verification_tier,
          retrieved_at
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())
      `,
      [
        row.province,
        row.service_domain,
        row.service_domain,
        row.last_event_date,
        row.period_year,
        row.high_count > 0 ? "High" : row.incident_count >= 5 ? "Medium" : "Low",
        summaryText,
        SOURCE_NAME,
        SOURCE_URL,
        VERIFICATION_TIER,
      ]
    );
  }

  return result.rows.length;
}

async function seedMunicipalityHistory() {
  const result = await query<{
    province: string;
    municipality: string;
    service_domain: string | null;
    period_year: number | null;
    incident_count: number;
    high_count: number;
    protest_count: number;
    last_event_date: string | null;
  }>(
    `
      select
        l.province,
        l.municipality,
        lower(si.service_domain) as service_domain,
        extract(year from coalesce(si.opened_at, s.event_date, d.published_at, d.created_at))::int as period_year,
        count(*)::int as incident_count,
        count(*) filter (where si.severity = 'High')::int as high_count,
        count(*) filter (where si.protest_indicator = true)::int as protest_count,
        max(coalesce(si.opened_at, s.event_date, d.published_at, d.created_at))::text as last_event_date
      from service_incidents si
      join signals s on s.id = si.signal_id
      left join documents d on d.id = s.document_id
      join locations l on l.id = coalesce(si.location_id, s.location_id)
      where l.province is not null
        and l.municipality is not null
      group by 1, 2, 3, 4
      having count(*) > 0
    `
  );

  for (const row of result.rows) {
    const summaryText = `Observed ${row.incident_count} governed ${row.service_domain ?? "service"} incidents in ${row.municipality} during ${row.period_year ?? "the recorded period"}, including ${row.high_count} high-severity cases and ${row.protest_count} protest-linked events.`;
    await query(
      `
        insert into municipality_infrastructure_history (
          province_name,
          municipality_name,
          issue_family,
          service_domain,
          event_date,
          period_year,
          severity,
          summary_text,
          source_name,
          source_url,
          verification_tier,
          retrieved_at
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now())
      `,
      [
        row.province,
        row.municipality,
        row.service_domain,
        row.service_domain,
        row.last_event_date,
        row.period_year,
        row.high_count > 0 ? "High" : row.incident_count >= 5 ? "Medium" : "Low",
        summaryText,
        SOURCE_NAME,
        SOURCE_URL,
        VERIFICATION_TIER,
      ]
    );
  }

  return result.rows.length;
}

async function seedWardHistory() {
  const result = await query<{
    province: string;
    municipality: string;
    ward: string;
    service_domain: string | null;
    period_year: number | null;
    incident_count: number;
    high_count: number;
    protest_count: number;
    last_event_date: string | null;
  }>(
    `
      select
        l.province,
        l.municipality,
        l.ward,
        lower(si.service_domain) as service_domain,
        extract(year from coalesce(si.opened_at, s.event_date, d.published_at, d.created_at))::int as period_year,
        count(*)::int as incident_count,
        count(*) filter (where si.severity = 'High')::int as high_count,
        count(*) filter (where si.protest_indicator = true)::int as protest_count,
        max(coalesce(si.opened_at, s.event_date, d.published_at, d.created_at))::text as last_event_date
      from service_incidents si
      join signals s on s.id = si.signal_id
      left join documents d on d.id = s.document_id
      join locations l on l.id = coalesce(si.location_id, s.location_id)
      where l.province is not null
        and l.municipality is not null
        and l.ward is not null
        and btrim(l.ward) <> ''
      group by 1, 2, 3, 4, 5
      having count(*) > 0
    `
  );

  for (const row of result.rows) {
    const summaryText = `Observed ${row.incident_count} governed ${row.service_domain ?? "service"} incidents in ${row.ward}, ${row.municipality} during ${row.period_year ?? "the recorded period"}, including ${row.high_count} high-severity cases and ${row.protest_count} protest-linked events.`;
    await query(
      `
        insert into ward_infrastructure_history (
          province_name,
          municipality_name,
          ward_name,
          issue_family,
          service_domain,
          event_date,
          period_year,
          severity,
          summary_text,
          source_name,
          source_url,
          verification_tier,
          retrieved_at
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now())
      `,
      [
        row.province,
        row.municipality,
        row.ward,
        row.service_domain,
        row.service_domain,
        row.last_event_date,
        row.period_year,
        row.high_count > 0 ? "High" : row.incident_count >= 3 ? "Medium" : "Low",
        summaryText,
        SOURCE_NAME,
        SOURCE_URL,
        VERIFICATION_TIER,
      ]
    );
  }

  return result.rows.length;
}

async function seedHistoricalIssueEvents() {
  const result = await query<{
    geography_level: string;
    province_name: string;
    municipality_name: string | null;
    ward_name: string | null;
    issue_family: string | null;
    event_date: string | null;
    summary_text: string;
  }>(
    `
      with ranked_docs as (
        select
          case
            when l.ward is not null and btrim(l.ward) <> '' then 'ward'
            when l.municipality is not null then 'municipality'
            else 'province'
          end as geography_level,
          l.province as province_name,
          l.municipality as municipality_name,
          l.ward as ward_name,
          lower(si.service_domain) as issue_family,
          coalesce(si.opened_at, s.event_date, d.published_at, d.created_at) as event_date,
          coalesce(d.title, s.summary_text, 'Governed issue event') as summary_text,
          row_number() over (
            partition by
              case
                when l.ward is not null and btrim(l.ward) <> '' then 'ward'
                when l.municipality is not null then 'municipality'
                else 'province'
              end,
              l.province,
              l.municipality,
              l.ward,
              lower(si.service_domain)
            order by coalesce(si.opened_at, s.event_date, d.published_at, d.created_at) desc nulls last
          ) as rank_in_group
        from service_incidents si
        join signals s on s.id = si.signal_id
        left join documents d on d.id = s.document_id
        join locations l on l.id = coalesce(si.location_id, s.location_id)
        where l.province is not null
      )
      select
        geography_level,
        province_name,
        municipality_name,
        ward_name,
        issue_family,
        event_date::text,
        summary_text
      from ranked_docs
      where rank_in_group <= 3
    `
  );

  for (const row of result.rows) {
    await query(
      `
        insert into historical_issue_events (
          geography_level,
          province_name,
          municipality_name,
          ward_name,
          issue_family,
          service_domain,
          event_date,
          period_year,
          severity,
          summary_text,
          source_name,
          source_url,
          verification_tier,
          retrieved_at
        )
        values ($1,$2,$3,$4,$5,$6,$7,extract(year from $7::timestamptz)::int,null,$8,$9,$10,$11,now())
      `,
      [
        row.geography_level,
        row.province_name,
        row.municipality_name,
        row.ward_name,
        row.issue_family,
        row.issue_family,
        row.event_date,
        row.summary_text,
        SOURCE_NAME,
        SOURCE_URL,
        VERIFICATION_TIER,
      ]
    );
  }

  return result.rows.length;
}

async function seedBudgetBackfill() {
  const result = await query<{
    province_name: string;
    municipality_name: string | null;
    ward_name: string | null;
    sector: string;
    period_year: number | null;
    amount: number;
  }>(
    `
      select
        l.province as province_name,
        l.municipality as municipality_name,
        l.ward as ward_name,
        lower(b.sector) as sector,
        extract(year from b.period_start)::int as period_year,
        sum(b.budget_amount)::numeric(18,2) as amount
      from budgets b
      join documents d on d.id = b.document_id
      left join locations l on l.id = coalesce(b.location_id, d.location_id)
      where l.province is not null
      group by 1,2,3,4,5
    `
  );

  for (const row of result.rows) {
    const geographyLevel = row.ward_name ? "ward" : row.municipality_name ? "municipality" : "province";
    await query(
      `
        insert into budget_allocations (
          geography_level,
          province_name,
          municipality_name,
          ward_name,
          issue_family,
          service_domain,
          period_year,
          budget_amount,
          project_name,
          project_status,
          summary_text,
          source_name,
          source_url,
          verification_tier,
          retrieved_at
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8,null,null,$9,$10,$11,$12,now())
      `,
      [
        geographyLevel,
        row.province_name,
        row.municipality_name,
        row.ward_name,
        row.sector,
        row.sector,
        row.period_year,
        row.amount,
        `Observed governed budget allocations mapped to ${row.sector} for ${row.period_year ?? "the available period"}.`,
        SOURCE_NAME,
        SOURCE_URL,
        VERIFICATION_TIER,
      ]
    );
  }

  return result.rows.length;
}

async function main() {
  await clearPriorBackfill();

  const provinceRows = await seedProvinceHistory();
  const municipalityRows = await seedMunicipalityHistory();
  const wardRows = await seedWardHistory();
  const eventRows = await seedHistoricalIssueEvents();
  const budgetRows = await seedBudgetBackfill();

  console.log(
    JSON.stringify(
      {
        source: SOURCE_NAME,
        provinceRows,
        municipalityRows,
        wardRows,
        eventRows,
        budgetRows,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
