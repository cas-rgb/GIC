import { query } from "@/lib/db";
import {
  InvestorOpportunitiesResponse,
  InvestorOpportunityRow,
} from "@/lib/analytics/types";

interface OpportunitySummaryRow {
  opportunityCount: number;
  totalKnownExpenditure: string | number;
  highValueOpportunityCount: number;
  averageInvestmentScore: string | number | null;
}

interface OpportunityRowDb {
  projectId: string;
  projectName: string;
  province: string;
  municipality: string | null;
  normalizedSector: string;
  normalizedProjectStage: string;
  latestBudgetYear: string | null;
  latestBudgetPhase: string | null;
  latestAmount: string | number | null;
  totalKnownExpenditure: string | number;
  investmentScore: string | number;
  dataQualityFlag: string;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" ? Number(value) : value;
}

function mapOpportunityRow(row: OpportunityRowDb): InvestorOpportunityRow {
  return {
    ...row,
    latestAmount: toNumber(row.latestAmount),
    totalKnownExpenditure: toNumber(row.totalKnownExpenditure) ?? 0,
    investmentScore: toNumber(row.investmentScore) ?? 0,
  };
}

export async function getInvestorOpportunities(
  province?: string | null,
  municipality?: string | null,
  limit = 12
): Promise<InvestorOpportunitiesResponse> {
  const latestSnapshotResult = await query<{ snapshotDate: string | null }>(
    `
      select max(day)::text as "snapshotDate"
      from fact_infrastructure_projects_daily
    `
  );

  const snapshotDate = latestSnapshotResult.rows[0]?.snapshotDate ?? null;

  const summaryResult = await query<OpportunitySummaryRow>(
    `
      with scored as (
        select
          id,
          normalized_sector,
          greatest(coalesce(latest_amount, 0), coalesce(total_known_expenditure, 0), 0) as opportunity_value,
          (
            case
              when greatest(coalesce(latest_amount, 0), coalesce(total_known_expenditure, 0), 0) >= 50000000 then 40
              when greatest(coalesce(latest_amount, 0), coalesce(total_known_expenditure, 0), 0) >= 10000000 then 28
              when greatest(coalesce(latest_amount, 0), coalesce(total_known_expenditure, 0), 0) > 0 then 12
              else 0
            end
            + case
                when normalized_project_stage in ('New Build', 'Upgrade') then 15
                when normalized_project_stage = 'Renewal' then 10
                else 0
              end
            + case
                when normalized_sector in ('Water and Sanitation', 'Roads and Transport', 'Electricity and Energy') then 12
                when normalized_sector in ('Community Infrastructure', 'Housing and Settlements') then 8
                else 4
              end
            + case
                when municipality is not null then 8
                else 3
              end
            + case
                when coalesce(data_quality_flag, 'LOW') = 'OK' then 10
                when coalesce(data_quality_flag, 'LOW') = 'MEDIUM' then 3
                else -20
              end
          ) as investment_score
        from infrastructure_projects
        where parser_version = 'municipal-money-v3'
          and status = 'active'
          and province is not null
          and coalesce(data_quality_flag, 'LOW') <> 'LOW'
          and ($1::text is null or province = $1)
          and ($2::text is null or municipality = $2)
      )
      select
        count(*)::int as "opportunityCount",
        coalesce(round(sum(opportunity_value)::numeric, 2), 0) as "totalKnownExpenditure",
        count(*) filter (where opportunity_value >= 10000000)::int as "highValueOpportunityCount",
        round(avg(investment_score)::numeric, 2) as "averageInvestmentScore"
      from scored
    `,
    [province ?? null, municipality ?? null]
  );

  const rowsResult = await query<OpportunityRowDb>(
    `
      with scored as (
        select
          id::text as "projectId",
          project_name as "projectName",
          province,
          municipality,
          coalesce(normalized_sector, 'Other') as "normalizedSector",
          coalesce(normalized_project_stage, 'Unspecified') as "normalizedProjectStage",
          latest_budget_year as "latestBudgetYear",
          latest_budget_phase as "latestBudgetPhase",
          latest_amount as "latestAmount",
          greatest(coalesce(total_known_expenditure, 0), 0) as "totalKnownExpenditure",
          (
            case
              when greatest(coalesce(latest_amount, 0), coalesce(total_known_expenditure, 0), 0) >= 50000000 then 40
              when greatest(coalesce(latest_amount, 0), coalesce(total_known_expenditure, 0), 0) >= 10000000 then 28
              when greatest(coalesce(latest_amount, 0), coalesce(total_known_expenditure, 0), 0) > 0 then 12
              else 0
            end
            + case
                when normalized_project_stage in ('New Build', 'Upgrade') then 15
                when normalized_project_stage = 'Renewal' then 10
                else 0
              end
            + case
                when normalized_sector in ('Water and Sanitation', 'Roads and Transport', 'Electricity and Energy') then 12
                when normalized_sector in ('Community Infrastructure', 'Housing and Settlements') then 8
                else 4
              end
            + case
                when municipality is not null then 8
                else 3
              end
            + case
                when coalesce(data_quality_flag, 'LOW') = 'OK' then 10
                when coalesce(data_quality_flag, 'LOW') = 'MEDIUM' then 3
                else -20
              end
          ) as "investmentScore",
          coalesce(data_quality_flag, 'LOW') as "dataQualityFlag"
        from infrastructure_projects
        where parser_version = 'municipal-money-v3'
          and status = 'active'
          and province is not null
          and coalesce(data_quality_flag, 'LOW') <> 'LOW'
          and ($1::text is null or province = $1)
          and ($2::text is null or municipality = $2)
      )
      select *
      from scored
      order by "investmentScore" desc, "totalKnownExpenditure" desc, "projectName" asc
      limit $3
    `,
    [province ?? null, municipality ?? null, limit]
  );

  const topSectorResult = await query<{ normalizedSector: string | null }>(
    `
      select normalized_sector as "normalizedSector"
      from fact_infrastructure_projects_daily
      where day = $1::date
        and ($2::text is null or province = $2)
        and ($3::text is null or municipality = $3)
      order by project_count desc, normalized_sector asc
      limit 1
    `,
    [snapshotDate, province ?? null, municipality ?? null]
  );

  const summary = summaryResult.rows[0] ?? {
    opportunityCount: 0,
    totalKnownExpenditure: 0,
    highValueOpportunityCount: 0,
    averageInvestmentScore: null,
  };

  return {
    snapshotDate,
    province: province ?? null,
    summary: {
      opportunityCount: summary.opportunityCount,
      totalKnownExpenditure: toNumber(summary.totalKnownExpenditure) ?? 0,
      highValueOpportunityCount: summary.highValueOpportunityCount,
      averageInvestmentScore: toNumber(summary.averageInvestmentScore),
      topSector: topSectorResult.rows[0]?.normalizedSector ?? null,
    },
    rows: rowsResult.rows.map(mapOpportunityRow),
    caveats: [
      "Opportunity scoring is deterministic and currently uses Treasury project value, sector, stage, geography specificity, and data quality.",
      "The underlying Treasury project catalog is still a balanced snapshot, not a complete nationwide export.",
    ],
    trace: {
      tables: ["infrastructure_projects", "fact_infrastructure_projects_daily"],
      query: `province=${province ?? "all"};municipality=${municipality ?? "all"};limit=${limit}`,
    },
  };
}
