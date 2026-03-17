import { getInfrastructureProjectsSummary } from "@/lib/analytics/infrastructure-projects-summary";
import { getInvestorExecutiveSummary } from "@/lib/analytics/investor-executive-summary";
import { getInvestorOpportunities } from "@/lib/analytics/investor-opportunities";
import {
  BriefingOutput,
  InvestorBriefingInput,
} from "@/lib/intelligence/briefing-contract";
import { generateDashboardBriefing } from "@/lib/intelligence/generate-dashboard-briefing";

export interface InvestorBriefingResponse extends BriefingOutput {
  province: string | null;
  municipality: string | null;
  days: number;
  trace: {
    sources: string[];
    query: string;
  };
}

export async function getInvestorBriefing(
  province: string | null = null,
  municipality: string | null = null,
  days = 30
): Promise<InvestorBriefingResponse> {
  const [executive, opportunities, projects] = await Promise.all([
    getInvestorExecutiveSummary(province),
    getInvestorOpportunities(province, municipality, 8),
    getInfrastructureProjectsSummary(province),
  ]);

  const input: InvestorBriefingInput = {
    dashboard: "investor",
    geography: {
      province,
      municipality,
    },
    filters: {
      days,
      confidenceMode: "governed",
    },
    summary: {
      opportunityCount: opportunities.summary.opportunityCount,
      totalKnownExpenditure: opportunities.summary.totalKnownExpenditure,
      topProvince: province ?? executive.summary.topProvince,
      topSector: opportunities.summary.topSector ?? executive.summary.topSector,
      highValueOpportunityCount: opportunities.summary.highValueOpportunityCount,
      averageInvestmentScore: opportunities.summary.averageInvestmentScore,
    },
    rankings: opportunities.rows.map((row) => ({
      projectName: row.projectName,
      province: row.province,
      municipality: row.municipality,
      sector: row.normalizedSector,
      stage: row.normalizedProjectStage,
      investmentScore: row.investmentScore,
      dataQualityFlag: row.dataQualityFlag,
    })),
    trends: [],
    sectorMix: projects.sectorBreakdown.slice(0, 8).map((row) => ({
      sector: row.normalizedSector,
      projectCount: row.projectCount,
      totalKnownExpenditure: row.totalKnownExpenditure,
    })),
    geographyMix: projects.geographyRows.slice(0, 8).map((row) => ({
      geography: row.geography,
      projectCount: row.projectCount,
      highValueProjectCount: row.highValueProjectCount,
      totalKnownExpenditure: row.totalKnownExpenditure,
    })),
    evidence: [],
    caveats: [...executive.caveats, ...opportunities.caveats, ...projects.caveats],
  };

  return {
    ...generateDashboardBriefing(input),
    province,
    municipality,
    days,
    trace: {
      sources: ["infrastructure_projects", "fact_infrastructure_projects_daily", "project_funding_sources", "project_updates"],
      query: `province=${province ?? "all"};municipality=${municipality ?? "all"};days=${days}`,
    },
  };
}
