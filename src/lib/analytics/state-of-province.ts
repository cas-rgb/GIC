import { getProvinceSummary } from "@/lib/analytics/province-summary";
import { getProvinceSentiment } from "@/lib/analytics/province-sentiment";
import { getProvinceLegacyCommunitySignals } from "@/lib/analytics/province-legacy-community-signals";

import { query } from "@/lib/db";

export async function getStateOfProvinceMetrics(province: string, days: number = 30) {
  // Aggregate data from multiple established tracking domains
  const [summary, sentiment, legacySignals, water, power, roads, topicsResult] = await Promise.all([
    getProvinceSummary(province, days),
    getProvinceSentiment(province, days),
    getProvinceLegacyCommunitySignals(province, days),
    getProvinceSummary(province, days, "water"),
    getProvinceSummary(province, days, "electricity"),
    getProvinceSummary(province, days, "roads"),
    query<{ topic: string; mention_count: number }>(`
      select topic, sum(mention_count)::int as mention_count
      from fact_topic_share_daily
      where province = $1
        and day >= current_date - ($2::int - 1)
      group by topic
      order by sum(mention_count) desc
      limit 5
    `, [province, days])
  ]);

  // Combine them into a clean, LLM-readable format
  const metricsData = {
    overview: summary.summary,
    public_sentiment: {
      sentimentScore: sentiment.summary.currentSentimentScore,
      negativeVolumeShare: sentiment.summary.negativeShare,
      topComplaintTopic: sentiment.summary.topComplaintTopic,
      mentionCount: sentiment.summary.mentionCount,
    },
    community_signals: {
      majorIssues: legacySignals.issues.map(issue => ({
        topic: issue.issue,
        urgency: issue.avgUrgency,
        volume: issue.documentCount,
        sentiment: issue.dominantSentiment
      })),
      totalIdentifiedProvinces: legacySignals.issues.reduce((acc, curr) => Math.max(acc, curr.provinceCount), 0),
    },
    vital_signs: {
      waterStress: water.summary.pressureScore,
      powerStress: power.summary.pressureScore,
      roadsStress: roads.summary.pressureScore,
    },
    topic_distribution: topicsResult.rows,
    trace: {
      sources: [
        ...summary.trace.tables,
        ...sentiment.trace.tables,
        ...legacySignals.trace.tables,
        "fact_topic_share_daily"
      ]
    }
  };

  return metricsData;
}
