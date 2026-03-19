import { query } from "@/lib/db";
import { CitizenVoiceTrendsResponse } from "@/lib/analytics/types";

interface TrendRow {
  date: string;
  mentionCount: number;
  documentCount: number;
  negativeShare: string | number;
  avgSentimentScore: string | number;
}

interface IssueRow {
  issueFamily: string;
  mentionCount: number;
  documentCount: number;
  negativeShare: string | number;
  avgSentimentScore: string | number;
  avgConfidence: string | number;
}

interface IssueTrendRow {
  issueFamily: string;
  date: string;
  mentionCount: number;
  documentCount: number;
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "string" ? Number(value) : value;
}

export async function getCitizenVoiceTrends(
  province: string | null,
  days = 30,
  municipality: string | null = null,
  serviceDomain: string | null = null,
): Promise<CitizenVoiceTrendsResponse> {
  const params: any[] = [province, days];
  
  let baseWhere = `($1::text is null or province = $1) and day >= current_date - ($2::int - 1)`;
  
  if (municipality && municipality !== "All Municipalities") {
    params.push(municipality);
    baseWhere += ` and municipality = $${params.length}`;
  }
  
  if (serviceDomain && serviceDomain !== "all") {
    const { INFRASTRUCTURE_SERVICE_OPTIONS } = await import("./issue-taxonomy");
    const mapped = INFRASTRUCTURE_SERVICE_OPTIONS.find((t: any) => t.value === serviceDomain)?.label;
    if (mapped) {
      params.push(mapped);
      baseWhere += ` and issue_family = $${params.length}`;
    }
  }

  const fcvdWhere = baseWhere
    .replace(/\bprovince\b/g, 'fcvd.province')
    .replace(/\bday\b/g, 'fcvd.day')
    .replace(/\bmunicipality\b/g, 'fcvd.municipality')
    .replace(/\bissue_family\b/g, 'fcvd.issue_family');

  const [trendResult, issueResult, issueTrendResult] = await Promise.all([
    query<TrendRow>(
      `
        select
          day::text as "date",
          sum(mention_count)::int as "mentionCount",
          sum(document_count)::int as "documentCount",
          round(avg(negative_share)::numeric, 3) as "negativeShare",
          round(avg(avg_sentiment_score)::numeric, 2) as "avgSentimentScore"
        from fact_citizen_voice_daily
        where ${baseWhere}
        group by day
        order by day asc
      `,
      params,
    ),
    query<IssueRow>(
      `
        select
          issue_family as "issueFamily",
          sum(mention_count)::int as "mentionCount",
          sum(document_count)::int as "documentCount",
          round(avg(negative_share)::numeric, 3) as "negativeShare",
          round(avg(avg_sentiment_score)::numeric, 2) as "avgSentimentScore",
          round(avg(avg_confidence)::numeric, 3) as "avgConfidence"
        from fact_citizen_voice_daily
        where ${baseWhere}
        group by issue_family
        order by "mentionCount" desc, "issueFamily" asc
      `,
      params,
    ),
    query<IssueTrendRow>(
      `
        with ranked_issues as (
          select
            issue_family,
            sum(mention_count)::int as mention_count
          from fact_citizen_voice_daily
          where ${baseWhere}
          group by issue_family
          order by mention_count desc, issue_family asc
          limit 4
        )
        select
          fcvd.issue_family as "issueFamily",
          fcvd.day::text as "date",
          sum(fcvd.mention_count)::int as "mentionCount",
          sum(fcvd.document_count)::int as "documentCount"
        from fact_citizen_voice_daily fcvd
        join ranked_issues ri on ri.issue_family = fcvd.issue_family
        where ${fcvdWhere}
        group by fcvd.issue_family, fcvd.day
        order by fcvd.day asc, fcvd.issue_family asc
      `,
      params,
    ),
  ]);

  const trend = trendResult.rows.map((row) => ({
    date: row.date,
    mentionCount: row.mentionCount,
    documentCount: row.documentCount,
    negativeShare: toNumber(row.negativeShare),
    avgSentimentScore: toNumber(row.avgSentimentScore),
  }));

  const issues = issueResult.rows.map((row) => ({
    issueFamily: row.issueFamily,
    mentionCount: row.mentionCount,
    documentCount: row.documentCount,
    negativeShare: toNumber(row.negativeShare),
    avgSentimentScore: toNumber(row.avgSentimentScore),
    avgConfidence: toNumber(row.avgConfidence),
  }));

  const issueTrend = issueTrendResult.rows.map((row) => ({
    issueFamily: row.issueFamily,
    date: row.date,
    mentionCount: row.mentionCount,
    documentCount: row.documentCount,
  }));

  const topIssue = issues[0] ?? null;

  return {
    days,
    province,
    trend,
    issues,
    issueTrend,
    summary: {
      mentionCount: trend.reduce((sum, point) => sum + point.mentionCount, 0),
      documentCount: trend.reduce((sum, point) => sum + point.documentCount, 0),
      avgNegativeShare:
        trend.length > 0
          ? Math.round(
              (trend.reduce((sum, point) => sum + point.negativeShare, 0) /
                trend.length) *
                1000,
            ) / 1000
          : 0,
      dominantIssueFamily: topIssue?.issueFamily ?? null,
    },
    caveats: [
      "Citizen voice is currently derived from governed narrative documents that contain direct resident-facing complaint language matched against province issue packs.",
      "This layer is evidence and sentiment only; it does not override official KPI truth.",
    ],
    trace: {
      tables: ["citizen_voice_mentions", "fact_citizen_voice_daily"],
      query: `province=${province ?? "all"};days=${days}`,
    },
  };
}
