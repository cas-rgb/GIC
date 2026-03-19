import { query } from "@/lib/db";
import { MunicipalitySummaryResponse } from "@/lib/analytics/types";
import { normalizeInfrastructureServiceFilter } from "@/lib/analytics/issue-taxonomy";

interface SummaryRow {
  pressureScore: string | number;
  escalationScore: string | number;
  officialEvidenceShare: string | number;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
}

interface SentimentRow {
  sentimentScore: string | number | null;
  negativeShare: string | number | null;
  topComplaintTopic: string | null;
}

interface EvidenceRow {
  evidenceConfidenceScore: string | number | null;
}

interface DomainRow {
  topPressureDomain: string | null;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" ? Number(value) : value;
}

export async function getMunicipalitySummary(
  province: string,
  municipality: string,
  days = 30,
  serviceDomain?: string | null,
): Promise<MunicipalitySummaryResponse> {
  const normalizedServiceDomain =
    normalizeInfrastructureServiceFilter(serviceDomain);
  const [pressureResult, sentimentResult, evidenceResult, domainResult] =
    await Promise.all([
      query<SummaryRow>(
        `
          with pressure_window as (
            select *
            from fact_service_pressure_daily
            where province = $1
              and municipality = $2
              and day >= current_date - ($3::int - 1)
              and ($4::text is null or service_domain = $4)
          ),
          evidence_window as (
            select *
            from fact_source_reliability_daily
            where province = $1
              and day >= current_date - ($3::int - 1)
          ),
          evidence_summary as (
            select
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
            from evidence_window
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
                (0.55 + (es.official_share / 100.0) * 0.45)
              )::numeric,
              1
            ) as "pressureScore",
            round(
              (
                ps.base_escalation_score *
                (0.55 + (es.official_share / 100.0) * 0.45)
              )::numeric,
              1
            ) as "escalationScore",
            es.official_share as "officialEvidenceShare",
            ps.pressure_case_count as "pressureCaseCount",
            ps.high_severity_count as "highSeverityCount",
            ps.protest_count as "protestCount",
            ps.response_count as "responseCount"
          from pressure_scores ps
          cross join evidence_summary es
        `,
        [province, municipality, days, normalizedServiceDomain],
      ),
      query<SentimentRow>(
        `
          with sentiment_window as (
            select *
            from fact_sentiment_daily
            where province = $1
              and municipality = $2
              and day >= current_date - ($3::int - 1)
          )
          select
            round(avg(sentiment_score)::numeric, 2) as "sentimentScore",
            round(avg(negative_share)::numeric, 3) as "negativeShare",
            (
              select topic
              from sentiment_window
              order by negative_share desc, mention_count desc, topic asc
              limit 1
            ) as "topComplaintTopic"
          from sentiment_window
        `,
        [province, municipality, days],
      ),
      query<EvidenceRow>(
        `
          select
            round(avg(src.reliability_score) * 100::numeric, 1) as "evidenceConfidenceScore"
          from documents d
          join sources src on src.id = d.source_id
          join locations l on l.id = d.location_id
          where d.status = 'active'
            and l.province = $1
            and l.municipality = $2
            and coalesce(date(d.published_at), date(d.created_at)) >= current_date - ($3::int - 1)
        `,
        [province, municipality, days],
      ),
      query<DomainRow>(
        `
          select
            service_domain as "topPressureDomain"
          from fact_service_pressure_daily
        where province = $1
          and municipality = $2
          and day >= current_date - ($3::int - 1)
          and ($4::text is null or service_domain = $4)
        group by service_domain
        order by sum(pressure_case_count) desc
        limit 1
      `,
        [province, municipality, days, normalizedServiceDomain],
      ),
    ]);

  const pressure = pressureResult.rows[0] ?? {
    pressureScore: 0,
    escalationScore: 0,
    officialEvidenceShare: 0,
    pressureCaseCount: 0,
    highSeverityCount: 0,
    protestCount: 0,
    responseCount: 0,
  };
  const sentiment = sentimentResult.rows[0] ?? {
    sentimentScore: null,
    negativeShare: 0,
    topComplaintTopic: null,
  };
  const evidence = evidenceResult.rows[0] ?? {
    evidenceConfidenceScore: 0,
  };

  return {
    province,
    municipality,
    days,
    serviceDomain: normalizedServiceDomain,
    summary: {
      pressureScore: toNumber(pressure.pressureScore) ?? 0,
      escalationScore: toNumber(pressure.escalationScore) ?? 0,
      sentimentScore: toNumber(sentiment.sentimentScore),
      negativeShare: toNumber(sentiment.negativeShare) ?? 0,
      evidenceConfidenceScore: toNumber(evidence.evidenceConfidenceScore) ?? 0,
      officialEvidenceShare: toNumber(pressure.officialEvidenceShare) ?? 0,
      pressureCaseCount: pressure.pressureCaseCount,
      highSeverityCount: pressure.highSeverityCount,
      protestCount: pressure.protestCount,
      responseCount: pressure.responseCount,
      topPressureDomain: domainResult.rows[0]?.topPressureDomain ?? null,
      topComplaintTopic: sentiment.topComplaintTopic ?? null,
    },
    trace: {
      tables: [
        "fact_service_pressure_daily",
        "fact_sentiment_daily",
        "documents",
      ],
      query: `province=${province};municipality=${municipality};days=${days};serviceDomain=${normalizedServiceDomain ?? "all"}`,
    },
  };
}
