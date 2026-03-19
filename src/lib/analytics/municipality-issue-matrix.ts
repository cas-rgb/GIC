import { query } from "@/lib/db";
import { MunicipalityIssueMatrixResponse } from "@/lib/analytics/types";
import { normalizeInfrastructureServiceFilter } from "@/lib/analytics/issue-taxonomy";

interface MunicipalityIssueMatrixSqlRow {
  serviceDomain: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
}

export async function getMunicipalityIssueMatrix(
  province: string,
  municipality: string,
  days = 30,
  serviceDomain?: string | null,
): Promise<MunicipalityIssueMatrixResponse> {
  const normalizedServiceDomain =
    normalizeInfrastructureServiceFilter(serviceDomain);
  const result = await query<MunicipalityIssueMatrixSqlRow>(
    `
      select
        service_domain as "serviceDomain",
        coalesce(sum(pressure_case_count), 0)::int as "pressureCaseCount",
        coalesce(sum(high_severity_count), 0)::int as "highSeverityCount",
        coalesce(sum(protest_count), 0)::int as "protestCount",
        coalesce(sum(response_count), 0)::int as "responseCount"
      from fact_service_pressure_daily
      where province = $1
        and municipality = $2
        and service_domain is not null
        and day >= current_date - ($3::int - 1)
        and ($4::text is null or service_domain = $4)
      group by service_domain
      order by sum(pressure_case_count) desc, service_domain asc
    `,
    [province, municipality, days, normalizedServiceDomain],
  );

  return {
    province,
    municipality,
    days,
    serviceDomain: normalizedServiceDomain,
    rows: result.rows,
    trace: {
      table: "fact_service_pressure_daily",
      query: `province=${province};municipality=${municipality};days=${days};serviceDomain=${normalizedServiceDomain ?? "all"}`,
    },
  };
}
