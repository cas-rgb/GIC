import { query } from "@/lib/db";
import {
  SourceRegistrySummaryResponse,
  SourceRegistrySummaryRow,
  SourceRegistryTypeRow,
} from "@/lib/source-registry/types";

interface TotalsRow {
  sourceCount: number;
  verifiedCount: number;
  officialKpiTruthCount: number;
}

export async function getSourceRegistrySummary(): Promise<SourceRegistrySummaryResponse> {
  const [totalsResult, byProvinceResult, byTypeResult] = await Promise.all([
    query<TotalsRow>(`
      select
        count(*)::int as "sourceCount",
        count(*) filter (where verification_status = 'verified')::int as "verifiedCount",
        count(*) filter (
          where verification_status = 'verified'
            and data_role = 'kpi_truth'
        )::int as "officialKpiTruthCount"
      from source_registry
    `),
    query<SourceRegistrySummaryRow>(`
      select
        province,
        count(*)::int as "sourceCount",
        count(*) filter (where source_type in ('official_gov', 'treasury', 'utility', 'stats'))::int as "officialCount",
        count(*) filter (where data_role = 'kpi_truth')::int as "kpiTruthCount"
      from source_registry
      group by province
      order by
        case when province is null then 1 else 0 end,
        province asc
    `),
    query<SourceRegistryTypeRow>(`
      select
        source_type as "sourceType",
        count(*)::int as "sourceCount"
      from source_registry
      group by source_type
      order by count(*) desc, source_type asc
    `),
  ]);

  return {
    totals: totalsResult.rows[0] ?? {
      sourceCount: 0,
      verifiedCount: 0,
      officialKpiTruthCount: 0,
    },
    byProvince: byProvinceResult.rows,
    byType: byTypeResult.rows,
    trace: {
      table: "source_registry",
    },
  };
}
