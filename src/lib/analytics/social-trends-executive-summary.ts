import { query } from "@/lib/db";
import {
  SocialTrendEvidenceHighlightRow,
  SocialTrendConcernProvinceRow,
  SocialTrendsExecutiveSummaryResponse,
  AINarrativeSynthesisRow,
} from "@/lib/analytics/types";
import { getProvinceLegacyCommunitySignals } from "@/lib/analytics/province-legacy-community-signals";

interface SummaryRow {
  totalCitizenMentions: number;
  totalCitizenDocuments: number;
  activeProvinceCount: number;
  averageNegativeShare: string | number | null;
}

interface IssueRow {
  issueFamily: string;
  mentionCount: number;
}

interface ProvinceRowDb {
  province: string;
  mentionCount: number;
  documentCount: number;
  avgNegativeShare: string | number;
  avgSentimentScore: string | number;
  dominantIssueFamily: string | null;
  intensityScore: string | number;
}

interface EvidenceHighlightRowDb {
  documentId: string;
  title: string;
  url: string;
  sourceName: string;
  sourceType: string;
  province: string;
  municipality: string | null;
  issueFamily: string;
  sentimentLabel: string;
  sentimentScore: string | number;
  confidence: string | number;
  excerpt: string;
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "string" ? Number(value) : value;
}

function toRiskLevel(
  negativeShare: number,
  mentionCount: number,
): "Low" | "Elevated" | "High" {
  if (negativeShare >= 0.7 || (negativeShare >= 0.55 && mentionCount >= 20)) {
    return "High";
  }

  if (negativeShare >= 0.45 || mentionCount >= 10) {
    return "Elevated";
  }

  return "Low";
}

