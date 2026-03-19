import { getLeadershipSentiment } from "@/lib/analytics/leadership-sentiment";
import { getMunicipalityRanking } from "@/lib/analytics/municipality-ranking";
import { getProvinceEvidenceBalance } from "@/lib/analytics/province-evidence-balance";
import { getProvinceLegacyCommunitySignals } from "@/lib/analytics/province-legacy-community-signals";
import { getProvinceSentiment } from "@/lib/analytics/province-sentiment";
import { getProvinceSummary } from "@/lib/analytics/province-summary";
import { getSocialTrendsExecutiveSummary } from "@/lib/analytics/social-trends-executive-summary";
import { getWaterReliability } from "@/lib/analytics/water-reliability";
import {
  ProvinceRecommendation,
  ProvinceRecommendationsResponse,
} from "@/lib/recommendations/types";

function buildOperationalAction(issue: string): string {
  if (issue.includes("Water")) {
    return "Deploy repair and tanker-response teams, publish outage restoration windows, and escalate asset maintenance in the top municipality within 72 hours.";
  }

  if (issue.includes("Road")) {
    return "Prioritize rapid pothole and corridor repair on the highest-pressure routes, then publish a visible maintenance schedule for the top municipality.";
  }

  if (issue.includes("Electricity")) {
    return "Dispatch technical fault teams, stabilize the worst-affected nodes, and publish a municipal recovery timetable with daily updates.";
  }

  if (issue.includes("Governance")) {
    return "Stand up a provincial intervention cell, require verified municipal response logs, and clear the highest-risk service backlog within 7 days.";
  }

  return "Deploy a province-led intervention team, verify the operational backlog, and publish a visible recovery plan tied to the highest-pressure area.";
}

function getProvinceOwnerOffice(issue: string, hasLeader: boolean): string {
  if (issue.includes("Water")) {
    return "Provincial Water and Infrastructure Command";
  }

  if (issue.includes("Road")) {
    return "Provincial Roads and Transport Operations";
  }

  if (issue.includes("Electricity")) {
    return "Provincial Energy and Municipal Infrastructure Desk";
  }

  if (issue.includes("Governance")) {
    return hasLeader
      ? "Office of the Premier"
      : "Provincial Governance Intervention Cell";
  }

  return hasLeader
    ? "Office of the Premier"
    : "Provincial Service Delivery War Room";
}

function getImpactTier(
  confidence: number,
  urgency: ProvinceRecommendation["urgency"],
) {
  if (urgency === "High" && confidence >= 0.7) {
    return "Transformative" as const;
  }

  if (urgency === "High" || confidence >= 0.6) {
    return "High" as const;
  }

  return "Moderate" as const;
}

