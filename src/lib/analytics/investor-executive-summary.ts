import { query } from "@/lib/db";
import {
  InvestorExecutiveSummaryResponse,
  InvestorProvinceOpportunityRow,
} from "@/lib/analytics/types";

interface SnapshotRow {
  snapshotDate: string | null;
}

interface SummaryRow {
  provinceCount: number;
  opportunityCount: number;
  highValueOpportunityCount: number;
  totalKnownExpenditure: string | number;
  averageInvestmentScore: string | number | null;
}

interface ProvinceRowDb {
  province: string;
  opportunityCount: number;
  highValueOpportunityCount: number;
  totalKnownExpenditure: string | number;
  averageInvestmentScore: string | number | null;
  dominantSector: string | null;
  leadMunicipality: string | null;
  dataQualityOkShare: string | number;
}

interface LeadOpportunityRow {
  projectName: string;
  province: string;
  investmentScore: string | number;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" ? Number(value) : value;
}

function mapProvinceRow(row: ProvinceRowDb): InvestorProvinceOpportunityRow {
  return {
    province: row.province,
    opportunityCount: row.opportunityCount,
    highValueOpportunityCount: row.highValueOpportunityCount,
    totalKnownExpenditure: toNumber(row.totalKnownExpenditure) ?? 0,
    averageInvestmentScore: toNumber(row.averageInvestmentScore),
    dominantSector: row.dominantSector,
    leadMunicipality: row.leadMunicipality,
    dataQualityOkShare: toNumber(row.dataQualityOkShare) ?? 0,
  };
}

const SCORED_PROJECTS_CTE = `
  with scored as (
    select
      ip.id,
      ip.project_name,
      ip.province,
      ip.municipality,
      coalesce(ip.normalized_sector, 'Other') as normalized_sector,
      coalesce(ip.normalized_project_stage, 'Unspecified') as normalized_project_stage,
      greatest(coalesce(ip.latest_amount, 0), coalesce(ip.total_known_expenditure, 0), 0) as opportunity_value,
      (
        case
          when greatest(coalesce(ip.latest_amount, 0), coalesce(ip.total_known_expenditure, 0), 0) >= 50000000 then 40
          when greatest(coalesce(ip.latest_amount, 0), coalesce(ip.total_known_expenditure, 0), 0) >= 10000000 then 28
          when greatest(coalesce(ip.latest_amount, 0), coalesce(ip.total_known_expenditure, 0), 0) > 0 then 12
          else 0
        end
        + case
            when ip.normalized_project_stage in ('New Build', 'Upgrade') then 15
            when ip.normalized_project_stage = 'Renewal' then 10
            else 0
          end
        + case
            when ip.normalized_sector in ('Water and Sanitation', 'Roads and Transport', 'Electricity and Energy') then 12
            when ip.normalized_sector in ('Community Infrastructure', 'Housing and Settlements') then 8
            else 4
          end
        + case
            when ip.municipality is not null then 8
            else 3
          end
        + case
            when coalesce(ip.data_quality_flag, 'LOW') = 'OK' then 10
            when coalesce(ip.data_quality_flag, 'LOW') = 'MEDIUM' then 3
            else -20
          end
      ) as investment_score,
      coalesce(ip.data_quality_flag, 'LOW') as data_quality_flag
    from infrastructure_projects ip
    where ip.parser_version = 'municipal-money-v3'
      and ip.status = 'active'
      and ip.province is not null
      and coalesce(ip.data_quality_flag, 'LOW') <> 'LOW'
      and ($1::text is null or ip.province = $1)
  )
`;

