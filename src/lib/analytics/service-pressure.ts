import { query } from "@/lib/db";
import { ServicePressureResponse } from "@/lib/analytics/types";
import { normalizeInfrastructureServiceFilter } from "@/lib/analytics/issue-taxonomy";

interface ServicePressureRow {
  date: string;
  serviceDomain: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
  confidence: string | number;
}

interface ServicePressureTotalsRow {
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
}

export async function getServicePressure(
  province: string,
  days = 30,
  serviceDomain?: string | null
): Promise<ServicePressureResponse> {
  const normalizedServiceDomain = normalizeInfrastructureServiceFilter(serviceDomain);
  const seriesResult = await query<ServicePressureRow>(
    `
      select
        day::text as "date",
        service_domain as "serviceDomain",
        pressure_case_count as "pressureCaseCount",
        high_severity_count as "highSeverityCount",
        protest_count as "protestCount",
        response_count as "responseCount",
        avg_classification_confidence as "confidence"
      from fact_service_pressure_daily
      where province = $1
        and day >= current_date - ($2::int - 1)
        and ($3::text is null or service_domain = $3)
      order by day asc, service_domain asc
    `,
    [province, days, normalizedServiceDomain]
  );

  const totalsResult = await query<ServicePressureTotalsRow>(
    `
      select
        coalesce(sum(pressure_case_count), 0)::int as "pressureCaseCount",
        coalesce(sum(high_severity_count), 0)::int as "highSeverityCount",
        coalesce(sum(protest_count), 0)::int as "protestCount",
        coalesce(sum(response_count), 0)::int as "responseCount"
      from fact_service_pressure_daily
      where province = $1
        and day >= current_date - ($2::int - 1)
        and ($3::text is null or service_domain = $3)
    `,
    [province, days, normalizedServiceDomain]
  );

  return {
    province,
    days,
    serviceDomain: normalizedServiceDomain,
    series: seriesResult.rows.map((row) => ({
      ...row,
      confidence:
        typeof row.confidence === "string"
          ? Number(row.confidence)
          : row.confidence,
    })),
    totals: totalsResult.rows[0] ?? {
      pressureCaseCount: 0,
      highSeverityCount: 0,
      protestCount: 0,
      responseCount: 0,
    },
    trace: {
      table: "fact_service_pressure_daily",
      query: `province=${province};days=${days};serviceDomain=${normalizedServiceDomain ?? "all"}`,
    },
  };
}
