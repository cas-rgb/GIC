import { query } from "@/lib/db";
import { ProvinceAlignmentMatrixResponse } from "@/lib/analytics/types";
import { normalizeInfrastructureServiceFilter } from "@/lib/analytics/issue-taxonomy";

interface ConcernRow {
  serviceDomain: string;
  concernVolume: number;
}

interface OfficialRow {
  serviceDomain: string;
  officialAttentionCount: number;
}

export async function getProvinceAlignmentMatrix(
  province: string,
  days = 30,
  serviceDomain?: string | null
): Promise<ProvinceAlignmentMatrixResponse> {
  const normalizedServiceDomain = normalizeInfrastructureServiceFilter(serviceDomain);
  const [concernResult, officialResult] = await Promise.all([
    query<ConcernRow>(
      `
        select
          service_domain as "serviceDomain",
          coalesce(sum(pressure_case_count), 0)::int as "concernVolume"
        from fact_service_pressure_daily
        where province = $1
          and day >= current_date - ($2::int - 1)
          and ($3::text is null or service_domain = $3)
        group by service_domain
      `,
      [province, days, normalizedServiceDomain]
    ),
    query<OfficialRow>(
      `
        select
          si.service_domain as "serviceDomain",
          count(distinct d.id)::int as "officialAttentionCount"
        from service_incidents si
        join signals s on s.id = si.signal_id
        join documents d on d.id = s.document_id
        join sources src on src.id = d.source_id
        left join locations l on l.id = coalesce(si.location_id, s.location_id, d.location_id)
        where l.province = $1
          and coalesce(date(d.published_at), date(d.created_at)) >= current_date - ($2::int - 1)
          and src.source_type in ('gov', 'treasury', 'utility', 'stats')
          and ($3::text is null or si.service_domain = $3)
        group by si.service_domain
      `,
      [province, days, normalizedServiceDomain]
    ),
  ]);

  const concernMap = new Map(
    concernResult.rows.map((row) => [row.serviceDomain, row.concernVolume])
  );
  const officialMap = new Map(
    officialResult.rows.map((row) => [row.serviceDomain, row.officialAttentionCount])
  );
  const domains = Array.from(
    new Set([...concernMap.keys(), ...officialMap.keys()].filter(Boolean))
  );
  const totalConcern = Math.max(
    Array.from(concernMap.values()).reduce((sum, value) => sum + value, 0),
    1
  );
  const totalOfficial = Math.max(
    Array.from(officialMap.values()).reduce((sum, value) => sum + value, 0),
    1
  );

  const rows = domains
    .map((serviceDomain) => {
      const concernVolume = concernMap.get(serviceDomain) ?? 0;
      const officialAttentionCount = officialMap.get(serviceDomain) ?? 0;
      const concernShare = Number(((concernVolume / totalConcern) * 100).toFixed(1));
      const officialAttentionShare = Number(
        ((officialAttentionCount / totalOfficial) * 100).toFixed(1)
      );
      const alignmentGap = Number((officialAttentionShare - concernShare).toFixed(1));

      return {
        serviceDomain,
        concernVolume,
        concernShare,
        officialAttentionCount,
        officialAttentionShare,
        alignmentGap,
      };
    })
    .sort((left, right) => right.concernVolume - left.concernVolume);

  const strongestAligned = [...rows]
    .filter((row) => row.concernVolume > 0 || row.officialAttentionCount > 0)
    .sort((left, right) => Math.abs(left.alignmentGap) - Math.abs(right.alignmentGap))[0];
  const weakestAligned = [...rows]
    .filter((row) => row.concernVolume > 0 || row.officialAttentionCount > 0)
    .sort((left, right) => Math.abs(right.alignmentGap) - Math.abs(left.alignmentGap))[0];
  const avgAlignmentGap =
    rows.length > 0
      ? Number(
          (
            rows.reduce((sum, row) => sum + Math.abs(row.alignmentGap), 0) / rows.length
          ).toFixed(1)
        )
      : 0;

  return {
    province,
    days,
    serviceDomain: normalizedServiceDomain,
    rows,
    summary: {
      strongestAlignedIssue: strongestAligned?.serviceDomain ?? null,
      weakestAlignedIssue: weakestAligned?.serviceDomain ?? null,
      avgAlignmentGap,
    },
    trace: {
      table: "fact_service_pressure_daily,service_incidents,signals,documents,sources,locations",
      query: `province=${province};days=${days};serviceDomain=${normalizedServiceDomain ?? "all"}`,
    },
  };
}
