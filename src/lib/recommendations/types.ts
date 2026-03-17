export interface ProvinceRecommendation {
  title: string;
  issue: string;
  affectedMunicipalities: string[];
  recommendedAction: string;
  urgency: "High" | "Medium" | "Low";
  impactTier: "Transformative" | "High" | "Moderate";
  expectedImpact: string;
  ownerOffice: string;
  evidenceCount: number;
  officialShare: number;
  publicPressureMentions: number;
  legacyCommunityDocuments: number;
  traceChips: string[];
  confidence: number;
  linkedLeaders: string[];
  rationale: string;
}

export interface ProvinceRecommendationsResponse {
  province: string;
  days: number;
  recommendations: ProvinceRecommendation[];
  trace: {
    sources: string[];
    query?: string;
  };
}
