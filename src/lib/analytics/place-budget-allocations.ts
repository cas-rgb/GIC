import { query } from "@/lib/db";
import { BudgetAllocationResponse } from "@/lib/analytics/types";

interface BudgetRow {
  geography_level: "province" | "municipality" | "ward";
  province_name: string;
  municipality_name: string | null;
  ward_name: string | null;
  issue_family: string | null;
  service_domain: string | null;
  period_year: number | null;
  budget_amount: number | null;
  project_name: string | null;
  project_status: string | null;
  summary_text: string;
  source_name: string;
  source_url: string | null;
  verification_tier: string;
}

export async function getPlaceBudgetAllocations(input: {
  province: string;
  municipality?: string | null;
  ward?: string | null;
}): Promise<BudgetAllocationResponse> {
  const { province, municipality = null, ward = null } = input;

  let geographyLevel: "province" | "municipality" | "ward" = "province";
  const params: Array<string | null> = [province];
  let filterSql = "where province_name = $1 and geography_level = 'province'";

  if (municipality) {
    geographyLevel = "municipality";
    params.push(municipality);
    filterSql =
      "where province_name = $1 and municipality_name = $2 and geography_level in ('municipality','ward')";
  }

  if (municipality && ward) {
    geographyLevel = "ward";
    params.push(ward);
    filterSql =
      "where province_name = $1 and municipality_name = $2 and ward_name = $3 and geography_level = 'ward'";
  }

  const result = await query<BudgetRow>(
    `
      select
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
        verification_tier
      from budget_allocations
      ${filterSql}
      order by period_year desc nulls last, retrieved_at desc nulls last
      limit 25
    `,
    params,
  );

  return {
    geographyLevel,
    province,
    municipality,
    ward,
    rows: result.rows.map((row) => ({
      geographyLevel: row.geography_level,
      province: row.province_name,
      municipality: row.municipality_name,
      ward: row.ward_name,
      issueFamily: row.issue_family,
      serviceDomain: row.service_domain,
      periodYear: row.period_year,
      budgetAmount: row.budget_amount,
      projectName: row.project_name,
      projectStatus: row.project_status,
      summaryText: row.summary_text,
      sourceName: row.source_name,
      sourceUrl: row.source_url,
      verificationTier: row.verification_tier,
    })),
    trace: {
      table: "budget_allocations",
      query: `province=${province};municipality=${municipality ?? ""};ward=${ward ?? ""}`,
    },
  };
}
