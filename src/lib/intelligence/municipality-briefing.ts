import { getMunicipalityEvidenceBalance } from "@/lib/analytics/municipality-evidence-balance";
import { getMunicipalityCitizenVoiceSummary } from "@/lib/analytics/municipality-citizen-voice-summary";
import { getMunicipalityLegacyCommunitySignals } from "@/lib/analytics/municipality-legacy-community-signals";
import { getMunicipalLeadershipSentiment } from "@/lib/analytics/municipal-leadership-sentiment";
import { getMunicipalitySentiment } from "@/lib/analytics/municipality-sentiment";
import { getMunicipalitySummary } from "@/lib/analytics/municipality-summary";
import { getWardCoverage } from "@/lib/analytics/ward-coverage";
import { getWaterReliability } from "@/lib/analytics/water-reliability";
import { getMunicipalityRecommendations } from "@/lib/recommendations/municipality-recommendations";
import { ProvinceRecommendation } from "@/lib/recommendations/types";
import { getSourceHealthSummary } from "@/lib/source-registry/health-queries";
import {
  BriefingOutput,
  MunicipalityWardsBriefingInput,
} from "@/lib/intelligence/briefing-contract";
import {
  buildDashboardBriefingPromptPackage,
  generateDashboardBriefing,
} from "@/lib/intelligence/generate-dashboard-briefing";

export interface MunicipalityBriefingResponse {
  province: string;
  municipality: string;
  days: number;
  headline: string;
  publicPressure: {
    citizenMentions: number;
    citizenRiskLevel: "Low" | "Elevated" | "High";
    legacyDocumentCount: number;
    legacyAvgUrgency: number;
  };
  summary: string[];
  interventions: string[];
  risks: string[];
  freshness: {
    latestSourceSuccessAt: string | null;
    healthyConnectorCount: number;
    staleConnectorCount: number;
    failingConnectorCount: number;
  };
  briefing: BriefingOutput;
  trace: {
    sources: string[];
    query: string;
  };
}