export async function getProvinceRecommendations(
  province: string,
  days = 30,
): Promise<ProvinceRecommendationsResponse> {
  const [
    summary,
    municipalities,
    sentiment,
    evidenceBalance,
    leadership,
    waterReliability,
    citizenVoice,
    legacyCommunity,
  ] = await Promise.all([
    getProvinceSummary(province, days),
    getMunicipalityRanking(province),
    getProvinceSentiment(province, days),
    getProvinceEvidenceBalance(province, days),
    getLeadershipSentiment(province, days),
    getWaterReliability(province, days),
    getSocialTrendsExecutiveSummary(province, days),
    getProvinceLegacyCommunitySignals(province, days),
  ]);

  const topMunicipality = municipalities.rows[0] ?? null;
  const topLeader = leadership.leaders[0] ?? null;
  const topComplaintTopic =
    sentiment.summary.topComplaintTopic ??
    summary.summary.topPressureDomain ??
    "Municipal Governance";
  const dominantCitizenIssue =
    citizenVoice.summary.dominantIssueFamily ?? topComplaintTopic;
  const dominantCommunityIssue =
    legacyCommunity.issues[0]?.issue ?? dominantCitizenIssue;
  const officialShare = evidenceBalance.summary.officialDocumentShare;
  const legacyCommunityPressureHigh =
    legacyCommunity.summary.documentCount >= 25 &&
    legacyCommunity.summary.negativeShare >= 0.45;
  const recommendations: ProvinceRecommendation[] = [];

  if (topMunicipality || summary.summary.topPressureDomain) {
    recommendations.push({
      title: `Stabilize ${summary.summary.topPressureDomain ?? "service delivery"} in ${topMunicipality?.municipality ?? province}`,
      issue: summary.summary.topPressureDomain ?? "Service Delivery",
      affectedMunicipalities: topMunicipality
        ? [topMunicipality.municipality]
        : [],
      recommendedAction: buildOperationalAction(
        summary.summary.topPressureDomain ?? "Service Delivery",
      ),
      urgency: summary.summary.escalationScore >= 50 ? "High" : "Medium",
      impactTier: getImpactTier(
        Number(
          (
            (summary.summary.evidenceConfidenceScore / 100 +
              (topMunicipality?.confidence ?? 0.6)) /
            2
          ).toFixed(2),
        ),
        summary.summary.escalationScore >= 50 ? "High" : "Medium",
      ),
      expectedImpact:
        "Reduce the highest visible operational pressure and lower near-term protest or escalation risk in the most exposed municipality.",
      ownerOffice: getProvinceOwnerOffice(
        summary.summary.topPressureDomain ?? "Service Delivery",
        Boolean(topLeader),
      ),
      evidenceCount: summary.summary.pressureCaseCount,
      officialShare,
      publicPressureMentions: citizenVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: [
        "pressure facts",
        "municipality ranking",
        "evidence confidence",
      ],
      confidence: Number(
        (
          (summary.summary.evidenceConfidenceScore / 100 +
            (topMunicipality?.confidence ?? 0.6)) /
          2
        ).toFixed(2),
      ),
      linkedLeaders: topLeader ? [topLeader.leaderName] : [],
      rationale: `Pressure is concentrated in ${topMunicipality?.municipality ?? province} and the dominant issue is ${summary.summary.topPressureDomain ?? "mixed service pressure"}.`,
    });
  }

  recommendations.push({
    title: `Run a visible public response on ${topComplaintTopic}`,
    issue: dominantCitizenIssue,
    affectedMunicipalities: topMunicipality
      ? [topMunicipality.municipality]
      : [],
    recommendedAction:
      "Issue a 7-day public action note, publish municipal progress checkpoints, and route leadership communication to the most affected communities.",
    urgency:
      sentiment.summary.negativeShare >= 0.35 ||
      citizenVoice.summary.narrativeRiskLevel === "High"
        ? "High"
        : "Medium",
    impactTier: getImpactTier(
      Number(
        (
          (Math.max(
            sentiment.summary.negativeShare,
            sentiment.summary.positiveShare,
          ) +
            citizenVoice.summary.averageNegativeShare +
            0.5) /
          2.5
        ).toFixed(2),
      ),
      sentiment.summary.negativeShare >= 0.35 ||
        citizenVoice.summary.narrativeRiskLevel === "High"
        ? "High"
        : "Medium",
    ),
    expectedImpact:
      "Reduce narrative escalation, show visible leadership intent, and improve public trust in the province response path.",
    ownerOffice: topLeader
      ? topLeader.office
      : "Provincial Communications and Response Coordination",
    evidenceCount:
      sentiment.summary.mentionCount +
      citizenVoice.summary.totalCitizenMentions,
    officialShare,
    publicPressureMentions: citizenVoice.summary.totalCitizenMentions,
    legacyCommunityDocuments: legacyCommunity.summary.documentCount,
    traceChips: ["sentiment facts", "public voice", "leadership sentiment"],
    confidence: Number(
      (
        (Math.max(
          sentiment.summary.negativeShare,
          sentiment.summary.positiveShare,
        ) +
          citizenVoice.summary.averageNegativeShare +
          0.5) /
        2.5
      ).toFixed(2),
    ),
    linkedLeaders: topLeader ? [topLeader.leaderName] : [],
    rationale: `Public pressure is clustering around ${dominantCitizenIssue} with ${sentiment.summary.mentionCount} governed sentiment mentions and ${citizenVoice.summary.totalCitizenMentions} citizen-voice mentions in the selected window.`,
  });

  if (
    citizenVoice.summary.totalCitizenMentions >= 12 &&
    citizenVoice.summary.narrativeRiskLevel !== "Low"
  ) {
    recommendations.push({
      title: `Respond visibly to ${dominantCitizenIssue} public pressure`,
      issue: dominantCitizenIssue,
      affectedMunicipalities: topMunicipality
        ? [topMunicipality.municipality]
        : [],
      recommendedAction:
        "Stand up a public-facing response line for the dominant complaint family, publish daily response proof, and route issue updates through the highest-pressure municipalities first.",
      urgency:
        citizenVoice.summary.narrativeRiskLevel === "High" ? "High" : "Medium",
      impactTier: getImpactTier(
        Number(
          (
            (citizenVoice.summary.averageNegativeShare +
              Math.min(1, citizenVoice.summary.totalCitizenMentions / 40)) /
            2
          ).toFixed(2),
        ),
        citizenVoice.summary.narrativeRiskLevel === "High" ? "High" : "Medium",
      ),
      expectedImpact:
        "Reduce the gap between public complaint pressure and visible executive response, especially where social and narrative evidence are moving faster than formal reporting.",
      ownerOffice: topLeader
        ? topLeader.office
        : "Provincial Communications and Response Coordination",
      evidenceCount: citizenVoice.summary.totalCitizenMentions,
      officialShare,
      publicPressureMentions: citizenVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: ["public voice", "sentiment facts", "evidence balance"],
      confidence: Number(
        (
          (citizenVoice.summary.averageNegativeShare +
            Math.min(1, citizenVoice.summary.totalCitizenMentions / 40)) /
          2
        ).toFixed(2),
      ),
      linkedLeaders: topLeader ? [topLeader.leaderName] : [],
      rationale: `${province} has ${citizenVoice.summary.totalCitizenMentions} governed citizen-voice mentions with ${Math.round(
        citizenVoice.summary.averageNegativeShare * 100,
      )}% average negative share, making the public narrative an immediate intervention signal.`,
    });
  }

  if (legacyCommunityPressureHigh) {
    recommendations.push({
      title: `Address entrenched community pressure around ${dominantCommunityIssue}`,
      issue: dominantCommunityIssue,
      affectedMunicipalities: topMunicipality
        ? [topMunicipality.municipality]
        : [],
      recommendedAction:
        "Use ward and municipal operations teams to verify the recurring community complaints, publish response proof in the affected communities, and route executive follow-up through the longest-running complaint clusters first.",
      urgency: legacyCommunity.summary.avgUrgency >= 7 ? "High" : "Medium",
      impactTier: getImpactTier(
        Number(
          (
            (legacyCommunity.summary.negativeShare +
              Math.min(1, legacyCommunity.summary.documentCount / 60)) /
            2
          ).toFixed(2),
        ),
        legacyCommunity.summary.avgUrgency >= 7 ? "High" : "Medium",
      ),
      expectedImpact:
        "Reduce the gap between long-running community complaints and visible provincial response, especially where legacy civic evidence shows pressure persisting over time.",
      ownerOffice: getProvinceOwnerOffice(
        dominantCommunityIssue,
        Boolean(topLeader),
      ),
      evidenceCount: legacyCommunity.summary.documentCount,
      officialShare,
      publicPressureMentions: citizenVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: [
        "public voice",
        "legacy community signals",
        "evidence balance",
      ],
      confidence: Number(
        (
          (legacyCommunity.summary.negativeShare +
            Math.min(1, legacyCommunity.summary.documentCount / 60)) /
          2
        ).toFixed(2),
      ),
      linkedLeaders: topLeader ? [topLeader.leaderName] : [],
      rationale: `${province} has ${legacyCommunity.summary.documentCount} imported community-signal documents with ${Math.round(
        legacyCommunity.summary.negativeShare * 100,
      )}% negative share, indicating older resident complaint pressure is still materially relevant to the current decision view.`,
    });
  }

  if (officialShare < 40) {
    recommendations.push({
      title: "Increase official field verification behind the province view",
      issue: "Evidence Quality",
      affectedMunicipalities: topMunicipality
        ? [topMunicipality.municipality]
        : [],
      recommendedAction:
        "Require department and municipal situation reports for the top issue clusters within 48 hours so the decision view is less dependent on narrative sources alone.",
      urgency: "Medium",
      impactTier: getImpactTier(
        Number((evidenceBalance.summary.weightedConfidence || 0).toFixed(2)),
        "Medium",
      ),
      expectedImpact:
        "Raise decision confidence, reduce the risk of acting on partial evidence, and improve the official evidence share behind the dashboard.",
      ownerOffice: "Provincial Performance Monitoring and Evaluation",
      evidenceCount:
        summary.summary.pressureCaseCount + sentiment.summary.mentionCount,
      officialShare,
      publicPressureMentions: citizenVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: ["evidence balance", "source reliability", "pressure facts"],
      confidence: Number(
        (evidenceBalance.summary.weightedConfidence || 0).toFixed(2),
      ),
      linkedLeaders: topLeader ? [topLeader.leaderName] : [],
      rationale: `Only ${officialShare}% of the current province evidence mix is official, so operational decisions still need stronger field verification.`,
    });
  }

  if (
    (summary.summary.topPressureDomain ?? "").includes("Water") &&
    waterReliability.summary.waterReliabilityScore < 75
  ) {
    recommendations.push({
      title: "Stabilize official water visibility and response",
      issue: "Water Infrastructure",
      affectedMunicipalities: topMunicipality
        ? [topMunicipality.municipality]
        : [],
      recommendedAction:
        "Use DWS and province response teams to publish a visible water-status picture, verify outages directly, and align emergency repair action with the weakest official water coverage areas.",
      urgency:
        waterReliability.summary.waterReliabilityScore < 60 ? "High" : "Medium",
      impactTier: getImpactTier(
        Number(
          (
            (waterReliability.summary.avgSourceReliability +
              summary.summary.officialEvidenceShare / 100) /
            2
          ).toFixed(2),
        ),
        waterReliability.summary.waterReliabilityScore < 60 ? "High" : "Medium",
      ),
      expectedImpact:
        "Improve water-specific decision confidence and reduce the chance that water intervention is driven only by narrative evidence.",
      ownerOffice: "Provincial Water and Infrastructure Command",
      evidenceCount:
        waterReliability.summary.officialDocumentCount +
        waterReliability.summary.officialIncidentCount,
      officialShare,
      publicPressureMentions: citizenVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: ["water reliability", "official evidence share"],
      confidence: Number(
        (
          (waterReliability.summary.avgSourceReliability +
            summary.summary.officialEvidenceShare / 100) /
          2
        ).toFixed(2),
      ),
      linkedLeaders: topLeader ? [topLeader.leaderName] : [],
      rationale: `Official water reliability for ${province} is ${waterReliability.summary.waterReliabilityScore}, based on ${waterReliability.summary.officialDocumentCount} official water documents in the current window.`,
    });
  }

  if (topLeader && topLeader.sentimentScore <= 45) {
    recommendations.push({
      title: `Protect leadership credibility around ${topLeader.linkedIssues[0] ?? "service delivery"}`,
      issue: topLeader.linkedIssues[0] ?? "Leadership Exposure",
      affectedMunicipalities: topMunicipality
        ? [topMunicipality.municipality]
        : [],
      recommendedAction:
        "Tie the premier or leadership office to a specific corrective action, visible milestone, and public accountability checkpoint in the affected area.",
      urgency: "Medium",
      impactTier: getImpactTier(
        Number(topLeader.confidence.toFixed(2)),
        "Medium",
      ),
      expectedImpact:
        "Reduce leader-to-failure association and shift the narrative from blame toward visible intervention.",
      ownerOffice: topLeader.office,
      evidenceCount: topLeader.mentionCount,
      officialShare,
      publicPressureMentions: citizenVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: ["leadership sentiment", "sentiment facts"],
      confidence: Number(topLeader.confidence.toFixed(2)),
      linkedLeaders: [topLeader.leaderName],
      rationale: `${topLeader.leaderName} is currently being linked to ${topLeader.linkedIssues.join(", ") || "service delivery"} in the governed leadership layer.`,
    });
  }

  return {
    province,
    days,
    recommendations: recommendations.slice(0, 4),
    trace: {
      sources: [
        "fact_service_pressure_daily",
        "fact_sentiment_daily",
        "fact_citizen_voice_daily",
        "fact_source_reliability_daily",
        "fact_leadership_sentiment_daily",
      ],
      query: `province=${province};days=${days}`,
    },
  };
}
