import { InvestorOpportunityDetailResponse } from "@/lib/analytics/types";
import { query } from "@/lib/db";

interface DetailRow {
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
  sourceUrl: string | null;
}

interface FundingRow {
  financialYear: string | null;
  budgetPhase: string | null;
  amount: string | number;
}

interface UpdateRow {
  updateType: string;
  updateSummary: string;
  effectiveDate: string | null;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" ? Number(value) : value;
}

export async function getInvestorOpportunityDetail(
  projectId: string,
): Promise<InvestorOpportunityDetailResponse> {
  const detailResult = await query<DetailRow>(
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
          coalesce(data_quality_flag, 'LOW') as "dataQualityFlag",
          source_url as "sourceUrl"
        from infrastructure_projects
        where id::text = $1
      )
      select *
      from scored
      limit 1
    `,
    [projectId],
  );

  if (!detailResult.rows[0]) {
    throw new Error(`Investor opportunity not found: ${projectId}`);
  }

  const fundingResult = await query<FundingRow>(
    `
      select
        financial_year as "financialYear",
        budget_phase as "budgetPhase",
        amount
      from project_funding_sources
      where infrastructure_project_id = $1::uuid
      order by financial_year desc nulls last, budget_phase asc nulls last
    `,
    [projectId],
  );

  const updatesResult = await query<UpdateRow>(
    `
      select
        update_type as "updateType",
        update_summary as "updateSummary",
        effective_date::text as "effectiveDate"
      from project_updates
      where infrastructure_project_id = $1::uuid
      order by effective_date desc nulls last, created_at desc
      limit 8
    `,
    [projectId],
  );

  const row = detailResult.rows[0];

  return {
    projectId,
    summary: {
      projectName: row.projectName,
      province: row.province,
      municipality: row.municipality,
      normalizedSector: row.normalizedSector,
      normalizedProjectStage: row.normalizedProjectStage,
      latestBudgetYear: row.latestBudgetYear,
      latestBudgetPhase: row.latestBudgetPhase,
      latestAmount: toNumber(row.latestAmount),
      totalKnownExpenditure: toNumber(row.totalKnownExpenditure) ?? 0,
      investmentScore: toNumber(row.investmentScore) ?? 0,
      dataQualityFlag: row.dataQualityFlag,
      sourceUrl: row.sourceUrl,
    },
    fundingRows: fundingResult.rows.map((funding) => ({
      financialYear: funding.financialYear,
      budgetPhase: funding.budgetPhase,
      amount: toNumber(funding.amount) ?? 0,
    })),
    updateRows: updatesResult.rows,
    caveats: [
      "Project detail currently reflects the governed Municipal Money project snapshot, not a full longitudinal project monitoring feed.",
      "Funding rows and updates are derived from the normalized Treasury ingestion path already present in the platform.",
    ],
    trace: {
      tables: [
        "infrastructure_projects",
        "project_funding_sources",
        "project_updates",
      ],
      query: `projectId=${projectId}`,
    },
  };
}
