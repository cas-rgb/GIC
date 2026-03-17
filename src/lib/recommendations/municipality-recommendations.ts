import { getMunicipalityEvidenceBalance } from "@/lib/analytics/municipality-evidence-balance";
import { getMunicipalityCitizenVoiceSummary } from "@/lib/analytics/municipality-citizen-voice-summary";
import { getMunicipalityLegacyCommunitySignals } from "@/lib/analytics/municipality-legacy-community-signals";
import { getMunicipalLeadershipSentiment } from "@/lib/analytics/municipal-leadership-sentiment";
import { getMunicipalitySentiment } from "@/lib/analytics/municipality-sentiment";
import { getMunicipalitySummary } from "@/lib/analytics/municipality-summary";
import { getWaterReliability } from "@/lib/analytics/water-reliability";
import { ProvinceRecommendationsResponse, ProvinceRecommendation } from "@/lib/recommendations/types";

function buildMunicipalityAction(issue: string): string {
  if (issue.includes("Water")) {
    return "Mobilize municipal water repair teams, publish outage restoration checkpoints, and prioritize the highest-pressure wards linked to the current incident cluster.";
  }

  if (issue.includes("Road")) {
    return "Issue a visible municipal corridor repair plan, start rapid patching on the worst routes, and publish a 14-day maintenance schedule.";
  }

  if (issue.includes("Electricity")) {
    return "Stabilize the worst-affected municipal nodes, publish load interruption notices, and track repair completion daily until the backlog clears.";
  }

  return "Deploy a municipal service-recovery cell, verify issue logs ward by ward, and publish a visible response plan tied to the dominant complaint theme.";
}

function getMunicipalityOwnerOffice(issue: string, topLeader?: string | null): string {
  if (issue.includes("Water")) {
    return "Municipal Water and Sanitation Operations";
  }

  if (issue.includes("Road")) {
    return "Municipal Roads and Maintenance Unit";
  }

  if (issue.includes("Electricity")) {
    return "Municipal Electricity and Network Operations";
  }

  if (issue.includes("Evidence")) {
    return "Municipal Performance Monitoring Office";
  }

  return topLeader ? "Office of the Executive Mayor" : "Municipal Service Delivery War Room";
}

function getImpactTier(confidence: number, urgency: ProvinceRecommendation["urgency"]) {
  if (urgency === "High" && confidence >= 0.7) {
    return "Transformative" as const;
  }

  if (urgency === "High" || confidence >= 0.6) {
    return "High" as const;
  }

  return "Moderate" as const;
}

