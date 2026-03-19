import { query } from "@/lib/db";
import { ComplaintClustersResponse } from "@/lib/analytics/types";

interface SummaryRow {
  issueCount: number;
  totalMentions: number;
  dominantIssueFamily: string | null;
  widestSpreadIssueFamily: string | null;
}

interface ClusterRow {
  issueFamily: string;
  mentionCount: number;
  documentCount: number;
  municipalityCount: number;
  avgNegativeShare: string | number;
  avgSentimentScore: string | number;
  intensityScore: string | number;
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "string" ? Number(value) : value;
}

export async function getComplaintClusters(
  province: string | null,
  days = 30,
): Promise<ComplaintClustersResponse> {
  const params = [province, days];

  const [summaryResult, rowsResult] = await Promise.all([
    query<SummaryRow>(
      `
        with ranked as (
          select
            issue_family,
            sum(mention_count)::int as mention_count,
            count(distinct municipality)::int as municipality_count
          from fact_citizen_voice_daily
          where ($1::text is null or province = $1)
            and day >= current_date - ($2::int - 1)
          group by issue_family
        )
        select
          count(*)::int as "issueCount",
          coalesce(sum(mention_count), 0)::int as "totalMentions",
          (
            select issue_family
            from ranked
            order by mention_count desc, issue_family asc
            limit 1
          ) as "dominantIssueFamily",
          (
            select issue_family
            from ranked
            order by municipality_count desc, mention_count desc, issue_family asc
            limit 1
          ) as "widestSpreadIssueFamily"
        from ranked
      `,
      params,
    ),
    query<ClusterRow>(
      `
        select
          issue_family as "issueFamily",
          sum(mention_count)::int as "mentionCount",
          sum(document_count)::int as "documentCount",
          count(distinct municipality)::int as "municipalityCount",
          round(avg(negative_share)::numeric, 3) as "avgNegativeShare",
          round(avg(avg_sentiment_score)::numeric, 2) as "avgSentimentScore",
          round(
            (
              sum(mention_count)::numeric
              * (0.5 + coalesce(avg(negative_share), 0))
              * (1 + (count(distinct municipality)::numeric * 0.08))
            ),
            2
          ) as "intensityScore"
        from fact_citizen_voice_daily
        where ($1::text is null or province = $1)
          and day >= current_date - ($2::int - 1)
        group by issue_family
        order by "intensityScore" desc, "mentionCount" desc, "issueFamily" asc
        limit 8
      `,
      params,
    ),
  ]);

  const summary = summaryResult.rows[0] ?? {
    issueCount: 0,
    totalMentions: 0,
    dominantIssueFamily: null,
    widestSpreadIssueFamily: null,
  };

  return {
    province,
    days,
    summary: {
      issueCount: summary.issueCount,
      totalMentions: summary.totalMentions,
      dominantIssueFamily: summary.dominantIssueFamily,
      widestSpreadIssueFamily: summary.widestSpreadIssueFamily,
    },
    rows: rowsResult.rows.map((row) => ({
      issueFamily: row.issueFamily,
      mentionCount: row.mentionCount,
      documentCount: row.documentCount,
      municipalityCount: row.municipalityCount,
      avgNegativeShare: toNumber(row.avgNegativeShare),
      avgSentimentScore: toNumber(row.avgSentimentScore),
      intensityScore: toNumber(row.intensityScore),
    })),
    caveats: [
      "Complaint clusters are derived from governed citizen-voice facts and represent issue concentration, not official service truth.",
      "Use these clusters to identify public-pressure concentration and spread, then verify with operational and official evidence.",
    ],
    trace: {
      tables: ["fact_citizen_voice_daily"],
      query: `province=${province ?? "all"};days=${days}`,
    },
  };
}
