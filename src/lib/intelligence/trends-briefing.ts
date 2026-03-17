import { getCitizenVoiceTrends } from "@/lib/analytics/citizen-voice-trends";
import { getSocialSourceMix } from "@/lib/analytics/social-source-mix";
import { getSocialTrendsExecutiveSummary } from "@/lib/analytics/social-trends-executive-summary";
import {
  BriefingOutput,
  TrendsBriefingInput,
} from "@/lib/intelligence/briefing-contract";
import { generateDashboardBriefing } from "@/lib/intelligence/generate-dashboard-briefing";

export interface TrendsBriefingResponse extends BriefingOutput {
  province: string | null;
  days: number;
  trace: {
    sources: string[];
    query: string;
  };
}

export async function getTrendsBriefing(
  province: string | null,
  days = 30
): Promise<TrendsBriefingResponse> {
  const [summary, trends, sourceMix] = await Promise.all([
    getSocialTrendsExecutiveSummary(province, days),
    getCitizenVoiceTrends(province, days),
    getSocialSourceMix(province, days),
  ]);

  const previousByTopic = new Map<string, number>();
  for (const row of trends.issueTrend) {
    const current = previousByTopic.get(row.issueFamily) ?? 0;
    previousByTopic.set(row.issueFamily, current + row.mentionCount);
  }

  const input: TrendsBriefingInput = {
    dashboard: "trends",
    geography: {
      province,
    },
    filters: {
      days,
      confidenceMode: "governed",
    },
    summary: {
      totalMentions: summary.summary.totalCitizenMentions,
      dominantTopic: summary.summary.dominantIssueFamily,
      narrativeRiskLevel: summary.summary.narrativeRiskLevel,
      hottestProvince: summary.summary.hottestProvince,
      averageNegativeShare: summary.summary.averageNegativeShare,
    },
    rankings: trends.issues.map((issue) => ({
      topic: issue.issueFamily,
      mentionCount: issue.mentionCount,
      shareOfVoice:
        trends.summary.mentionCount > 0
          ? Number(((issue.mentionCount / trends.summary.mentionCount) * 100).toFixed(1))
          : 0,
      negativeShare: issue.negativeShare,
      velocity: previousByTopic.get(issue.issueFamily) ?? null,
    })),
    trends: trends.issueTrend.map((row) => ({
      date: row.date,
      topic: row.issueFamily,
      mentionCount: row.mentionCount,
      shareOfVoice:
        trends.summary.mentionCount > 0
          ? Number(((row.mentionCount / trends.summary.mentionCount) * 100).toFixed(2))
          : 0,
    })),
    sourceMix: sourceMix.rows,
    evidence: summary.evidenceHighlights.map((document) => ({
      title: document.title,
      sourceName: document.sourceName,
      sourceType: document.sourceType,
      excerpt: document.excerpt,
      url: document.url,
    })),
    caveats: [...summary.caveats, ...trends.caveats],
  };

  return {
    ...generateDashboardBriefing(input),
    province,
    days,
    trace: {
      sources: ["fact_citizen_voice_daily", "citizen_voice_mentions", "documents", "sources"],
      query: `province=${province ?? "all"};days=${days}`,
    },
  };
}