export async function getSocialTrendsExecutiveSummary(
  province: string | null,
  days = 30,
): Promise<SocialTrendsExecutiveSummaryResponse> {
  const params = [province, days];

  const [
    summaryResult,
    issueResult,
    concernResult,
    evidenceResult,
    legacyCommunity,
    aiSynthesisResult,
  ] = await Promise.all([
    query<SummaryRow>(
      `
        select
          coalesce(sum(mention_count), 0)::int as "totalCitizenMentions",
          coalesce(sum(document_count), 0)::int as "totalCitizenDocuments",
          count(distinct province)::int as "activeProvinceCount",
          round(avg(negative_share)::numeric, 3) as "averageNegativeShare"
        from fact_citizen_voice_daily
        where ($1::text is null or province = $1)
          and day >= current_date - ($2::int - 1)
      `,
      params,
    ),
    query<IssueRow>(
      `
        select
          issue_family as "issueFamily",
          sum(mention_count)::int as "mentionCount"
        from fact_citizen_voice_daily
        where ($1::text is null or province = $1)
          and day >= current_date - ($2::int - 1)
        group by issue_family
        order by "mentionCount" desc, "issueFamily" asc
        limit 1
      `,
      params,
    ),
    query<ProvinceRowDb>(
      `
        with issue_ranked as (
          select
            province,
            issue_family,
            sum(mention_count)::int as mention_count,
            row_number() over (
              partition by province
              order by sum(mention_count) desc, issue_family asc
            ) as issue_rank
          from fact_citizen_voice_daily
          where ($1::text is null or province = $1)
            and day >= current_date - ($2::int - 1)
          group by province, issue_family
        )
        select
          fcvd.province,
          sum(fcvd.mention_count)::int as "mentionCount",
          sum(fcvd.document_count)::int as "documentCount",
          round(avg(fcvd.negative_share)::numeric, 3) as "avgNegativeShare",
          round(avg(fcvd.avg_sentiment_score)::numeric, 2) as "avgSentimentScore",
          max(ir.issue_family) filter (where ir.issue_rank = 1) as "dominantIssueFamily",
          round(
            (
              sum(fcvd.mention_count)::numeric
              * (0.5 + coalesce(avg(fcvd.negative_share), 0))
              * (1 + least(sum(fcvd.document_count)::numeric, 50) / 100)
            ),
            2
          ) as "intensityScore"
        from fact_citizen_voice_daily fcvd
        left join issue_ranked ir on ir.province = fcvd.province
        where ($1::text is null or fcvd.province = $1)
          and fcvd.day >= current_date - ($2::int - 1)
        group by fcvd.province
        order by "intensityScore" desc, "mentionCount" desc, fcvd.province asc
      `,
      params,
    ),
    query<EvidenceHighlightRowDb>(
      `
        select
          d.id::text as "documentId",
          d.title,
          d.url,
          src.name as "sourceName",
          src.source_type as "sourceType",
          cvm.province,
          cvm.municipality,
          cvm.issue_family as "issueFamily",
          cvm.sentiment_label as "sentimentLabel",
          cvm.sentiment_score as "sentimentScore",
          cvm.confidence,
          cvm.evidence_text as excerpt
        from citizen_voice_mentions cvm
        join documents d on d.id = cvm.document_id
        join sources src on src.id = d.source_id
        where ($1::text is null or cvm.province = $1)
          and coalesce(date(d.published_at), date(d.created_at)) >= current_date - ($2::int - 1)
        order by
          case when cvm.sentiment_label = 'negative' then 0 else 1 end asc,
          cvm.confidence desc,
          d.published_at desc nulls last,
          d.created_at desc
        limit 3
      `,
      params,
    ),
    getProvinceLegacyCommunitySignals(province, days),
    query<AINarrativeSynthesisRow>(
      `
        select 
          who_involved as "whoInvolved",
          what_happened as "whatHappened",
          why_it_happened as "whyItHappened",
          how_resolved_or_current as "howResolvedOrCurrent",
          when_timeline as "whenTimeline",
          source_evidence as "sourceEvidence"
        from ai_narrative_synthesis
        where lens = 'social' and ($1::text is null or province = $1)
        order by created_at desc
        limit 5
      `,
      [province]
    ),
  ]);

  const summary = summaryResult.rows[0] ?? {
    totalCitizenMentions: 0,
    totalCitizenDocuments: 0,
    activeProvinceCount: 0,
    averageNegativeShare: 0,
  };
  const dominantIssueFamily = issueResult.rows[0]?.issueFamily ?? null;
  const concernProvinces: SocialTrendConcernProvinceRow[] =
    concernResult.rows.map((row) => ({
      province: row.province,
      mentionCount: row.mentionCount,
      documentCount: row.documentCount,
      avgNegativeShare: toNumber(row.avgNegativeShare),
      avgSentimentScore: toNumber(row.avgSentimentScore),
      dominantIssueFamily: row.dominantIssueFamily,
      intensityScore: toNumber(row.intensityScore),
    }));
  const evidenceHighlights: SocialTrendEvidenceHighlightRow[] =
    evidenceResult.rows.map((row) => ({
      documentId: row.documentId,
      title: row.title,
      url: row.url,
      sourceName: row.sourceName,
      sourceType: row.sourceType,
      province: row.province,
      municipality: row.municipality,
      issueFamily: row.issueFamily,
      sentimentLabel: row.sentimentLabel,
      sentimentScore: toNumber(row.sentimentScore),
      confidence: toNumber(row.confidence),
      excerpt: row.excerpt,
    }));
  const hottestProvince = concernProvinces[0] ?? null;
  const blendedNegativeShare = Math.max(
    toNumber(summary.averageNegativeShare),
    legacyCommunity.summary.negativeShare,
  );
  const riskLevel = toRiskLevel(
    blendedNegativeShare,
    summary.totalCitizenMentions + legacyCommunity.summary.documentCount,
  );
  const strongestLegacyIssue = legacyCommunity.issues[0]?.issue ?? null;

  const narratives = [
    hottestProvince
      ? `${hottestProvince.province} is currently the hottest public-pressure province, with ${hottestProvince.mentionCount} governed citizen-voice mentions and ${Math.round(
          hottestProvince.avgNegativeShare * 100,
        )}% negative share, producing an intensity score of ${Math.round(hottestProvince.intensityScore)}.`
      : "No province currently has enough governed citizen-voice evidence to identify a clear hotspot.",
    dominantIssueFamily
      ? `${dominantIssueFamily} is the dominant public complaint family across the governed voice layer right now.`
      : "No dominant citizen complaint family could be identified yet.",
    legacyCommunity.summary.documentCount > 0
      ? `Imported community signals add ${legacyCommunity.summary.documentCount} legacy resident/civic documents${strongestLegacyIssue ? `, with ${strongestLegacyIssue} as the strongest recurring historical complaint family` : ""}, at average urgency ${legacyCommunity.summary.avgUrgency.toFixed(1)}.`
      : "Imported legacy community signals are still too thin to materially change the public-pressure readout.",
    riskLevel === "High"
      ? "The public narrative is currently hostile enough to warrant immediate executive monitoring and faster official response visibility."
      : riskLevel === "Elevated"
        ? "The public narrative is elevated and should be treated as an early-warning layer for intervention planning."
        : "The current public narrative layer is present but not yet intense enough to imply broad escalation on its own.",
  ];

  return {
    province,
    days,
    summary: {
      totalCitizenMentions: summary.totalCitizenMentions,
      totalCitizenDocuments: summary.totalCitizenDocuments,
      totalLegacyCommunityDocuments: legacyCommunity.summary.documentCount,
      activeProvinceCount: summary.activeProvinceCount,
      averageNegativeShare: toNumber(summary.averageNegativeShare),
      legacyNegativeShare: legacyCommunity.summary.negativeShare,
      legacyAvgUrgency: legacyCommunity.summary.avgUrgency,
      dominantIssueFamily,
      hottestProvince: hottestProvince?.province ?? null,
      narrativeRiskLevel: riskLevel,
    },
    narratives,
    aiSynthesis: aiSynthesisResult.rows,
    concernProvinces: concernProvinces.slice(0, province ? 1 : 6),
    evidenceHighlights,
    caveats: [
      "This dashboard is grounded in governed narrative and citizen-voice evidence, not direct full-platform social firehose coverage yet.",
      "Imported Firebase community signals are blended into the summary to capture longer-running resident complaint patterns alongside current citizen-voice evidence.",
      "Citizen voice remains an evidence and sentiment layer; it should accelerate attention, not replace official service or treasury facts.",
    ],
    trace: {
      tables: [
        "fact_citizen_voice_daily",
        "citizen_voice_mentions",
        "documents",
        "sources",
        "locations",
      ],
      query: `province=${province ?? "all"};days=${days}`,
    },
  };
}
