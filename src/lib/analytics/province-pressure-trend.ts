import { query } from "@/lib/db";
import { ProvincePressureTrendResponse } from "@/lib/analytics/types";
import { normalizeInfrastructureServiceFilter } from "@/lib/analytics/issue-taxonomy";

interface ProvincePressureTrendSqlRow {
  date: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
}

export async function getProvincePressureTrend(
  province: string,
  days = 30,
  serviceDomain?: string | null
): Promise<ProvincePressureTrendResponse> {
  const normalizedServiceDomain = normalizeInfrastructureServiceFilter(serviceDomain);
  const result = await query<ProvincePressureTrendSqlRow>(
    `
      select
        day::text as date,
        coalesce(sum(pressure_case_count), 0)::int as "pressureCaseCount",
        coalesce(sum(high_severity_count), 0)::int as "highSeverityCount",
        coalesce(sum(protest_count), 0)::int as "protestCount",
        coalesce(sum(response_count), 0)::int as "responseCount"
      from fact_service_pressure_daily
      where province = $1
        and day >= current_date - ($2::int - 1)
        and ($3::text is null or service_domain = $3)
      group by day
      order by day asc
    `,
    [province, days, normalizedServiceDomain]
  );

  return {
    province,
    days,
    serviceDomain: normalizedServiceDomain,
    series: result.rows,
    trace: {
      table: "fact_service_pressure_daily",
      query: `province=${province};days=${days};serviceDomain=${normalizedServiceDomain ?? "all"};aggregate=daily`,
    },
  };
}
