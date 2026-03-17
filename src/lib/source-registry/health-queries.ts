import { query } from "@/lib/db";
import {
  SourceHealthProvinceRow,
  SourceHealthSummaryResponse,
  SourceHealthSummaryRow,
} from "@/lib/source-registry/types";

interface SourceHealthSqlRow extends SourceHealthSummaryRow {}

function summarize(rows: SourceHealthSummaryRow[]) {
  const latestSuccessAt = rows
    .map((row) => row.lastIngestedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .reverse()[0] ?? null;

  return {
    activeSourceCount: rows.length,
    healthyCount: rows.filter((row) => row.healthStatus === "healthy").length,
    staleCount: rows.filter((row) => row.healthStatus === "stale").length,
    failingCount: rows.filter((row) => row.healthStatus === "failing").length,
    neverRunCount: rows.filter((row) => row.healthStatus === "never_run").length,
    refreshedLast24hCount: rows.filter(
      (row) => row.hoursSinceSuccess !== null && row.hoursSinceSuccess <= 24
    ).length,
    latestSuccessAt,
  };
}

export async function getSourceHealthSummary(
  province?: string | null
): Promise<SourceHealthSummaryResponse> {
  const sourceResult = await query<SourceHealthSqlRow>(
    `
      with source_base as (
        select
          s.id as "sourceId",
          s.name as "sourceName",
          s.source_type as "sourceType",
          coalesce(sr.province, doc_geo.province) as province,
          s.last_attempted_at as "lastAttemptedAt",
          coalesce(s.last_ingested_at, doc_geo.last_document_at) as "lastIngestedAt",
          s.last_error as "lastError",
          case
            when s.last_error is not null
              and (s.last_ingested_at is null or s.last_attempted_at > s.last_ingested_at)
              then 'failing'
            when coalesce(s.last_ingested_at, doc_geo.last_document_at) is null
              then 'never_run'
            when coalesce(s.last_ingested_at, doc_geo.last_document_at) < now() - interval '72 hours'
              then 'stale'
            else 'healthy'
          end as "healthStatus",
          case
            when coalesce(s.last_ingested_at, doc_geo.last_document_at) is null
              then null
            else round(extract(epoch from (now() - coalesce(s.last_ingested_at, doc_geo.last_document_at))) / 3600.0)
          end::int as "hoursSinceSuccess"
        from sources s
        left join source_registry sr
          on sr.id = s.external_registry_id
        left join (
          select
            d.source_id,
            max(d.fetched_at) as last_document_at,
            max(l.province) filter (where l.province is not null) as province
          from documents d
          left join locations l on l.id = d.location_id
          group by d.source_id
        ) doc_geo
          on doc_geo.source_id = s.id
        where s.active = true
          and ($1::text is null or coalesce(sr.province, doc_geo.province) = $1)
      )
      select *
      from source_base
      order by
        case "healthStatus"
          when 'failing' then 0
          when 'stale' then 1
          when 'never_run' then 2
          else 3
        end,
        "sourceName" asc
    `,
    [province ?? null]
  );

  const bySource = sourceResult.rows.map((row) => ({
    ...row,
    hoursSinceSuccess:
      row.hoursSinceSuccess === null ? null : Number(row.hoursSinceSuccess),
  }));

  const provinceMap = new Map<string, SourceHealthSummaryRow[]>();

  for (const row of bySource) {
    const key = row.province ?? "__national__";
    const current = provinceMap.get(key) ?? [];
    current.push(row);
    provinceMap.set(key, current);
  }

  const byProvince: SourceHealthProvinceRow[] = Array.from(provinceMap.entries())
    .map(([key, rows]) => ({
      province: key === "__national__" ? null : key,
      ...summarize(rows),
    }))
    .sort((left, right) => {
      if (left.province === null) {
        return 1;
      }

      if (right.province === null) {
        return -1;
      }

      return left.province.localeCompare(right.province);
    });

  return {
    province: province ?? null,
    totals: summarize(bySource),
    byProvince,
    bySource,
    trace: {
      table: "sources",
      query: province ? `province=${province}` : "province=all",
    },
  };
}