export async function getInvestorExecutiveSummary(
  province?: string | null
): Promise<InvestorExecutiveSummaryResponse> {
  const snapshotResult = await query<SnapshotRow>(`
    select max(day)::text as "snapshotDate"
    from fact_infrastructure_projects_daily
  `);

  const snapshotDate = snapshotResult.rows[0]?.snapshotDate ?? null;

  const [summaryResult, provincesResult, topSectorResult, leadOpportunityResult] =
    await Promise.all([
      query<SummaryRow>(
        `
          ${SCORED_PROJECTS_CTE}
          select
            count(distinct province)::int as "provinceCount",
            count(*)::int as "opportunityCount",
            count(*) filter (where opportunity_value >= 10000000)::int as "highValueOpportunityCount",
            coalesce(round(sum(opportunity_value)::numeric, 2), 0) as "totalKnownExpenditure",
            round(avg(investment_score)::numeric, 2) as "averageInvestmentScore"
          from scored
        `,
        [province ?? null]
      ),
      query<ProvinceRowDb>(
        `
          ${SCORED_PROJECTS_CTE},
          sector_ranked as (
            select
              province,
              normalized_sector,
              count(*)::int as project_count,
              row_number() over (
                partition by province
                order by count(*) desc, normalized_sector asc
              ) as sector_rank
            from scored
            group by province, normalized_sector
          ),
          municipality_ranked as (
            select
              province,
              municipality,
              count(*)::int as project_count,
              row_number() over (
                partition by province
                order by count(*) desc, municipality asc
              ) as municipality_rank
            from scored
            where municipality is not null
            group by province, municipality
          )
          select
            s.province,
            count(*)::int as "opportunityCount",
            count(*) filter (where s.opportunity_value >= 10000000)::int as "highValueOpportunityCount",
            round(sum(s.opportunity_value)::numeric, 2) as "totalKnownExpenditure",
            round(avg(s.investment_score)::numeric, 2) as "averageInvestmentScore",
            max(sr.normalized_sector) filter (where sr.sector_rank = 1) as "dominantSector",
            max(mr.municipality) filter (where mr.municipality_rank = 1) as "leadMunicipality",
            round(avg(case when s.data_quality_flag = 'OK' then 100.0 else 0.0 end)::numeric, 1) as "dataQualityOkShare"
          from scored s
          left join sector_ranked sr on sr.province = s.province
          left join municipality_ranked mr on mr.province = s.province
          group by s.province
          order by "averageInvestmentScore" desc nulls last, "totalKnownExpenditure" desc, s.province asc
        `,
        [province ?? null]
      ),
      snapshotDate
        ? query<{ normalizedSector: string | null }>(
            `
              select normalized_sector as "normalizedSector"
              from fact_infrastructure_projects_daily
              where day = $1::date
                and ($2::text is null or province = $2)
              order by project_count desc, normalized_sector asc
              limit 1
            `,
            [snapshotDate, province ?? null]
          )
        : Promise.resolve({ rows: [] } as { rows: Array<{ normalizedSector: string | null }> }),
      query<LeadOpportunityRow>(
        `
          ${SCORED_PROJECTS_CTE}
          select
            project_name as "projectName",
            province,
            investment_score as "investmentScore"
          from scored
          order by investment_score desc, opportunity_value desc, project_name asc
          limit 1
        `,
        [province ?? null]
      ),
    ]);

  const summary = summaryResult.rows[0] ?? {
    provinceCount: 0,
    opportunityCount: 0,
    highValueOpportunityCount: 0,
    totalKnownExpenditure: 0,
    averageInvestmentScore: null,
  };
  const provinces = provincesResult.rows.map(mapProvinceRow);
  const leadProvince = provinces[0] ?? null;
  const weakestProvince =
    [...provinces].sort(
      (left, right) => left.dataQualityOkShare - right.dataQualityOkShare || left.province.localeCompare(right.province)
    )[0] ?? null;
  const leadOpportunity = leadOpportunityResult.rows[0] ?? null;

  const narratives = [
    leadProvince
      ? `${leadProvince.province} currently leads the directional opportunity view on blended score, with ${leadProvince.opportunityCount} screened projects and ${leadProvince.dominantSector ?? "mixed sector"} concentration.`
      : "No province currently has enough normalized Treasury opportunity data to rank credibly.",
    leadOpportunity
      ? `${leadOpportunity.projectName} is the current top-ranked opportunity, anchored in ${leadOpportunity.province} with a deterministic score of ${toNumber(leadOpportunity.investmentScore) ?? 0}.`
      : "No individual project currently clears the ranking thresholds for executive spotlighting.",
    weakestProvince
      ? `${weakestProvince.province} has the weakest high-confidence project coverage, so funding decisions there should be treated more cautiously until data quality improves.`
      : "No province-level data-quality gap could be calculated yet.",
  ];

  return {
    snapshotDate,
    summary: {
      provinceCount: summary.provinceCount,
      opportunityCount: summary.opportunityCount,
      highValueOpportunityCount: summary.highValueOpportunityCount,
      totalKnownExpenditure: toNumber(summary.totalKnownExpenditure) ?? 0,
      averageInvestmentScore: toNumber(summary.averageInvestmentScore),
      topProvince: leadProvince?.province ?? null,
      topSector: topSectorResult.rows[0]?.normalizedSector ?? null,
      leadOpportunityName: leadOpportunity?.projectName ?? null,
      leadOpportunityProvince: leadOpportunity?.province ?? null,
      leadOpportunityScore: toNumber(leadOpportunity?.investmentScore),
    },
    narratives,
    provinces,
    caveats: [
      "This view is grounded in normalized Municipal Money Treasury projects and deterministic investment scoring, not inferred investor appetite.",
      "Projects with low data quality are excluded from the executive ranking layer to avoid overstating readiness.",
    ],
    trace: {
      tables: ["infrastructure_projects", "fact_infrastructure_projects_daily"],
      query: snapshotDate
        ? `snapshotDate=${snapshotDate};province=${province ?? "all"}`
        : `snapshotDate=unavailable;province=${province ?? "all"}`,
    },
  };
}
