import * as fs from "fs";
import * as path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

interface CountRow {
  count: number | string;
}

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return typeof value === "string" ? Number(value) : value;
}

async function main(): Promise<void> {
  const outputDir = path.resolve(process.cwd(), "data", "audits");
  fs.mkdirSync(outputDir, { recursive: true });

  const [
    totalsResult,
    provinceCoverageResult,
    municipalityCoverageResult,
    wardCoverageResult,
    leadershipCoverageResult,
    projectCoverageResult,
  ] = await Promise.all([
    query(
      `
        select
          (select count(*)::int from documents) as documents,
          (select count(*)::int from signals) as signals,
          (select count(*)::int from service_incidents) as service_incidents,
          (select count(*)::int from sentiment_mentions) as sentiment_mentions,
          (select count(*)::int from citizen_voice_mentions) as citizen_voice_mentions,
          (select count(*)::int from leader_mentions) as leader_mentions,
          (select count(*)::int from municipal_leader_mentions) as municipal_leader_mentions,
          (select count(*)::int from infrastructure_projects) as infrastructure_projects,
          (select count(*)::int from locations) as locations
      `
    ),
    query(
      `
        with province_docs as (
          select l.province, count(distinct d.id)::int as document_count
          from documents d
          join locations l on l.id = d.location_id
          where d.status = 'active'
            and l.province is not null
          group by l.province
        ),
        province_pressure as (
          select province, coalesce(sum(pressure_case_count), 0)::int as pressure_case_count
          from fact_service_pressure_daily
          where province is not null
          group by province
        ),
        province_voice as (
          select province, coalesce(sum(mention_count), 0)::int as citizen_voice_count
          from fact_citizen_voice_daily
          where province is not null
          group by province
        )
        select
          coalesce(pd.province, pp.province, pv.province) as province,
          coalesce(pd.document_count, 0)::int as "documentCount",
          coalesce(pp.pressure_case_count, 0)::int as "pressureCaseCount",
          coalesce(pv.citizen_voice_count, 0)::int as "citizenVoiceCount"
        from province_docs pd
        full outer join province_pressure pp on pp.province = pd.province
        full outer join province_voice pv on pv.province = coalesce(pd.province, pp.province)
        order by province asc
      `
    ),
    query(
      `
        with municipality_docs as (
          select l.province, l.municipality, count(distinct d.id)::int as document_count
          from documents d
          join locations l on l.id = d.location_id
          where d.status = 'active'
            and l.province is not null
            and l.municipality is not null
          group by l.province, l.municipality
        ),
        municipality_pressure as (
          select province, municipality, coalesce(sum(pressure_case_count), 0)::int as pressure_case_count
          from fact_service_pressure_daily
          where province is not null
            and municipality is not null
          group by province, municipality
        ),
        municipality_voice as (
          select province, municipality, coalesce(sum(mention_count), 0)::int as citizen_voice_count
          from fact_citizen_voice_daily
          where province is not null
            and municipality is not null
          group by province, municipality
        )
        select
          coalesce(md.province, mp.province, mv.province) as province,
          coalesce(md.municipality, mp.municipality, mv.municipality) as municipality,
          coalesce(md.document_count, 0)::int as "documentCount",
          coalesce(mp.pressure_case_count, 0)::int as "pressureCaseCount",
          coalesce(mv.citizen_voice_count, 0)::int as "citizenVoiceCount"
        from municipality_docs md
        full outer join municipality_pressure mp
          on mp.province = md.province and mp.municipality = md.municipality
        full outer join municipality_voice mv
          on mv.province = coalesce(md.province, mp.province)
         and mv.municipality = coalesce(md.municipality, mp.municipality)
        order by province asc, municipality asc
      `
    ),
    query(
      `
        with base as (
          select province, municipality, ward
          from locations
          where province is not null
            and municipality is not null
            and ward is not null
            and btrim(ward) <> ''
        ),
        evidence as (
          select
            l.province,
            l.municipality,
            l.ward,
            count(distinct d.id)::int as document_count,
            count(distinct si.id)::int as pressure_count,
            count(distinct sm.id)::int as sentiment_count
          from locations l
          left join documents d
            on d.location_id = l.id
           and d.status = 'active'
          left join service_incidents si
            on si.location_id = l.id
          left join sentiment_mentions sm
            on sm.location_id = l.id
          where l.province is not null
            and l.municipality is not null
            and l.ward is not null
            and btrim(l.ward) <> ''
          group by l.province, l.municipality, l.ward
        )
        select
          base.province,
          base.municipality,
          count(*)::int as "knownWardCount",
          count(*) filter (
            where coalesce(evidence.document_count, 0) + coalesce(evidence.pressure_count, 0) + coalesce(evidence.sentiment_count, 0) > 0
          )::int as "evidenceBackedWardCount"
        from base
        left join evidence
          on evidence.province = base.province
         and evidence.municipality = base.municipality
         and evidence.ward = base.ward
        group by base.province, base.municipality
        order by base.province asc, base.municipality asc
      `
    ),
    query(
      `
        select
          'provincial' as level,
          province,
          null::text as municipality,
          count(distinct leader_name)::int as "leaderCount",
          coalesce(sum(mention_count), 0)::int as "mentionCount"
        from fact_leadership_sentiment_daily
        group by province
        union all
        select
          'municipal' as level,
          province,
          municipality,
          count(distinct leader_name)::int as "leaderCount",
          coalesce(sum(mention_count), 0)::int as "mentionCount"
        from fact_municipal_leadership_sentiment_daily
        group by province, municipality
        order by level asc, province asc, municipality asc nulls first
      `
    ),
    query(
      `
        select
          province,
          municipality,
          count(*)::int as "projectCount",
          count(*) filter (where latest_budget_year is not null)::int as "projectsWithBudgetYear",
          count(*) filter (where normalized_sector is not null and normalized_sector <> 'Other')::int as "projectsWithNormalizedSector"
        from infrastructure_projects
        group by province, municipality
        order by province asc, municipality asc nulls first
      `
    ),
  ]);

  const totals = totalsResult.rows[0] ?? {};
  const provinceCoverage = provinceCoverageResult.rows.map((row) => ({
    province: row.province,
    documentCount: toNumber(row.documentCount),
    pressureCaseCount: toNumber(row.pressureCaseCount),
    citizenVoiceCount: toNumber(row.citizenVoiceCount),
  }));
  const municipalityCoverage = municipalityCoverageResult.rows.map((row) => ({
    province: row.province,
    municipality: row.municipality,
    documentCount: toNumber(row.documentCount),
    pressureCaseCount: toNumber(row.pressureCaseCount),
    citizenVoiceCount: toNumber(row.citizenVoiceCount),
  }));
  const wardCoverage = wardCoverageResult.rows.map((row) => ({
    province: row.province,
    municipality: row.municipality,
    knownWardCount: toNumber(row.knownWardCount),
    evidenceBackedWardCount: toNumber(row.evidenceBackedWardCount),
  }));
  const leadershipCoverage = leadershipCoverageResult.rows.map((row) => ({
    level: row.level,
    province: row.province,
    municipality: row.municipality,
    leaderCount: toNumber(row.leaderCount),
    mentionCount: toNumber(row.mentionCount),
  }));
  const projectCoverage = projectCoverageResult.rows.map((row) => ({
    province: row.province,
    municipality: row.municipality,
    projectCount: toNumber(row.projectCount),
    projectsWithBudgetYear: toNumber(row.projectsWithBudgetYear),
    projectsWithNormalizedSector: toNumber(row.projectsWithNormalizedSector),
  }));

  const audit = {
    generatedAt: new Date().toISOString(),
    totals,
    provinceCoverage,
    municipalityCoverage,
    wardCoverage,
    leadershipCoverage,
    projectCoverage,
  };

  const outputPath = path.join(outputDir, "platform-coverage-audit.json");
  fs.writeFileSync(outputPath, JSON.stringify(audit, null, 2));

  console.log(
    JSON.stringify(
      {
        outputPath,
        provinceRows: provinceCoverage.length,
        municipalityRows: municipalityCoverage.length,
        wardCoverageRows: wardCoverage.length,
        leadershipRows: leadershipCoverage.length,
        projectRows: projectCoverage.length,
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
