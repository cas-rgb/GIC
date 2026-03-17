import { query } from "@/lib/db";
import { HistoricalInfrastructureResponse } from "@/lib/analytics/types";

interface HistoryRow {
  issue_family: string | null;
  service_domain: string | null;
  event_date: string | null;
  period_year: number | null;
  severity: string | null;
  summary_text: string;
  budget_amount: number | null;
  project_name: string | null;
  project_status: string | null;
  source_name: string;
  source_url: string | null;
  verification_tier: string;
}

export async function getPlaceInfrastructureHistory(input: {
  province: string;
  municipality?: string | null;
  ward?: string | null;
}): Promise<HistoricalInfrastructureResponse> {
  const { province, municipality = null, ward = null } = input;

  if (ward && municipality) {
    const result = await query<HistoryRow>(
      `
        select
          issue_family,
          service_domain,
          event_date::text,
          period_year,
          severity,
          summary_text,
          null::numeric as budget_amount,
          null::text as project_name,
          null::text as project_status,
          source_name,
          source_url,
          verification_tier
        from ward_infrastructure_history
        where province_name = $1
          and municipality_name = $2
          and ward_name = $3
        order by coalesce(event_date, to_timestamp(period_year::text, 'YYYY')) desc nulls last
        limit 50
      `,
      [province, municipality, ward]
    );

    if (result.rows.length > 0) {
      return {
        geographyLevel: "ward",
        province,
        municipality,
        ward,
        rows: result.rows.map((row) => ({
          issueFamily: row.issue_family,
          serviceDomain: row.service_domain,
          eventDate: row.event_date,
          periodYear: row.period_year,
          severity: row.severity,
          summaryText: row.summary_text,
          budgetAmount: row.budget_amount,
          projectName: row.project_name,
          projectStatus: row.project_status,
          sourceName: row.source_name,
          sourceUrl: row.source_url,
          verificationTier: row.verification_tier,
        })),
        trace: {
          table: "ward_infrastructure_history",
          query: `province=${province};municipality=${municipality};ward=${ward}`,
        },
      };
    }

    const fallbackResult = await query<HistoryRow>(
      `
        select
          issue_family,
          service_domain,
          event_date::text,
          period_year,
          severity,
          summary_text,
          null::numeric as budget_amount,
          null::text as project_name,
          null::text as project_status,
          source_name,
          source_url,
          verification_tier
        from historical_issue_events
        where geography_level = 'ward'
          and province_name = $1
          and municipality_name = $2
          and ward_name = $3
        order by coalesce(event_date, to_timestamp(period_year::text, 'YYYY')) desc nulls last
        limit 50
      `,
      [province, municipality, ward]
    );

    return {
      geographyLevel: "ward",
      province,
      municipality,
      ward,
      rows: fallbackResult.rows.map((row) => ({
        issueFamily: row.issue_family,
        serviceDomain: row.service_domain,
        eventDate: row.event_date,
        periodYear: row.period_year,
        severity: row.severity,
        summaryText: row.summary_text,
        budgetAmount: row.budget_amount,
        projectName: row.project_name,
        projectStatus: row.project_status,
        sourceName: row.source_name,
        sourceUrl: row.source_url,
        verificationTier: row.verification_tier,
      })),
      trace: {
        table: "historical_issue_events",
        query: `province=${province};municipality=${municipality};ward=${ward}`,
      },
    };
  }

  if (municipality) {
    const result = await query<HistoryRow>(
      `
        select
          issue_family,
          service_domain,
          event_date::text,
          period_year,
          severity,
          summary_text,
          null::numeric as budget_amount,
          null::text as project_name,
          null::text as project_status,
          source_name,
          source_url,
          verification_tier
        from municipality_infrastructure_history
        where province_name = $1
          and municipality_name = $2
        order by coalesce(event_date, to_timestamp(period_year::text, 'YYYY')) desc nulls last
        limit 50
      `,
      [province, municipality]
    );

    return {
      geographyLevel: "municipality",
      province,
      municipality,
      ward: null,
      rows: result.rows.map((row) => ({
        issueFamily: row.issue_family,
        serviceDomain: row.service_domain,
        eventDate: row.event_date,
        periodYear: row.period_year,
        severity: row.severity,
        summaryText: row.summary_text,
        budgetAmount: row.budget_amount,
        projectName: row.project_name,
        projectStatus: row.project_status,
        sourceName: row.source_name,
        sourceUrl: row.source_url,
        verificationTier: row.verification_tier,
      })),
      trace: {
        table: "municipality_infrastructure_history",
        query: `province=${province};municipality=${municipality}`,
      },
    };
  }

  const result = await query<HistoryRow>(
    `
      select
        issue_family,
        service_domain,
        event_date::text,
        period_year,
        severity,
        summary_text,
        null::numeric as budget_amount,
        null::text as project_name,
        null::text as project_status,
        source_name,
        source_url,
        verification_tier
      from province_infrastructure_history
      where province_name = $1
      order by coalesce(event_date, to_timestamp(period_year::text, 'YYYY')) desc nulls last
      limit 50
    `,
    [province]
  );

  return {
    geographyLevel: "province",
    province,
    municipality: null,
    ward: null,
    rows: result.rows.map((row) => ({
      issueFamily: row.issue_family,
      serviceDomain: row.service_domain,
      eventDate: row.event_date,
      periodYear: row.period_year,
      severity: row.severity,
      summaryText: row.summary_text,
      budgetAmount: row.budget_amount,
      projectName: row.project_name,
      projectStatus: row.project_status,
      sourceName: row.source_name,
      sourceUrl: row.source_url,
      verificationTier: row.verification_tier,
    })),
    trace: {
      table: "province_infrastructure_history",
      query: `province=${province}`,
    },
  };
}
