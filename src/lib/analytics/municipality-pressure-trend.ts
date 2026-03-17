import { query } from "@/lib/db";
import { MunicipalityPressureTrendResponse } from "@/lib/analytics/types";
import { normalizeInfrastructureServiceFilter } from "@/lib/analytics/issue-taxonomy";

interface TrendRow {
  date: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
}

export async function getMunicipalityPressureTrend(
  province: string,
  municipality: string,
  days = 30,
  serviceDomain?: string | null
): Promise<MunicipalityPressureTrendResponse> {
  const normalizedServiceDomain = normalizeInfrastructureServiceFilter(serviceDomain);
  const result = await query<TrendRow>(
    `
      select
        day::text as "date",
        sum(pressure_case_count)::int as "pressureCaseCount",
        sum(high_severity_count)::int as "highSeverityCount",
        sum(protest_count)::int as "protestCount",
        sum(response_count)::int as "responseCount"
      from fact_service_pressure_daily
      where province = $1
        and municipality = $2
        and day >= current_date - ($3::int - 1)
        and ($4::text is null or service_domain = $4)
      group by day
      order by day asc
    `,
    [province, municipality, days, normalizedServiceDomain]
  );

  return {
    province,
    municipality,
    days,
    serviceDomain: normalizedServiceDomain,
    series: result.rows,
    trace: {
      table: "fact_service_pressure_daily",
      query: `province=${province};municipality=${municipality};days=${days};serviceDomain=${normalizedServiceDomain ?? "all"}`,
    },
  };
}
