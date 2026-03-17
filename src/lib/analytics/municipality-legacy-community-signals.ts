import { query } from "@/lib/db";
import { MunicipalityLegacyCommunitySignalsResponse } from "@/lib/analytics/types";

interface SummaryRow {
  documentCount: number;
  sourceCount: number;
  avgUrgency: string | number | null;
  negativeShare: string | number | null;
  topPlatform: string | null;
}

interface IssueRow {
  issue: string;
  documentCount: number;
  avgUrgency: string | number | null;
  dominantSentiment: string | null;
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "string" ? Number(value) : value;
}

export async function getMunicipalityLegacyCommunitySignals(
  province: string,
  municipality: string,
  days = 30
): Promise<MunicipalityLegacyCommunitySignalsResponse> {
  const [summaryResult, issueResult] = await Promise.all([
    query<SummaryRow>(
      `
        with legacy_docs as (
          select
            d.id,
            src.name as source_name,
            d.content_text
          from documents d
          join sources src on src.id = d.source_id
          join locations l on l.id = d.location_id
          where d.parser_version = 'legacy-community-signals-v1'
            and d.status = 'active'
            and l.province = $1
            and l.municipality = $2
            and coalesce(date(d.published_at), date(d.created_at)) >= current_date - ($3::int - 1)
        ),
        expanded as (
          select
            id,
            source_name,
            substring(content_text from 'Urgency: ([0-9]+)')::numeric as urgency,
            case
              when content_text ilike '%Sentiment: negative%' then 'negative'
              when content_text ilike '%Sentiment: positive%' then 'positive'
              when content_text ilike '%Sentiment: neutral%' then 'neutral'
              else null
            end as sentiment
          from legacy_docs
        ),
        source_ranked as (
          select
            source_name,
            count(*)::int as row_count,
            row_number() over (order by count(*) desc, source_name asc) as source_rank
          from expanded
          group by source_name
        )
        select
          count(distinct id)::int as "documentCount",
          count(distinct source_name)::int as "sourceCount",
          round(avg(urgency)::numeric, 1) as "avgUrgency",
          round(avg(case when sentiment = 'negative' then 1 else 0 end)::numeric, 3) as "negativeShare",
          max(source_name) filter (where source_rank = 1) as "topPlatform"
        from expanded
        left join source_ranked using (source_name)
      `,
      [province, municipality, days]
    ),
    query<IssueRow>(
      `
        with legacy_docs as (
          select
            split_part(d.title, '|', 1) as issue,
            substring(d.content_text from 'Urgency: ([0-9]+)')::numeric as urgency,
            case
              when d.content_text ilike '%Sentiment: negative%' then 'negative'
              when d.content_text ilike '%Sentiment: positive%' then 'positive'
              when d.content_text ilike '%Sentiment: neutral%' then 'neutral'
              else null
            end as sentiment
          from documents d
          join locations l on l.id = d.location_id
          where d.parser_version = 'legacy-community-signals-v1'
            and d.status = 'active'
            and l.province = $1
            and l.municipality = $2
            and coalesce(date(d.published_at), date(d.created_at)) >= current_date - ($3::int - 1)
        ),
        sentiment_ranked as (
          select
            issue,
            sentiment,
            count(*)::int as row_count,
            row_number() over (partition by issue order by count(*) desc, sentiment asc) as sentiment_rank
          from legacy_docs
          group by issue, sentiment
        )
        select
          issue,
          count(*)::int as "documentCount",
          round(avg(urgency)::numeric, 1) as "avgUrgency",
          max(sentiment) filter (where sentiment_rank = 1) as "dominantSentiment"
        from legacy_docs
        left join sentiment_ranked using (issue)
        group by issue
        order by "documentCount" desc, "avgUrgency" desc nulls last, issue asc
        limit 6
      `,
      [province, municipality, days]
    ),
  ]);

  const summary = summaryResult.rows[0] ?? {
    documentCount: 0,
    sourceCount: 0,
    avgUrgency: 0,
    negativeShare: 0,
    topPlatform: null,
  };

  return {
    province,
    municipality,
    days,
    summary: {
      documentCount: summary.documentCount,
      sourceCount: summary.sourceCount,
      avgUrgency: toNumber(summary.avgUrgency),
      negativeShare: toNumber(summary.negativeShare),
      topPlatform: summary.topPlatform,
    },
    issues: issueResult.rows.map((row) => ({
      issue: row.issue.trim(),
      documentCount: row.documentCount,
      avgUrgency: toNumber(row.avgUrgency),
      dominantSentiment: row.dominantSentiment,
    })),
    caveats: [
      "This panel shows legacy Firebase community signals that were normalized into the governed document layer.",
      "Legacy community signals are useful local evidence, but they are less standardized than the official-source and current live-ingestion paths.",
    ],
    trace: {
      tables: ["documents", "locations", "sources"],
      query: `province=${province};municipality=${municipality};parser=legacy-community-signals-v1;days=${days}`,
    },
  };
}
