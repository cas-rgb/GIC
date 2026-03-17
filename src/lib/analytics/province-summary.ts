import { query } from "@/lib/db";
import { ProvinceSummaryResponse } from "@/lib/analytics/types";
import { normalizeInfrastructureServiceFilter } from "@/lib/analytics/issue-taxonomy";

interface ProvinceSummarySqlRow {
  pressureScore: string | number;
  escalationScore: string | number;
  evidenceConfidenceScore: string | number;
  officialEvidenceShare: string | number;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
}

interface TopDomainRow {
  topPressureDomain: string | null;
}

interface TopMunicipalityRow {
  highestExposureMunicipality: string | null;
}

export async function getProvinceSummary(
  province: string,
  days = 30,
  serviceDomain?: string | null
): Promise<ProvinceSummaryResponse> {
  const normalizedServiceDomain = normalizeInfrastructureServiceFilter(serviceDomain);
  const [summaryResult, topDomainResult, topMunicipalityResult] = await Promise.all([
    query<ProvinceSummarySqlRow>(
      `
        with pressure_window as (
          select *
          from fact_service_pressure_daily
          where province = $1
            and day >= current_date - ($2::int - 1)
            and ($3::text is null or service_domain = $3)
        ),
        reliability_window as (
          select source_type, source_count, document_count, avg_reliability_score
          from fact_source_reliability_daily
          where province = $1
            and day >= current_date - ($2::int - 1)
        ),
        reliability_summary as (
          select
            coalesce(round(avg(avg_reliability_score) * 100::numeric, 1), 0) as confidence_score,
            coalesce(
              round(
                (
                  sum(document_count) filter (
                    where source_type in ('gov', 'treasury', 'utility', 'stats')
                  )::numeric /
                  greatest(sum(document_count), 1)
                ) * 100,
                1
              ),
              0
            ) as official_share
          from reliability_window
        ),
        pressure_scores as (
          select
            least(
              100,
              round(
                (
                  (
                    coalesce(sum(pressure_case_count), 0) +
                    coalesce(sum(high_severity_count), 0) * 1.5 +
                    coalesce(sum(protest_count), 0) * 1.2 -
                    coalesce(sum(response_count), 0) * 0.5
                  ) / greatest(coalesce(sum(pressure_case_count), 0), 1)
                ) * 20,
                1
              )
            ) as base_pressure_score,
            least(
              100,
              round(
                (
                  (
                    coalesce(sum(high_severity_count), 0) * 1.4 +
                    coalesce(sum(protest_count), 0) * 1.6
                  ) / greatest(coalesce(sum(pressure_case_count), 0), 1)
                ) * 50,
                1
              )
            ) as base_escalation_score,
            coalesce(sum(pressure_case_count), 0)::int as pressure_case_count,
            coalesce(sum(high_severity_count), 0)::int as high_severity_count,
            coalesce(sum(protest_count), 0)::int as protest_count,
            coalesce(sum(response_count), 0)::int as response_count
          from pressure_window
        )
        select
          round(
            (
              ps.base_pressure_score *
              (0.55 + (rs.official_share / 100.0) * 0.45)
            )::numeric,
            1
          ) as "pressureScore",
          round(
            (
              ps.base_escalation_score *
              (0.55 + (rs.official_share / 100.0) * 0.45)
            )::numeric,
            1
          ) as "escalationScore",
          round(
            (
              rs.confidence_score * 0.7 +
              rs.official_share * 0.3
            )::numeric,
            1
          ) as "evidenceConfidenceScore",
          rs.official_share as "officialEvidenceShare",
          ps.pressure_case_count as "pressureCaseCount",
          ps.high_severity_count as "highSeverityCount",
          ps.protest_count as "protestCount",
          ps.response_count as "responseCount"
        from pressure_scores ps
        cross join reliability_summary rs
      `,
        [province, days, normalizedServiceDomain]
      ),
    query<TopDomainRow>(
      `
        select
          service_domain as "topPressureDomain"
        from fact_service_pressure_daily
        where province = $1
          and day >= current_date - ($2::int - 1)
          and ($3::text is null or service_domain = $3)
        group by service_domain
        order by sum(pressure_case_count) desc
        limit 1
      `,
      [province, days, normalizedServiceDomain]
    ),
    query<TopMunicipalityRow>(
      `
        select
          municipality as "highestExposureMunicipality"
        from fact_service_pressure_daily
        where province = $1
          and municipality is not null
          and day >= current_date - ($2::int - 1)
          and ($3::text is null or service_domain = $3)
        group by municipality
        order by sum(pressure_case_count) desc
        limit 1
      `,
      [province, days, normalizedServiceDomain]
    ),
  ]);

  const summary = summaryResult.rows[0] ?? {
    pressureScore: 0,
    escalationScore: 0,
    evidenceConfidenceScore: 0,
    officialEvidenceShare: 0,
    pressureCaseCount: 0,
    highSeverityCount: 0,
    protestCount: 0,
    responseCount: 0,
  };

  return {
    province,
    days,
    serviceDomain: normalizedServiceDomain,
    summary: {
      pressureScore: typeof summary.pressureScore === "string" ? Number(summary.pressureScore) : summary.pressureScore,
      escalationScore: typeof summary.escalationScore === "string" ? Number(summary.escalationScore) : summary.escalationScore,
      evidenceConfidenceScore:
        typeof summary.evidenceConfidenceScore === "string"
          ? Number(summary.evidenceConfidenceScore)
          : summary.evidenceConfidenceScore,
      officialEvidenceShare:
        typeof summary.officialEvidenceShare === "string"
          ? Number(summary.officialEvidenceShare)
          : summary.officialEvidenceShare,
      pressureCaseCount: summary.pressureCaseCount,
      highSeverityCount: summary.highSeverityCount,
      protestCount: summary.protestCount,
      responseCount: summary.responseCount,
      topPressureDomain: topDomainResult.rows[0]?.topPressureDomain ?? null,
      highestExposureMunicipality:
        topMunicipalityResult.rows[0]?.highestExposureMunicipality ?? null,
    },
    trace: {
      tables: [
        "fact_service_pressure_daily",
        "fact_source_reliability_daily",
      ],
      query: `province=${province};days=${days};serviceDomain=${normalizedServiceDomain ?? "all"}`,
    },
  };
}
