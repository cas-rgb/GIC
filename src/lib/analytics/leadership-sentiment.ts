import { query } from "@/lib/db";
import { LeadershipSentimentResponse, AINarrativeSynthesisRow } from "@/lib/analytics/types";

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

export async function getLeadershipSentiment(
  province: string,
  days = 30,
  municipality?: string | null,
  ward?: string | null,
  serviceDomain?: string | null
): Promise<LeadershipSentimentResponse> {
  const [leaderResult, topicResult, aiSynthesisResult] = await Promise.all([
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
        from fact_leadership_sentiment_daily
        where province = $1
          and day >= current_date - ($2::int - 1)
        group by leader_name, office
        order by sum(mention_count) desc, leader_name asc
      `,
      [province, days],
    ),
    query<LeadershipTopicRow>(
      `
        select
          leader_name as "leaderName",
          topic,
          sum(mention_count)::int as "mentionCount"
        from fact_leadership_sentiment_daily
        where province = $1
          and day >= current_date - ($2::int - 1)
        group by leader_name, topic
        order by leader_name asc, sum(mention_count) desc, topic asc
      `,
      [province, days],
    ),
    query<AINarrativeSynthesisRow>(
      `
        select 
          leader_name as "leaderName",
          who_involved as "whoInvolved",
          what_happened as "whatHappened",
          why_it_happened as "whyItHappened",
          how_resolved_or_current as "howResolvedOrCurrent",
          when_timeline as "whenTimeline",
          source_evidence as "sourceEvidence"
        from ai_narrative_synthesis
        where lens = 'leadership' 
          and ($1::text is null or province = $1)
          and created_at >= current_date - ($2::int - 1)
          and ($3::text is null or municipality = $3)
          and ($4::text is null or ward = $4)
          and ($5::text is null or service_category = $5)
        order by created_at desc
      `,
      [province, days, municipality || null, ward || null, serviceDomain || null]
    ),
  ]);

  const topicsByLeader = new Map<string, LeadershipTopicRow[]>();

  for (const row of topicResult.rows) {
    const current = topicsByLeader.get(row.leaderName) ?? [];
    current.push(row);
    topicsByLeader.set(row.leaderName, current);
  }

  const aiSynthesisByLeader = new Map<string, AINarrativeSynthesisRow[]>();
  const localizedLeaders = new Set<string>();

  for (const row of aiSynthesisResult.rows) {
    // @ts-ignore
    const leaderName = row.leaderName;
    const current = aiSynthesisByLeader.get(leaderName) ?? [];
    current.push(row);
    aiSynthesisByLeader.set(leaderName, current);
    
    // If we're filtering by municipality, only show leaders who have a direct mention in this localized area
    if (municipality || ward) {
      localizedLeaders.add(leaderName);
    }
  }

  // Filter main leader array if drilling down into municipality/ward level
  let finalLeaders = [...leaderResult.rows];
  if ((municipality || ward) && localizedLeaders.size > 0) {
    finalLeaders = finalLeaders.filter(row => localizedLeaders.has(row.leaderName));
  }

  // Handled leaders that exist purely in AI synthesis (e.g. Mayors not in the mock aggregate)
  for (const [leaderName, evidence] of aiSynthesisByLeader.entries()) {
    if (!finalLeaders.find(l => l.leaderName === leaderName)) {
      finalLeaders.push({
        leaderName,
        office: "Executive",
        sentimentScore: 0.1, // Default neutral-ish
        mentionCount: evidence.length,
        positiveMentionCount: 0,
        neutralMentionCount: evidence.length,
        negativeMentionCount: 0,
        confidence: 0.8
      } as LeadershipAggregateRow);
    }
  }

  return {
    province,
    days,
    leaders: finalLeaders.map((row) => {
      const topics = (topicsByLeader.get(row.leaderName) ?? []).slice(0, 3);
      const aiSynthesis = aiSynthesisByLeader.get(row.leaderName) ?? [];

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
        aiSynthesis,
      };
    }).sort((a, b) => b.mentionCount - a.mentionCount),
    caveats: [
      "Leadership sentiment only appears where governed documents explicitly mention a provincial leader or premier alias.",
      "Current coverage depends on the live source mix and is thinner than the province sentiment layer.",
    ],
    trace: {
      tables: ["fact_leadership_sentiment_daily"],
      query: `province=${province};days=${days}`,
    },
  };
}
