import { query } from "@/lib/db";
import {
  MunicipalityCitizenVoiceIssueRow,
  MunicipalityCitizenVoiceSummaryResponse,
} from "@/lib/analytics/types";

interface SummaryRow {
  totalCitizenMentions: number;
  totalCitizenDocuments: number;
  averageNegativeShare: string | number | null;
}

interface IssueRow {
  issueFamily: string;
  mentionCount: number;
  documentCount: number;
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

function toRiskLevel(negativeShare: number, mentionCount: number): "Low" | "Elevated" | "High" {
  if (negativeShare >= 0.7 || (negativeShare >= 0.55 && mentionCount >= 12)) {
    return "High";
  }

  if (negativeShare >= 0.45 || mentionCount >= 6) {
    return "Elevated";
  }

  return "Low";
}

export async function getMunicipalityCitizenVoiceSummary(
  province: string,
  municipality: string,
  days = 30
): Promise<MunicipalityCitizenVoiceSummaryResponse> {
  const [summaryResult, issueResult] = await Promise.all([
    query<SummaryRow>(
      `
        select
          coalesce(sum(mention_count), 0)::int as "totalCitizenMentions",
          coalesce(sum(document_count), 0)::int as "totalCitizenDocuments",
          round(avg(negative_share)::numeric, 3) as "averageNegativeShare"
        from fact_citizen_voice_daily
        where province = $1
          and municipality = $2
          and day >= current_date - ($3::int - 1)
      `,
      [province, municipality, days]
    ),
    query<IssueRow>(
      `
        select
          issue_family as "issueFamily",
          sum(mention_count)::int as "mentionCount",
          sum(document_count)::int as "documentCount",
          round(avg(negative_share)::numeric, 3) as "avgNegativeShare",
          round(avg(avg_sentiment_score)::numeric, 2) as "avgSentimentScore",
          round(
            (
              sum(mention_count)::numeric
              * (0.5 + coalesce(avg(negative_share), 0))
              * (1 + least(sum(document_count)::numeric, 25) / 50)
            ),
            2
          ) as "intensityScore"
        from fact_citizen_voice_daily
        where province = $1
          and municipality = $2
          and day >= current_date - ($3::int - 1)
        group by issue_family
        order by "intensityScore" desc, "mentionCount" desc, "issueFamily" asc
      `,
      [province, municipality, days]
    ),
  ]);

  const summary = summaryResult.rows[0] ?? {
    totalCitizenMentions: 0,
    totalCitizenDocuments: 0,
    averageNegativeShare: 0,
  };
  const issues: MunicipalityCitizenVoiceIssueRow[] = issueResult.rows.map((row) => ({
    issueFamily: row.issueFamily,
    mentionCount: row.mentionCount,
    documentCount: row.documentCount,
    avgNegativeShare: toNumber(row.avgNegativeShare),
    avgSentimentScore: toNumber(row.avgSentimentScore),
    intensityScore: toNumber(row.intensityScore),
  }));
  const dominantIssueFamily = issues[0]?.issueFamily ?? null;
  const riskLevel = toRiskLevel(
    toNumber(summary.averageNegativeShare),
    summary.totalCitizenMentions
  );

  const narratives = [
    summary.totalCitizenMentions > 0
      ? `${municipality} has ${summary.totalCitizenMentions} governed public-voice mentions in the selected window, drawn from ${summary.totalCitizenDocuments} supporting documents.`
      : `${municipality} does not yet have enough governed citizen-voice coverage to establish a strong local public narrative.`,
    dominantIssueFamily
      ? `${dominantIssueFamily} is the dominant local complaint family in the current municipality voice layer.`
      : "No dominant municipality complaint family could be identified yet.",
    riskLevel === "High"
      ? "Local public frustration is strong enough to justify visible executive response and communication at municipality level."
      : riskLevel === "Elevated"
        ? "The local public narrative is elevated and should be treated as an early warning for municipal intervention planning."
        : "The local public narrative is present but still too thin to carry action on its own without stronger operational verification.",
  ];

  return {
    province,
    municipality,
    days,
    summary: {
      totalCitizenMentions: summary.totalCitizenMentions,
      totalCitizenDocuments: summary.totalCitizenDocuments,
      averageNegativeShare: toNumber(summary.averageNegativeShare),
      dominantIssueFamily,
      narrativeRiskLevel: riskLevel,
    },
    narratives,
    issues: issues.slice(0, 5),
    caveats: [
      "Municipality public voice is grounded in governed citizen-voice evidence, not a full local social firehose.",
      "This layer should accelerate municipal attention and communication, not replace service, treasury, or water facts.",
    ],
    trace: {
      tables: ["fact_citizen_voice_daily"],
      query: `province=${province};municipality=${municipality};days=${days}`,
    },
  };
}