export async function getMunicipalityBriefing(
  province: string,
  municipality: string,
  days = 30
): Promise<MunicipalityBriefingResponse> {
  const [
    summary,
    sentiment,
    evidenceBalance,
    leadership,
    recommendations,
    waterReliability,
    sourceHealth,
    publicVoice,
    legacyCommunity,
    wardCoverage,
  ] = await Promise.all([
      getMunicipalitySummary(province, municipality, days),
      getMunicipalitySentiment(province, municipality, days),
      getMunicipalityEvidenceBalance(province, municipality, days),
      getMunicipalLeadershipSentiment(province, municipality, days),
      getMunicipalityRecommendations(province, municipality, days),
      getWaterReliability(province, days),
      getSourceHealthSummary(province),
      getMunicipalityCitizenVoiceSummary(province, municipality, days),
      getMunicipalityLegacyCommunitySignals(province, municipality, days),
      getWardCoverage(province, municipality),
    ]);

  const topLeader = leadership.leaders[0] ?? null;
  const topRecommendation = recommendations.recommendations[0] ?? null;
  const topIssue =
    publicVoice.summary.dominantIssueFamily ??
    legacyCommunity.issues[0]?.issue ??
    summary.summary.topPressureDomain ??
    summary.summary.topComplaintTopic ??
    "municipal service delivery";
  const officialShare = Math.max(
    summary.summary.officialEvidenceShare,
    evidenceBalance.summary.officialDocumentShare
  );
  const summaryLines = [
    `${summary.summary.pressureCaseCount} governed pressure cases and ${summary.summary.highSeverityCount} high-severity cases are in the current municipality window.`,
    `${Math.round(sentiment.summary.negativeShare * 100)}% of the latest governed sentiment window is negative, with ${summary.summary.topComplaintTopic ?? topIssue} carrying the strongest complaint signal.`,
    `${summary.summary.evidenceConfidenceScore}% evidence confidence is backed by ${Math.round(officialShare)}% official local evidence share.`,
    `${publicVoice.summary.totalCitizenMentions} governed citizen-voice mentions are attached to ${municipality}, with ${Math.round(
      publicVoice.summary.averageNegativeShare * 100
    )}% negative share and ${publicVoice.summary.narrativeRiskLevel.toLowerCase()} narrative risk.`,
    `Imported community evidence adds ${legacyCommunity.summary.documentCount} legacy resident/civic signals, with ${Math.round(
      legacyCommunity.summary.negativeShare * 100
    )}% negative share${legacyCommunity.issues[0]?.issue ? ` and ${legacyCommunity.issues[0]?.issue} as the strongest recurring local issue` : ""}.`,
    `Ward readiness is ${wardCoverage.summary.wardReadinessLabel.toLowerCase()}, with ${wardCoverage.summary.wardCount} formal ward rows and ${wardCoverage.summary.wardReadyCommunityCount} ward-ready community rows available for local drilldown.`,
  ];

  if ((topIssue ?? "").includes("Water")) {
    summaryLines.push(
      `${province} official water reliability is ${waterReliability.summary.waterReliabilityScore}, which should be used to verify local water pressure before intervention decisions are finalized.`
    );
  }

  const risks = [
    topLeader
      ? `${topLeader.leaderName} is the most exposed local leader in the current municipality window, linked to ${topLeader.linkedIssues.join(", ") || topIssue}.`
      : "Local leadership exposure is still thin because too few governed documents mention a verified mayor alias directly.",
    topRecommendation
      ? `Priority municipal action should start with: ${topRecommendation.recommendedAction}`
      : "No single intervention dominated the current municipality window strongly enough to lead the briefing.",
    officialShare < 40
      ? "Narrative evidence still outweighs official local reporting, so operational verification should be tightened."
      : "Official evidence coverage is strong enough to support local operational action.",
  ];

  if (publicVoice.summary.totalCitizenMentions >= 6) {
    risks.push(
      `Public complaint pressure is material in ${municipality}, dominated by ${publicVoice.summary.dominantIssueFamily ?? topIssue}, and should be treated as a local visibility risk if response stays slow.`
    );
  }

  if (legacyCommunity.summary.documentCount >= 10 && legacyCommunity.summary.negativeShare >= 0.45) {
    risks.push(
      `Imported community evidence shows entrenched local pressure around ${legacyCommunity.issues[0]?.issue ?? topIssue}, so the current complaint picture is not only a short-cycle narrative spike.`
    );
  }

  if (wardCoverage.summary.wardReadinessLabel === "Community-led") {
    risks.push(
      `Formal ward mapping is still sparse in ${municipality}, so local intervention design should use community-level fallback evidence until ward-coded reporting improves.`
    );
  } else if (wardCoverage.summary.wardReadinessLabel === "Sparse") {
    risks.push(
      `Ward-level visibility is still sparse in ${municipality}, so hyperlocal action should be handled cautiously until more local reporting is mapped.`
    );
  }

  if ((topIssue ?? "").includes("Water") && waterReliability.summary.waterReliabilityScore < 75) {
    risks.push(
      `Water-specific decisions should be handled cautiously because the current official water reliability score is only ${waterReliability.summary.waterReliabilityScore}.`
    );
  }

  const issueMix = [
    {
      serviceDomain: summary.summary.topPressureDomain ?? "Mixed service delivery",
      volume: summary.summary.pressureCaseCount,
      severe: summary.summary.highSeverityCount,
      protests: summary.summary.protestCount,
      responses: summary.summary.responseCount,
    },
  ];

  const rankingRows = [
    ...wardCoverage.rows.slice(0, 5).map((row) => ({
      wardOrCommunity: row.ward,
      type: "ward" as const,
      issueVolume: row.pressureCaseCount,
      urgency: row.sentimentMentionCount,
      dominantIssue: topIssue,
    })),
    ...wardCoverage.communityRows.slice(0, 3).map((row) => ({
      wardOrCommunity: row.community,
      type: "community" as const,
      issueVolume: row.documentCount,
      urgency: row.avgUrgency,
      dominantIssue: row.dominantIssue,
    })),
  ];

  const briefingInput: MunicipalityWardsBriefingInput = {
    dashboard: "municipality_wards",
    geography: {
      province,
      municipality,
    },
    filters: {
      days,
      confidenceMode: "include_legacy",
    },
    summary: {
      municipalityPressureScore: summary.summary.pressureScore,
      escalationScore: summary.summary.escalationScore,
      topIssue,
      issueVolume: summary.summary.pressureCaseCount,
      wardReadinessLabel: wardCoverage.summary.wardReadinessLabel as
        | "Operational"
        | "Partial"
        | "Registry Only"
        | "Community-led"
        | "Sparse",
      registryWardCount: wardCoverage.summary.registryWardCount,
      evidenceBackedWardCount: wardCoverage.summary.evidenceBackedWardCount,
    },
    rankings: rankingRows,
    trends: sentiment.trend.slice(-10).map((row) => ({
      date: row.date,
      municipality,
      serviceDomain: topIssue,
      issueVolume: row.mentionCount,
    })),
    issueMix,
    evidence: [
      {
        title: "Local citizen voice",
        sourceName: "Citizen voice",
        sourceType: "citizen_voice",
        excerpt: `${publicVoice.summary.totalCitizenMentions} governed mentions with ${Math.round(
          publicVoice.summary.averageNegativeShare * 100
        )}% negative share.`,
      },
      {
        title: "Ward coverage",
        sourceName: "Location registry",
        sourceType: "registry",
        excerpt: `${wardCoverage.summary.registryWardCount} known wards, ${wardCoverage.summary.evidenceBackedWardCount} currently evidence-backed.`,
      },
    ],
    caveats: [
      ...wardCoverage.caveats,
      officialShare < 40
        ? "Narrative evidence still outweighs official local reporting in this municipality view."
        : "Official local reporting is strong enough to support this municipality view.",
    ].slice(0, 3),
  };

  const briefing = generateDashboardBriefing(briefingInput);
  const promptPackage = buildDashboardBriefingPromptPackage(briefingInput);

  return {
    province,
    municipality,
    days,
    headline: `${municipality} is carrying ${summary.summary.escalationScore >= 50 ? "elevated" : "moderate"} local pressure, centered on ${topIssue}.`,
    publicPressure: {
      citizenMentions: publicVoice.summary.totalCitizenMentions,
      citizenRiskLevel: publicVoice.summary.narrativeRiskLevel,
      legacyDocumentCount: legacyCommunity.summary.documentCount,
      legacyAvgUrgency: legacyCommunity.summary.avgUrgency,
    },
    summary: summaryLines,
    interventions: recommendations.recommendations
      .slice(0, 3)
      .map((item: ProvinceRecommendation) => item.title),
    risks,
    freshness: {
      latestSourceSuccessAt: sourceHealth.totals.latestSuccessAt,
      healthyConnectorCount: sourceHealth.totals.healthyCount,
      staleConnectorCount: sourceHealth.totals.staleCount,
      failingConnectorCount: sourceHealth.totals.failingCount,
    },
    briefing,
    trace: {
      sources: [
        "fact_service_pressure_daily",
        "fact_sentiment_daily",
        "fact_municipal_leadership_sentiment_daily",
        "documents",
        "fact_water_reliability_daily",
        "fact_citizen_voice_daily",
        "locations",
        "sources",
      ],
      query: `${promptPackage.user}\nprovince=${province};municipality=${municipality};days=${days}`,
    },
  };
}
