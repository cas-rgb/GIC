import { MunicipalLeadershipSentimentResponse } from "@/lib/analytics/types";
import { query } from "@/lib/db";

interface LeadershipAggregateRow {
  leaderName: string;
  office: string;
  sentimentScore: string | number;
  mentionCount: number;
  positiveMentionCount: number;
  neutralMentionCount: number;
  negativeMentionCount: number;
  confidence: string | number;
}

interface LeadershipTopicRow {
  leaderName: string;
  topic: string;
  mentionCount: number;
}

function toNumber(value: string | number): number {
  return typeof value === "string" ? Number(value) : value;
}

export async function getMunicipalLeadershipSentiment(
  province: string,
  municipality: string,
  days = 30,
): Promise<MunicipalLeadershipSentimentResponse> {
  const [leaderResult, topicResult] = await Promise.all([
    query<LeadershipAggregateRow>(
      `
        select
          leader_name as "leaderName",
          office,
          round(avg(sentiment_score)::numeric, 2) as "sentimentScore",
          sum(mention_count)::int as "mentionCount",
          sum(mention_count) filter (where sentiment_score >= 0.2)::int as "positiveMentionCount",
          sum(mention_count) filter (where sentiment_score > -0.2 and sentiment_score < 0.2)::int as "neutralMentionCount",
          sum(mention_count) filter (where sentiment_score <= -0.2)::int as "negativeMentionCount",
          round(avg(avg_confidence)::numeric, 3) as "confidence"
        from fact_municipal_leadership_sentiment_daily
        where province = $1
          and municipality = $2
          and day >= current_date - ($3::int - 1)
        group by leader_name, office
        order by sum(mention_count) desc, leader_name asc
      `,
      [province, municipality, days],
    ),
    query<LeadershipTopicRow>(
      `
        select
          leader_name as "leaderName",
          topic,
          sum(mention_count)::int as "mentionCount"
        from fact_municipal_leadership_sentiment_daily
        where province = $1
          and municipality = $2
          and day >= current_date - ($3::int - 1)
        group by leader_name, topic
        order by leader_name asc, sum(mention_count) desc, topic asc
      `,
      [province, municipality, days],
    ),
  ]);

  const topicsByLeader = new Map<string, LeadershipTopicRow[]>();

  for (const row of topicResult.rows) {
    const current = topicsByLeader.get(row.leaderName) ?? [];
    current.push(row);
    topicsByLeader.set(row.leaderName, current);
  }

  return {
    province,
    municipality,
    days,
    leaders: leaderResult.rows.map((row) => {
      const topics = (topicsByLeader.get(row.leaderName) ?? []).slice(0, 3);

      return {
        leaderName: row.leaderName,
        office: row.office,
        sentimentScore: toNumber(row.sentimentScore),
        mentionCount: row.mentionCount,
        positiveMentionCount: row.positiveMentionCount ?? 0,
        neutralMentionCount: row.neutralMentionCount ?? 0,
        negativeMentionCount: row.negativeMentionCount ?? 0,
        confidence: toNumber(row.confidence),
        linkedIssues: topics.map((topic) => topic.topic),
        linkedIssueBreakdown: topics.map((topic) => ({
          topic: topic.topic,
          mentionCount: topic.mentionCount,
        })),
        topNarratives: topics.map((topic) => `${topic.topic} pressure`),
      };
    }),
    caveats: [
      "Municipal leadership sentiment only appears where governed documents explicitly mention a mayor or municipality-specific office alias.",
      "Coverage is currently strongest in municipalities with live local news volume and verified mayor aliases.",
    ],
    trace: {
      tables: ["fact_municipal_leadership_sentiment_daily"],
      query: `province=${province};municipality=${municipality};days=${days}`,
    },
  };
}
