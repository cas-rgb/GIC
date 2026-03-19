import { getLeadershipEvidence } from "@/lib/analytics/leadership-evidence";
import { getLeadershipSentiment } from "@/lib/analytics/leadership-sentiment";
import {
  BriefingOutput,
  LeadershipBriefingInput,
} from "@/lib/intelligence/briefing-contract";
import { generateDashboardBriefing } from "@/lib/intelligence/generate-dashboard-briefing";

export interface LeadershipBriefingResponse extends BriefingOutput {
  province: string;
  days: number;
  trace: {
    sources: string[];
    query: string;
  };
}

function reputationLabel(score: number): string {
  if (score <= -0.2) {
    return "At Risk";
  }

  if (score < 0.15) {
    return "Mixed";
  }

  return "Supportive";
}

export async function getLeadershipBriefing(
  province: string,
  days = 30,
): Promise<LeadershipBriefingResponse> {
  const [leadership, evidence] = await Promise.all([
    getLeadershipSentiment(province, days),
    getLeadershipEvidence(province, null, null, days),
  ]);

  const highestExposureLeader =
    [...leadership.leaders].sort(
      (left, right) => right.mentionCount - left.mentionCount,
    )[0] ?? null;
  const highestRiskLeader =
    [...leadership.leaders].sort(
      (left, right) => left.sentimentScore - right.sentimentScore,
    )[0] ?? null;
  const avgSentiment =
    leadership.leaders.reduce((sum, leader) => sum + leader.sentimentScore, 0) /
    Math.max(leadership.leaders.length, 1);

  const input: LeadershipBriefingInput = {
    dashboard: "leadership",
    geography: {
      province,
    },
    filters: {
      days,
      confidenceMode: "governed",
    },
    summary: {
      averageSentiment: Number.isFinite(avgSentiment)
        ? Number(avgSentiment.toFixed(2))
        : null,
      leaderCount: leadership.leaders.length,
      mentionVolume: leadership.leaders.reduce(
        (sum, leader) => sum + leader.mentionCount,
        0,
      ),
      riskAlertCount: leadership.leaders.filter(
        (leader) => leader.sentimentScore <= -0.2,
      ).length,
      highestExposureLeader: highestExposureLeader?.leaderName ?? null,
      highestRiskLeader: highestRiskLeader?.leaderName ?? null,
    },
    rankings: leadership.leaders.map((leader) => ({
      leaderName: leader.leaderName,
      office: leader.office,
      sentimentScore: leader.sentimentScore,
      mentionCount: leader.mentionCount,
      reputationLabel: reputationLabel(leader.sentimentScore),
      topIssue: leader.linkedIssues[0] ?? null,
    })),
    trends: leadership.leaders.map((leader) => ({
      date: "current-window",
      leaderName: leader.leaderName,
      sentimentScore: leader.sentimentScore,
      mentionCount: leader.mentionCount,
    })),
    narrativesByLeader: leadership.leaders.map((leader) => ({
      leaderName: leader.leaderName,
      topics: leader.linkedIssues,
      narratives: leader.topNarratives,
    })),
    evidence: evidence.documents.slice(0, 5).map((document) => ({
      title: document.title,
      sourceName: document.sourceName,
      sourceType: document.sourceType,
      date: document.publishedAt,
      excerpt: document.excerpt,
      url: document.url,
    })),
    caveats: [...leadership.caveats, ...evidence.caveats],
  };

  return {
    ...generateDashboardBriefing(input),
    province,
    days,
    trace: {
      sources: [
        "fact_leadership_sentiment_daily",
        "documents",
        "sentiment_mentions",
        "sources",
      ],
      query: `province=${province};days=${days}`,
    },
  };
}
