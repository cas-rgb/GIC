import { query } from "@/lib/db";
import { WardCouncillorResponse } from "@/lib/analytics/types";

interface WardCouncillorRow {
  ward_number: number | null;
  ward_name: string;
  councillor_name: string;
  party_name: string | null;
  office_title: string | null;
  term_start: string | null;
  term_end: string | null;
  verification_tier: string | null;
  confidence_score: number | null;
  source_name: string | null;
  source_url: string | null;
  retrieved_at: string | null;
}

export async function getWardCouncillor(input: {
  province: string;
  municipality: string;
  ward: string;
}): Promise<WardCouncillorResponse> {
  const { province, municipality, ward } = input;
  const result = await query<WardCouncillorRow>(
    `
      select
        ward_number,
        ward_name,
        councillor_name,
        party_name,
        office_title,
        term_start::text,
        term_end::text,
        verification_tier,
        confidence_score,
        source_name,
        source_url,
        retrieved_at::text
      from ward_councillors
      where province_name = $1
        and municipality_name = $2
        and ward_name = $3
      order by confidence_score desc nulls last, retrieved_at desc nulls last
      limit 1
    `,
    [province, municipality, ward]
  );

  const row = result.rows[0];
  return {
    province,
    municipality,
    ward,
    wardNumber: row?.ward_number ?? null,
    wardLabel: row?.ward_name ?? ward,
    councillorName: row?.councillor_name ?? null,
    partyName: row?.party_name ?? null,
    officeTitle: row?.office_title ?? null,
    termStart: row?.term_start ?? null,
    termEnd: row?.term_end ?? null,
    verificationTier: row?.verification_tier ?? null,
    confidenceScore: row?.confidence_score ?? null,
    sourceName: row?.source_name ?? null,
    sourceUrl: row?.source_url ?? null,
    retrievedAt: row?.retrieved_at ?? null,
    trace: {
      table: "ward_councillors",
      query: `province=${province};municipality=${municipality};ward=${ward}`,
    },
  };
}
