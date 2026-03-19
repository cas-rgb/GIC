import { query } from "@/lib/db";
import { ProvinceSentimentResponse } from "@/lib/analytics/types";

interface TrendRow {
  date: string;
  sentimentScore: string | number;
  negativeShare: string | number;
  positiveShare: string | number;
  mentionCount: number;
}

interface TopicRow {
  topic: string;
  sentimentScore: string | number;
  negativeShare: string | number;
  positiveShare: string | number;
  mentionCount: number;
  avgConfidence: string | number;
  shareOfVoice: string | number;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" ? Number(value) : value;
}

export async function getMunicipalitySentiment(
  province: string,
  municipality: string,
  days = 30,
): Promise<ProvinceSentimentResponse> {
  const [trendResult, topicResult] = await Promise.all([
    query<TrendRow>(
      `
        select
          day::text as "date",
          round(avg(sentiment_score)::numeric, 2) as "sentimentScore",
          round(avg(negative_share)::numeric, 3) as "negativeShare",
          round(avg(positive_share)::numeric, 3) as "positiveShare",
          sum(mention_count)::int as "mentionCount"
        from fact_sentiment_daily
        where province = $1
          and municipality = $2
          and day >= current_date - ($3::int - 1)
        group by day
        order by day asc
      `,
      [province, municipality, days],
    ),
    query<TopicRow>(
      `
        with topic_sentiment as (
          select
            topic,
            round(avg(sentiment_score)::numeric, 2) as "sentimentScore",
            round(avg(negative_share)::numeric, 3) as "negativeShare",
            round(avg(positive_share)::numeric, 3) as "positiveShare",
            sum(mention_count)::int as "mentionCount",
            round(avg(avg_confidence)::numeric, 3) as "avgConfidence"
          from fact_sentiment_daily
          where province = $1
            and municipality = $2
            and day >= current_date - ($3::int - 1)
          group by topic
        )
        select
          ts.topic,
          ts."sentimentScore",
          ts."negativeShare",
          ts."positiveShare",
          ts."mentionCount",
          ts."avgConfidence",
          round(
            (
              ts."mentionCount"::numeric /
              greatest((select sum("mentionCount") from topic_sentiment), 1)
            ),
            3
          ) as "shareOfVoice"
        from topic_sentiment ts
        order by ts."mentionCount" desc, ts.topic asc
      `,
      [province, municipality, days],
    ),
  ]);

  const trend = trendResult.rows.map((row) => ({
    date: row.date,
    sentimentScore: toNumber(row.sentimentScore) ?? 0,
    negativeShare: toNumber(row.negativeShare) ?? 0,
    positiveShare: toNumber(row.positiveShare) ?? 0,
    mentionCount: row.mentionCount,
  }));

  const topics = topicResult.rows.map((row) => ({
    topic: row.topic,
    sentimentScore: toNumber(row.sentimentScore) ?? 0,
    negativeShare: toNumber(row.negativeShare) ?? 0,
    positiveShare: toNumber(row.positiveShare) ?? 0,
    mentionCount: row.mentionCount,
    avgConfidence: toNumber(row.avgConfidence) ?? 0,
    shareOfVoice: toNumber(row.shareOfVoice) ?? 0,
  }));

  const latestTrendPoint = trend[trend.length - 1] ?? null;
  const topComplaintTopic = [...topics].sort((left, right) => {
    if (right.negativeShare !== left.negativeShare) {
      return right.negativeShare - left.negativeShare;
    }
    return right.mentionCount - left.mentionCount;
  })[0];

  return {
    province,
    days,
    trend,
    topics,
    summary: {
      currentSentimentScore: latestTrendPoint?.sentimentScore ?? null,
      negativeShare: latestTrendPoint?.negativeShare ?? 0,
      positiveShare: latestTrendPoint?.positiveShare ?? 0,
      mentionCount: trend.reduce((sum, point) => sum + point.mentionCount, 0),
      topComplaintTopic: topComplaintTopic?.topic ?? null,
    },
    caveats: [
      "Municipality sentiment only appears where governed documents are mapped below province-wide level.",
    ],
    trace: {
      tables: ["fact_sentiment_daily"],
      query: `province=${province};municipality=${municipality};days=${days}`,
    },
  };
}
