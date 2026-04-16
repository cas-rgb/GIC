import {
  BriefingOutput,
  DashboardBriefingInput,
  DashboardBriefingKind,
  DashboardBriefingPromptPackage,
} from "@/lib/intelligence/briefing-contract";

function geographyLabel(input: DashboardBriefingInput): string {
  const parts = [
    input.geography.ward,
    input.geography.municipality,
    input.geography.province,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "the selected coverage area";
}

function dashboardLabel(kind: DashboardBriefingKind): string {
  switch (kind) {
    case "province":
      return "State of the Province";
    case "leadership":
      return "Leadership Sentiment";
    case "municipality_wards":
      return "State of the Municipality & Wards";
    case "trends":
      return "Social Media, News & Other Trends";
    case "investor":
      return "Investor Profiling";
  }
}

function confidenceNote(input: DashboardBriefingInput): string {
  if (input.caveats.length === 0) {
    return "Grounded in governed filtered metrics and evidence for the selected view.";
  }

  return input.caveats[0];
}

function topFinding(input: DashboardBriefingInput): string {
  switch (input.dashboard) {
    case "province":
      return `${input.summary.topConcernTopic ?? "Mixed service delivery"} is the top province issue, with pressure centered on ${input.summary.highestExposureMunicipality ?? "the current municipality footprint"}.`;
    case "leadership":
      return `${input.summary.highestRiskLeader ?? input.summary.highestExposureLeader ?? "No single leader"} is carrying the sharpest current reputation pressure.`;
    case "municipality_wards":
      return `${input.summary.topIssue ?? "Mixed local service delivery"} is the dominant local issue, with ward readiness currently marked ${input.summary.wardReadinessLabel.toLowerCase()}.`;
    case "trends":
      return `${input.summary.dominantTopic ?? "Mixed public narrative"} is the strongest current topic, with narrative risk ${input.summary.narrativeRiskLevel.toLowerCase()}.`;
    case "investor":
      return `${input.summary.topSector ?? "Mixed infrastructure"} is the strongest current opportunity sector, led by ${input.summary.topProvince ?? "the current project footprint"}.`;
  }
}

function secondaryFinding(input: DashboardBriefingInput): string {
  if (input.rankings.length === 0) {
    return "No ranked row is strong enough yet to dominate the current view.";
  }

  switch (input.dashboard) {
    case "province":
      const provinceRanking = input.rankings[0];
      if (!provinceRanking) {
        return "No ranked row is strong enough yet to dominate the current view.";
      }
      return `${provinceRanking.municipality} currently leads the municipality watchlist.`;
    case "leadership":
      const leadershipRanking = input.rankings[0];
      if (!leadershipRanking) {
        return "No ranked row is strong enough yet to dominate the current view.";
      }
      return `${leadershipRanking.leaderName} has the highest immediate PR relevance in the current window.`;
    case "municipality_wards":
      const municipalityRanking = input.rankings[0];
      if (!municipalityRanking) {
        return "No ranked row is strong enough yet to dominate the current view.";
      }
      return `${municipalityRanking.wardOrCommunity} is the strongest currently visible local hotspot.`;
    case "trends":
      const trendRanking = input.rankings[0];
      if (!trendRanking) {
        return "No ranked row is strong enough yet to dominate the current view.";
      }
      return `${trendRanking.topic} is the leading topic cluster by current signal strength.`;
    case "investor":
      const investorRanking = input.rankings[0];
      if (!investorRanking) {
        return "No ranked row is strong enough yet to dominate the current view.";
      }
      return `${investorRanking.projectName} is the highest-ranked directional opportunity in scope.`;
  }
}

function actionLines(input: DashboardBriefingInput): string[] {
  switch (input.dashboard) {
    case "province":
      return [
        "Prioritize executive attention on the top concern topic and highest-exposure municipality.",
        "Review public-vs-official alignment gaps before next budget or communications cycle.",
      ];
    case "leadership":
      return [
        "Focus message correction and visible response on the highest-risk leader and issue pair.",
        "Track whether public and media tone diverge before escalating PR response.",
      ];
    case "municipality_wards":
      return [
        "Act on the top local issue first, then validate whether ward evidence is operational or registry-only.",
        "Use ward or community hotspots to focus field verification and rapid response.",
      ];
    case "trends":
      return [
        "Monitor whether the leading topic is accelerating across more source types or provinces.",
        "Use top signals to verify whether narrative pressure is translating into operational risk.",
      ];
    case "investor":
      return [
        "Use the highest-ranked sectors and projects as directional engagement targets, not confirmed pipeline items.",
        "Review data quality before presenting any opportunity as investment-ready.",
      ];
  }
}

function riskLines(input: DashboardBriefingInput): string[] {
  const lines = [...input.caveats];
  if (lines.length >= 2) {
    return lines.slice(0, 2);
  }

  if (input.dashboard === "municipality_wards") {
    lines.push(
      "Ward visibility may still be stronger in the location registry than in ward-resolved issue evidence.",
    );
  }

  if (input.dashboard === "leadership") {
    lines.push(
      "Leadership coverage remains selective where named leader mentions are sparse.",
    );
  }

  if (input.dashboard === "investor") {
    lines.push(
      "Investor outputs are directional opportunity signals, not confirmed commitments.",
    );
  }

  return lines.slice(0, 2);
}

export function generateDashboardBriefing(
  input: DashboardBriefingInput,
): BriefingOutput {
  const area = geographyLabel(input);
  const headline = `${dashboardLabel(input.dashboard)}: ${topFinding(input)}`;
  const summary = `This view covers ${area} over the last ${input.filters.days} days and is grounded in filtered governed metrics, ranked rows, trend rows, and supporting evidence. ${secondaryFinding(
    input,
  )}`;

  return {
    headline,
    summary,
    keyFindings: [topFinding(input), secondaryFinding(input)].slice(0, 5),
    risks: riskLines(input),
    actions: actionLines(input),
    confidenceNote: confidenceNote(input),
  };
}

export function buildDashboardBriefingPromptPackage(
  input: DashboardBriefingInput,
): DashboardBriefingPromptPackage {
  const output = generateDashboardBriefing(input);

  return {
    system:
      input.dashboard === "trends"
        ? "You are an expert socio-political analyst generating a macro-level executive trends briefing. Focus entirely on broad political movements, major municipal shifts, and vast public sentiment narratives rather than hyper-specific micro-complaints. Synthesize massive narrative movements. Use only the structured data provided. Do not invent facts. Prefer concise, high-impact analytical language. ABSOLUTELY NO MARKDOWN. NO ASTERISKS (**). NO BOLDING. NO LISTS. Use only clean, professionally formatted plain-text paragraphs separated by empty lines."
        : "You are generating a client-facing executive dashboard briefing. Use only the structured data provided. Do not invent facts. If coverage is weak or partial, say so clearly. Prefer concise analytical language. Separate observed facts from interpretation. Treat caveats as mandatory. ABSOLUTELY NO MARKDOWN. NO ASTERISKS (**). NO BULLETS. NO LISTS. Use only clean, professionally formatted plain-text paragraphs.",
    user: [
      `Dashboard: ${dashboardLabel(input.dashboard)}`,
      `Geography: ${geographyLabel(input)}`,
      `Window: last ${input.filters.days} days`,
      "Return JSON with: headline, summary, keyFindings, risks, actions, confidenceNote.",
      `Starter draft headline: ${output.headline}`,
      `Starter draft summary: ${output.summary}`,
    ].join("\n"),
    payload: input,
  };
}
