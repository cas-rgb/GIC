import { getLeadershipSentiment } from "@/lib/analytics/leadership-sentiment";
import { getMunicipalityRanking } from "@/lib/analytics/municipality-ranking";
import { getProvinceEvidenceBalance } from "@/lib/analytics/province-evidence-balance";
import { getProvinceLegacyCommunitySignals } from "@/lib/analytics/province-legacy-community-signals";
import { getProvinceSentiment } from "@/lib/analytics/province-sentiment";
import { getProvinceSummary } from "@/lib/analytics/province-summary";
import { getSocialTrendsExecutiveSummary } from "@/lib/analytics/social-trends-executive-summary";
import { getWaterReliability } from "@/lib/analytics/water-reliability";
import { getProvinceRecommendations } from "@/lib/recommendations/province-recommendations";
import { getSourceHealthSummary } from "@/lib/source-registry/health-queries";
import {
  BriefingOutput,
  ProvinceBriefingInput,
} from "@/lib/intelligence/briefing-contract";
import {
  buildDashboardBriefingPromptPackage,
  generateDashboardBriefing,
} from "@/lib/intelligence/generate-dashboard-briefing";

export interface ProvinceBriefingResponse {
  province: string;
  days: number;
  headline: string;
  publicPressure: {
    citizenMentions: number;
    citizenRiskLevel: "Low" | "Elevated" | "High";
    legacyDocumentCount: number;
    legacyAvgUrgency: number;
  };
  summary: string[];
  hotspots: string[];
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

export async function getProvinceBriefing(
  province: string,
  days = 30
): Promise<ProvinceBriefingResponse> {
  const [
    summary,
    municipalities,
    sentiment,
    evidenceBalance,
    leadership,
    recommendations,
    waterReliability,
    sourceHealth,
    citizenVoice,
    legacyCommunity,
  ] =
    await Promise.all([
      getProvinceSummary(province, days),
      getMunicipalityRanking(province),
      getProvinceSentiment(province, days),
      getProvinceEvidenceBalance(province, days),
      getLeadershipSentiment(province, days),
      getProvinceRecommendations(province, days),
      getWaterReliability(province, days),
      getSourceHealthSummary(province),
      getSocialTrendsExecutiveSummary(province, days),
      getProvinceLegacyCommunitySignals(province, days),
    ]);

  const topMunicipality = municipalities.rows[0] ?? null;
  const topLeader = leadership.leaders[0] ?? null;
  const topRecommendation = recommendations.recommendations[0] ?? null;
  const topComplaintTopic =
    sentiment.summary.topComplaintTopic ?? summary.summary.topPressureDomain ?? "service delivery";
  const topLegacyCommunityIssue = legacyCommunity.issues[0]?.issue ?? null;
  const topConcernTopic = topComplaintTopic;

  const headline = `${province} is ${summary.summary.escalationScore >= 50 ? "under elevated delivery pressure" : "showing manageable pressure"}, led by ${summary.summary.topPressureDomain ?? "mixed issue pressure"} in ${topMunicipality?.municipality ?? "the current coverage footprint"}.`;

  const summaryLines = [
    `${summary.summary.pressureCaseCount} governed pressure cases and ${summary.summary.highSeverityCount} high-severity cases were recorded in the last ${days} days.`,
    `Public sentiment is centering on ${topComplaintTopic}, with ${Math.round(sentiment.summary.negativeShare * 100)}% of the latest governed sentiment window negative.`,
    `Citizen voice recorded ${citizenVoice.summary.totalCitizenMentions} governed public-pressure mentions, with ${Math.round(
      citizenVoice.summary.averageNegativeShare * 100
    )}% average negative share and ${citizenVoice.summary.narrativeRiskLevel.toLowerCase()} narrative risk.`,
    `Imported community evidence adds ${legacyCommunity.summary.documentCount} legacy resident/civic signals, with ${Math.round(
      legacyCommunity.summary.negativeShare * 100
    )}% negative share${topLegacyCommunityIssue ? ` and ${topLegacyCommunityIssue} as the strongest recurring community issue` : ""}.`,
    `Evidence confidence is ${summary.summary.evidenceConfidenceScore}%, with ${Math.round(evidenceBalance.summary.officialDocumentShare)}% of the current evidence mix coming from official sources.`,
  ];

  if ((summary.summary.topPressureDomain ?? "").includes("Water")) {
    summaryLines.push(
      `Official water reliability is ${waterReliability.summary.waterReliabilityScore}, based on ${waterReliability.summary.officialDocumentCount} official water documents and ${waterReliability.summary.officialIncidentCount} official water incidents in scope.`
    );
  }

  const hotspots = [
    topMunicipality
      ? `${topMunicipality.municipality} is the highest-exposure municipality, with ${topMunicipality.pressureCaseCount} governed pressure cases and ${topMunicipality.dominantServiceDomain ?? "mixed"} as the dominant domain.`
      : `No municipality hotspot is dominant enough yet to displace the province-wide picture.`,
    `The dominant service pressure domain is ${summary.summary.topPressureDomain ?? "unresolved"}, and the peak protest-linked signal count is ${summary.summary.protestCount}.`,
    citizenVoice.summary.hottestProvince
      ? `Citizen-voice hotspotting still points to ${citizenVoice.summary.hottestProvince}, with ${citizenVoice.summary.dominantIssueFamily ?? "mixed complaints"} driving the loudest public-pressure layer.`
      : `Citizen-voice hotspotting is still too thin to override the operational hotspot view.`,
    legacyCommunity.summary.documentCount > 0
      ? `Legacy community signals still show ${topLegacyCommunityIssue ?? "recurring community complaints"} as a persistent issue family, with average urgency ${legacyCommunity.summary.avgUrgency.toFixed(1)} across the imported resident/civic evidence.`
      : `No imported legacy community signal layer is currently strong enough to change the province hotspot view.`,
  ];

  const interventions = recommendations.recommendations.slice(0, 3).map((item) => {
    const leaderSuffix = item.linkedLeaders.length > 0 ? ` Lead signal: ${item.linkedLeaders.join(", ")}.` : "";
    return `${item.title}: ${item.recommendedAction}${leaderSuffix}`;
  });

  const risks = [
    evidenceBalance.summary.officialDocumentShare < 40
      ? "Narrative evidence still outweighs official field verification, so the province should strengthen direct operational reporting."
      : "Official evidence coverage is substantial enough to support frontline operational decisions.",
    citizenVoice.summary.narrativeRiskLevel === "High"
      ? "Public complaint intensity is already high enough that slow visible response could escalate narrative pressure faster than formal systems register it."
      : "Citizen-voice intensity is present but not yet overwhelming enough to outweigh the operational and official evidence layers.",
    legacyCommunity.summary.documentCount >= 25 && legacyCommunity.summary.negativeShare >= 0.45
      ? `Imported community evidence shows entrenched resident pressure around ${topLegacyCommunityIssue ?? "recurring service complaints"}, so current frustration is not only a short-cycle narrative spike.`
      : "Imported legacy community evidence is present but not yet strong enough to change the current province risk posture on its own.",
    topLeader
      ? `${topLeader.leaderName} is the most exposed provincial leader in the current evidence window, linked primarily to ${topLeader.linkedIssues.join(", ") || "service delivery"}.`
      : "Leadership exposure remains thin because too few governed documents mention named provincial leaders directly.",
    topRecommendation
      ? `Immediate executive focus should start with: ${topRecommendation.title}.`
      : "No recommendation was strong enough to dominate the current province briefing.",
  ];

  const briefingInput: ProvinceBriefingInput = {
    dashboard: "province",
    geography: {
      province,
    },
    filters: {
      days,
      confidenceMode: "include_legacy",
    },
    summary: {
      pressureScore: summary.summary.pressureScore,
      escalationScore: summary.summary.escalationScore,
      concernVolume: sentiment.summary.mentionCount,
      topConcernTopic,
      concernVelocity: citizenVoice.summary.averageNegativeShare,
      alignmentScore: evidenceBalance.summary.officialDocumentShare,
      highestExposureMunicipality: topMunicipality?.municipality ?? null,
    },
    rankings: municipalities.rows.slice(0, 5).map((row) => ({
      municipality: row.municipality,
      issueVolume: row.pressureCaseCount,
      topIssue: row.dominantServiceDomain ?? null,
      pressureScore: row.riskScore,
    })),
    trends: sentiment.topics.slice(0, 5).map((row) => ({
      date: new Date().toISOString().slice(0, 10),
      issueFamily: row.topic,
      volume: row.mentionCount,
    })),
    issueMix: sentiment.topics.slice(0, 5).map((row) => ({
      serviceDomain: row.topic,
      concernShare: row.shareOfVoice,
      officialShare:
        summary.summary.topPressureDomain === row.topic
          ? evidenceBalance.summary.officialDocumentShare / 100
          : 0,
      alignmentGap: Math.abs(
        row.shareOfVoice -
          (summary.summary.topPressureDomain === row.topic
            ? evidenceBalance.summary.officialDocumentShare / 100
            : 0)
      ),
    })),
    evidence: [
      {
        title: "Province evidence balance",
        sourceName: "Governed analytics",
        sourceType: "official",
        excerpt: `${Math.round(
          evidenceBalance.summary.officialDocumentShare
        )}% of current evidence is official.`,
      },
      {
        title: "Citizen pressure summary",
        sourceName: "Citizen voice",
        sourceType: "citizen_voice",
        excerpt: `${citizenVoice.summary.totalCitizenMentions} governed mentions with ${Math.round(
          citizenVoice.summary.averageNegativeShare * 100
        )}% negative share.`,
      },
    ],
    caveats: [
      evidenceBalance.summary.officialDocumentShare < 40
        ? "Narrative evidence still outweighs official field verification in this province view."
        : "Official evidence coverage is substantial enough to support the province view.",
      legacyCommunity.summary.documentCount > 0
        ? "Legacy community evidence is included as support and should not override governed operational facts."
        : "Legacy community evidence is currently thin in this province view.",
    ],
  };

  const briefing = generateDashboardBriefing(briefingInput);
  const promptPackage = buildDashboardBriefingPromptPackage(briefingInput);

  return {
    province,
    days,
    headline,
    publicPressure: {
      citizenMentions: citizenVoice.summary.totalCitizenMentions,
      citizenRiskLevel: citizenVoice.summary.narrativeRiskLevel,
      legacyDocumentCount: legacyCommunity.summary.documentCount,
      legacyAvgUrgency: legacyCommunity.summary.avgUrgency,
    },
    summary: summaryLines,
    hotspots,
    interventions,
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
        "fact_citizen_voice_daily",
        "fact_source_reliability_daily",
        "fact_leadership_sentiment_daily",
        "sources",
      ],
      query: `${promptPackage.user}\nprovince=${province};days=${days}`,
    },
  };
}
