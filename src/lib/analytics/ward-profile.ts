import { query } from "@/lib/db";
import { WardProfileResponse } from "@/lib/analytics/types";

interface WardReferenceRow {
  ward_number: number | null;
  ward_name: string;
  district_name: string | null;
  source_name: string | null;
  source_url: string | null;
  has_councillor: boolean;
  has_election_history: boolean;
  has_infrastructure_history: boolean;
  has_budget_allocations: boolean;
}

export async function getWardProfile(input: {
  province: string;
  municipality: string;
  ward: string;
}): Promise<WardProfileResponse> {
  const { province, municipality, ward } = input;

  const result = await query<WardReferenceRow>(
    `
      select
        wr.ward_number,
        wr.ward_name,
        wr.district_name,
        wr.source_name,
        wr.source_url,
        exists(
          select 1
          from ward_councillors wc
          where wc.province_name = wr.province_name
            and wc.municipality_name = wr.municipality_name
            and wc.ward_name = wr.ward_name
        ) as has_councillor,
        exists(
          select 1
          from ward_election_results wer
          where wer.province_name = wr.province_name
            and wer.municipality_name = wr.municipality_name
            and wer.ward_name = wr.ward_name
        ) as has_election_history,
        exists(
          select 1
          from ward_infrastructure_history wih
          where wih.province_name = wr.province_name
            and wih.municipality_name = wr.municipality_name
            and wih.ward_name = wr.ward_name
        ) as has_infrastructure_history,
        exists(
          select 1
          from budget_allocations ba
          where ba.province_name = wr.province_name
            and ba.municipality_name = wr.municipality_name
            and ba.ward_name = wr.ward_name
            and ba.geography_level = 'ward'
        ) as has_budget_allocations
      from ward_reference wr
      where wr.province_name = $1
        and wr.municipality_name = $2
        and wr.ward_name = $3
      limit 1
    `,
    [province, municipality, ward],
  );

  const row = result.rows[0];

  return {
    province,
    municipality,
    ward,
    wardNumber: row?.ward_number ?? null,
    wardLabel: row?.ward_name ?? ward,
    districtName: row?.district_name ?? null,
    sourceName: row?.source_name ?? null,
    sourceUrl: row?.source_url ?? null,
    summary: {
      hasCouncillor: row?.has_councillor ?? true,
      hasElectionHistory: row?.has_election_history ?? true,
      hasInfrastructureHistory: row?.has_infrastructure_history ?? true,
      hasBudgetAllocations: row?.has_budget_allocations ?? true,
    },
    trace: {
      table: "ward_reference",
      query: `province=${province};municipality=${municipality};ward=${ward}`,
    },
  };
}
