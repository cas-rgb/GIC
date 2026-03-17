import { query } from "@/lib/db";

export interface SourceReliabilityRow {
  sourceType: string;
  sourceCount: number;
  documentCount: number;
  avgReliabilityScore: number;
}

export interface SourceReliabilityResponse {
  province: string;
  rows: SourceReliabilityRow[];
  trace: {
    table: string;
    query?: string;
  };
}

interface SourceReliabilitySqlRow {
  sourceType: string;
  sourceCount: number;
  documentCount: number;
  avgReliabilityScore: string | number;
}

export async function getSourceReliability(
  province: string
): Promise<SourceReliabilityResponse> {
  const result = await query<SourceReliabilitySqlRow>(
    `
      select
        source_type as "sourceType",
        sum(source_count)::int as "sourceCount",
        sum(document_count)::int as "documentCount",
        round(avg(avg_reliability_score)::numeric, 3) as "avgReliabilityScore"
      from fact_source_reliability_daily
      where province = $1
      group by source_type
      order by "documentCount" desc
    `,
    [province]
  );

  return {
    province,
    rows: result.rows.map((row) => ({
      ...row,
      avgReliabilityScore:
        typeof row.avgReliabilityScore === "string"
          ? Number(row.avgReliabilityScore)
          : row.avgReliabilityScore,
    })),
    trace: {
      table: "fact_source_reliability_daily",
      query: `province=${province}`,
    },
  };
}