export async function getMunicipalityRecommendations(
  province: string,
  municipality: string,
  days = 30
): Promise<ProvinceRecommendationsResponse> {
  const [summary, sentiment, evidenceBalance, leadership, waterReliability, publicVoice, legacyCommunity] =
    await Promise.all([
      getMunicipalitySummary(province, municipality, days),
      getMunicipalitySentiment(province, municipality, days),
      getMunicipalityEvidenceBalance(province, municipality, days),
      getMunicipalLeadershipSentiment(province, municipality, days),
      getWaterReliability(province, days),
      getMunicipalityCitizenVoiceSummary(province, municipality, days),
      getMunicipalityLegacyCommunitySignals(province, municipality, days),
    ]);

  const issue =
    publicVoice.summary.dominantIssueFamily ??
    legacyCommunity.issues[0]?.issue ??
    summary.summary.topPressureDomain ??
    summary.summary.topComplaintTopic ??
    "Municipal Service Delivery";
  const topLeader = leadership.leaders[0] ?? null;
  const officialShare = Math.max(
    summary.summary.officialEvidenceShare,
    evidenceBalance.summary.officialDocumentShare
  );
  const legacyCommunityPressureHigh =
    legacyCommunity.summary.documentCount >= 10 &&
    legacyCommunity.summary.negativeShare >= 0.45;
  const recommendations: ProvinceRecommendation[] = [
    {
      title: `Stabilize ${issue} in ${municipality}`,
      issue,
      affectedMunicipalities: [municipality],
      recommendedAction: buildMunicipalityAction(issue),
      urgency: summary.summary.escalationScore >= 50 ? "High" : "Medium",
      impactTier: getImpactTier(
        Number(
          (
            ((summary.summary.evidenceConfidenceScore / 100) * 0.4 +
              Math.max(evidenceBalance.summary.weightedConfidence, 0.5) * 0.3 +
              (officialShare / 100) * 0.3)
          ).toFixed(2)
        ),
        summary.summary.escalationScore >= 50 ? "High" : "Medium"
      ),
      expectedImpact:
        "Reduce the most visible municipal pressure drivers and lower escalation risk in the current service hotspot.",
      ownerOffice: getMunicipalityOwnerOffice(issue, topLeader?.leaderName ?? null),
      evidenceCount: summary.summary.pressureCaseCount + publicVoice.summary.totalCitizenMentions,
      officialShare,
      publicPressureMentions: publicVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: ["municipality pressure", "evidence balance", "public voice"],
      confidence: Number(
        (
          ((summary.summary.evidenceConfidenceScore / 100) * 0.4 +
            Math.max(evidenceBalance.summary.weightedConfidence, 0.5) * 0.3 +
            (officialShare / 100) * 0.3)
        ).toFixed(2)
      ),
      linkedLeaders: topLeader ? [topLeader.leaderName] : [],
      rationale: `${municipality} is carrying the strongest governed pressure signal in this municipality view, with ${summary.summary.pressureCaseCount} pressure cases and ${publicVoice.summary.totalCitizenMentions} citizen-voice mentions in scope, backed by ${officialShare}% official evidence share.`,
    },
    {
      title: `Address the public narrative around ${publicVoice.summary.dominantIssueFamily ?? summary.summary.topComplaintTopic ?? issue}`,
      issue: publicVoice.summary.dominantIssueFamily ?? summary.summary.topComplaintTopic ?? issue,
      affectedMunicipalities: [municipality],
      recommendedAction:
        "Publish a municipality-specific action note, track complaints publicly, and pair communications with visible field action in the highest-friction communities.",
      urgency:
        sentiment.summary.negativeShare >= 0.35 || publicVoice.summary.narrativeRiskLevel === "High"
          ? "High"
          : "Medium",
      impactTier: getImpactTier(
        Number(
          (
            (Math.max(sentiment.summary.negativeShare, publicVoice.summary.averageNegativeShare, 0.2) * 0.5) +
            (Math.max(officialShare / 100, 0.25) * 0.5)
          ).toFixed(2)
        ),
        sentiment.summary.negativeShare >= 0.35 || publicVoice.summary.narrativeRiskLevel === "High"
          ? "High"
          : "Medium"
      ),
      expectedImpact:
        "Reduce public frustration and make the municipality response path visible to residents and local stakeholders.",
      ownerOffice: topLeader ? "Office of the Executive Mayor" : "Municipal Communications and Response Coordination",
      evidenceCount: sentiment.summary.mentionCount + publicVoice.summary.totalCitizenMentions,
      officialShare,
      publicPressureMentions: publicVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: ["municipality sentiment", "public voice", "official share"],
      confidence: Number(
        (
          (Math.max(sentiment.summary.negativeShare, publicVoice.summary.averageNegativeShare, 0.2) * 0.5) +
          (Math.max(officialShare / 100, 0.25) * 0.5)
        ).toFixed(2)
      ),
      linkedLeaders: topLeader ? [topLeader.leaderName] : [],
      rationale: `${sentiment.summary.mentionCount} governed sentiment mentions and ${publicVoice.summary.totalCitizenMentions} citizen-voice mentions are attached to ${municipality}, with ${Math.round(
        Math.max(sentiment.summary.negativeShare, publicVoice.summary.averageNegativeShare) * 100
      )}% negative pressure in the latest window.`,
    },
  ];

  if (publicVoice.summary.totalCitizenMentions >= 6 && publicVoice.summary.narrativeRiskLevel !== "Low") {
    recommendations.push({
      title: `Respond visibly to ${municipality}'s public complaint wave`,
      issue: publicVoice.summary.dominantIssueFamily ?? issue,
      affectedMunicipalities: [municipality],
      recommendedAction:
        "Pair a public municipal update with ward-level field action, publish response checkpoints, and route the most repeated complaint family into a named response owner within 48 hours.",
      urgency: publicVoice.summary.narrativeRiskLevel === "High" ? "High" : "Medium",
      impactTier: getImpactTier(
        Number(
          (
            Math.max(publicVoice.summary.averageNegativeShare, 0.25) * 0.6 +
            Math.max(officialShare / 100, 0.2) * 0.4
          ).toFixed(2)
        ),
        publicVoice.summary.narrativeRiskLevel === "High" ? "High" : "Medium"
      ),
      expectedImpact:
        "Reduce the risk that local frustration hardens into broader anti-leadership or anti-response sentiment.",
      ownerOffice: topLeader ? "Office of the Executive Mayor" : "Municipal Communications and Response Coordination",
      evidenceCount: publicVoice.summary.totalCitizenMentions,
      officialShare,
      publicPressureMentions: publicVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: ["public voice", "municipality sentiment"],
      confidence: Number(
        (
          Math.max(publicVoice.summary.averageNegativeShare, 0.25) * 0.6 +
          Math.max(officialShare / 100, 0.2) * 0.4
        ).toFixed(2)
      ),
      linkedLeaders: topLeader ? [topLeader.leaderName] : [],
      rationale: `${municipality} has ${publicVoice.summary.totalCitizenMentions} governed public-voice mentions with ${publicVoice.summary.narrativeRiskLevel.toLowerCase()} narrative risk centered on ${publicVoice.summary.dominantIssueFamily ?? issue}.`,
    });
  }

  if (legacyCommunityPressureHigh) {
    recommendations.push({
      title: `Address entrenched community complaints in ${municipality}`,
      issue: legacyCommunity.issues[0]?.issue ?? issue,
      affectedMunicipalities: [municipality],
      recommendedAction:
        "Verify the longest-running community complaints locally, publish ward or community response checkpoints, and route the recurring issue cluster into a named municipal response owner within 72 hours.",
      urgency: legacyCommunity.summary.avgUrgency >= 7 ? "High" : "Medium",
      impactTier: getImpactTier(
        Number(
          (
            Math.max(legacyCommunity.summary.negativeShare, 0.25) * 0.6 +
            Math.min(1, legacyCommunity.summary.documentCount / 25) * 0.4
          ).toFixed(2)
        ),
        legacyCommunity.summary.avgUrgency >= 7 ? "High" : "Medium"
      ),
      expectedImpact:
        "Reduce the gap between recurring community complaints and visible municipal response, especially where older civic evidence shows the issue is persistent rather than new.",
      ownerOffice: getMunicipalityOwnerOffice(
        legacyCommunity.issues[0]?.issue ?? issue,
        topLeader?.leaderName ?? null
      ),
      evidenceCount: legacyCommunity.summary.documentCount,
      officialShare,
      publicPressureMentions: publicVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: ["public voice", "legacy community signals", "municipality sentiment"],
      confidence: Number(
        (
          Math.max(legacyCommunity.summary.negativeShare, 0.25) * 0.6 +
          Math.min(1, legacyCommunity.summary.documentCount / 25) * 0.4
        ).toFixed(2)
      ),
      linkedLeaders: topLeader ? [topLeader.leaderName] : [],
      rationale: `${municipality} has ${legacyCommunity.summary.documentCount} imported community-signal documents with ${Math.round(
        legacyCommunity.summary.negativeShare * 100
      )}% negative share, showing that ${legacyCommunity.issues[0]?.issue ?? issue} is a persistent local complaint theme rather than a short-lived narrative spike.`,
    });
  }

  if (officialShare < 40) {
    recommendations.push({
      title: `Increase official verification for ${municipality}`,
      issue: "Evidence Quality",
      affectedMunicipalities: [municipality],
      recommendedAction:
        "Require the municipality to submit verified service logs and situation reports so local decisions are less dependent on narrative evidence alone.",
      urgency: "Medium",
      impactTier: getImpactTier(
        Number(evidenceBalance.summary.weightedConfidence.toFixed(2)),
        "Medium"
      ),
      expectedImpact:
        "Improve municipality decision confidence and reduce the gap between official and narrative evidence.",
      ownerOffice: getMunicipalityOwnerOffice("Evidence Quality", topLeader?.leaderName ?? null),
      evidenceCount: summary.summary.pressureCaseCount + sentiment.summary.mentionCount,
      officialShare,
      publicPressureMentions: publicVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: ["evidence balance", "source reliability"],
      confidence: Number(evidenceBalance.summary.weightedConfidence.toFixed(2)),
      linkedLeaders: topLeader ? [topLeader.leaderName] : [],
      rationale: `Only ${officialShare}% of the municipality evidence mix is official in the selected window.`,
    });
  }

  if (issue.includes("Water") && waterReliability.summary.waterReliabilityScore < 75) {
    recommendations.push({
      title: `Strengthen official water verification in ${municipality}`,
      issue: "Water Infrastructure",
      affectedMunicipalities: [municipality],
      recommendedAction:
        "Combine municipal repair logs with DWS-linked water evidence, publish locality-specific outage checkpoints, and reconcile field reports against the governed water evidence picture.",
      urgency: waterReliability.summary.waterReliabilityScore < 60 ? "High" : "Medium",
      impactTier: getImpactTier(
        Number(
          (
            (waterReliability.summary.avgSourceReliability * 0.5) +
            (officialShare / 100) * 0.5
          ).toFixed(2)
        ),
        waterReliability.summary.waterReliabilityScore < 60 ? "High" : "Medium"
      ),
      expectedImpact:
        "Reduce the risk of acting on narrative-only water pressure and improve the operational visibility of outages and repairs.",
      ownerOffice: getMunicipalityOwnerOffice("Water Infrastructure", topLeader?.leaderName ?? null),
      evidenceCount: waterReliability.summary.officialDocumentCount + waterReliability.summary.officialIncidentCount,
      officialShare,
      publicPressureMentions: publicVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: ["water reliability", "official share"],
      confidence: Number(
        (
          (waterReliability.summary.avgSourceReliability * 0.5) +
          (officialShare / 100) * 0.5
        ).toFixed(2)
      ),
      linkedLeaders: topLeader ? [topLeader.leaderName] : [],
      rationale: `${province} has an official water reliability score of ${waterReliability.summary.waterReliabilityScore}, which is still too low to rely on without stronger municipal verification.`,
    });
  }

  if (topLeader && topLeader.sentimentScore <= 45) {
    recommendations.push({
      title: `Protect local leadership credibility in ${municipality}`,
      issue: topLeader.linkedIssues[0] ?? issue,
      affectedMunicipalities: [municipality],
      recommendedAction:
        "Tie the mayoral office to a visible corrective action plan, publish milestone checkpoints, and align public communication with field delivery on the dominant issue.",
      urgency: "Medium",
      impactTier: getImpactTier(Number(topLeader.confidence.toFixed(2)), "Medium"),
      expectedImpact:
        "Reduce mayor-to-failure association and shift local narrative pressure toward visible response.",
      ownerOffice: topLeader.office,
      evidenceCount: topLeader.mentionCount,
      officialShare,
      publicPressureMentions: publicVoice.summary.totalCitizenMentions,
      legacyCommunityDocuments: legacyCommunity.summary.documentCount,
      traceChips: ["municipal leadership sentiment", "municipality sentiment"],
      confidence: Number(topLeader.confidence.toFixed(2)),
      linkedLeaders: [topLeader.leaderName],
      rationale: `${topLeader.leaderName} is the most exposed local leader in the current municipality window and is being associated with ${topLeader.linkedIssues.join(", ") || issue}.`,
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
        "documents",
        "fact_municipal_leadership_sentiment_daily",
        "fact_water_reliability_daily",
        "fact_citizen_voice_daily",
      ],
      query: `province=${province};municipality=${municipality};days=${days}`,
    },
  };
}
