import { query } from "@/lib/db";
import { ProvinceIssueHeatmapResponse } from "@/lib/analytics/types";
import { normalizeInfrastructureServiceFilter } from "@/lib/analytics/issue-taxonomy";

interface ProvinceIssueHeatmapRow {
  municipality: string;
  serviceDomain: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
}

export async function getProvinceIssueHeatmap(
  province: string,
  days = 30,
  serviceDomain?: string | null,
): Promise<ProvinceIssueHeatmapResponse> {
  const normalizedServiceDomain =
    normalizeInfrastructureServiceFilter(serviceDomain);
  const result = await query<ProvinceIssueHeatmapRow>(
    `
      select
        municipality,
        service_domain as "serviceDomain",
        coalesce(sum(pressure_case_count), 0)::int as "pressureCaseCount",
        coalesce(sum(high_severity_count), 0)::int as "highSeverityCount",
        coalesce(sum(protest_count), 0)::int as "protestCount",
        coalesce(sum(response_count), 0)::int as "responseCount"
      from fact_service_pressure_daily
      where province = $1
        and municipality is not null
        and service_domain is not null
        and day >= current_date - ($2::int - 1)
        and ($3::text is null or service_domain = $3)
      group by municipality, service_domain
      order by sum(pressure_case_count) desc, municipality asc, service_domain asc
    `,
    [province, days, normalizedServiceDomain],
  );

  const cells = result.rows;
  const municipalities = Array.from(
    new Set(cells.map((row) => row.municipality)),
  );
  const serviceDomains = Array.from(
    new Set(cells.map((row) => row.serviceDomain)),
  );

  return {
    province,
    days,
    serviceDomain: normalizedServiceDomain,
    municipalities,
    serviceDomains,
    cells,
    trace: {
      table: "fact_service_pressure_daily",
      query: `province=${province};days=${days};serviceDomain=${normalizedServiceDomain ?? "all"}`,
    },
  };
}
