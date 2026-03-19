export type DashboardBriefingKind =
  | "province"
  | "leadership"
  | "municipality_wards"
  | "trends"
  | "investor";

export type ConfidenceMode = "high_only" | "governed" | "include_legacy";

export interface BriefingGeography {
  province?: string | null;
  municipality?: string | null;
  ward?: string | null;
}

export interface BriefingFilters {
  days: number;
  serviceDomain?: string | null;
  issueFamily?: string | null;
  leaderName?: string | null;
  sourceTypes?: string[];
  confidenceMode?: ConfidenceMode;
}

export interface BriefingEvidenceItem {
  title: string;
  sourceName: string;
  sourceType: string;
  date?: string | null;
  excerpt: string;
  url?: string | null;
}

export type BriefingScalar = string | number | boolean | null;
export type BriefingRow = Record<string, BriefingScalar | string[] | null>;

export interface BriefingOutput {
  headline: string;
  summary: string;
  keyFindings: string[];
  risks: string[];
  actions: string[];
  confidenceNote: string;
}

export interface BriefingInputBase {
  dashboard: DashboardBriefingKind;
  geography: BriefingGeography;
  filters: BriefingFilters;
  summary: Record<string, BriefingScalar>;
  rankings: BriefingRow[];
  trends: BriefingRow[];
  evidence: BriefingEvidenceItem[];
  caveats: string[];
}

export interface ProvinceIssueMixRow {
  serviceDomain: string;
  concernShare: number;
  officialShare: number;
  alignmentGap: number;
}

export interface ProvinceBriefingInput extends BriefingInputBase {
  dashboard: "province";
  summary: {
    pressureScore: number;
    escalationScore: number;
    concernVolume: number;
    topConcernTopic: string | null;
    concernVelocity: number | null;
    alignmentScore: number | null;
    highestExposureMunicipality: string | null;
  };
  rankings: Array<{
    municipality: string;
    issueVolume: number;
    topIssue: string | null;
    pressureScore: number;
  }>;
  trends: Array<{
    date: string;
    issueFamily: string;
    volume: number;
  }>;
  issueMix: ProvinceIssueMixRow[];
}

export interface LeadershipNarrativeRow {
  leaderName: string;
  topics: string[];
  narratives: string[];
}

export interface LeadershipBriefingInput extends BriefingInputBase {
  dashboard: "leadership";
  summary: {
    averageSentiment: number | null;
    leaderCount: number;
    mentionVolume: number;
    riskAlertCount: number;
    highestExposureLeader: string | null;
    highestRiskLeader: string | null;
  };
  rankings: Array<{
    leaderName: string;
    office: string;
    sentimentScore: number;
    mentionCount: number;
    reputationLabel: string;
    topIssue: string | null;
  }>;
  trends: Array<{
    date: string;
    leaderName: string;
    sentimentScore: number;
    mentionCount: number;
  }>;
  narrativesByLeader: LeadershipNarrativeRow[];
}

export interface MunicipalityWardsBriefingInput extends BriefingInputBase {
  dashboard: "municipality_wards";
  summary: {
    municipalityPressureScore: number;
    escalationScore: number;
    topIssue: string | null;
    issueVolume: number;
    wardReadinessLabel:
      | "Operational"
      | "Partial"
      | "Registry Only"
      | "Community-led"
      | "Sparse";
    registryWardCount: number;
    evidenceBackedWardCount: number;
  };
  rankings: Array<{
    wardOrCommunity: string;
    type: "ward" | "community";
    issueVolume?: number | null;
    urgency?: number | null;
    dominantIssue?: string | null;
  }>;
  trends: Array<{
    date: string;
    municipality: string;
    serviceDomain: string;
    issueVolume: number;
  }>;
  issueMix: Array<{
    serviceDomain: string;
    volume: number;
    severe: number;
    protests: number;
    responses: number;
  }>;
}

export interface SocialSourceMixItem {
  sourceType: string;
  documentCount: number;
  mentionCount: number;
  share: number;
}

export interface TrendsBriefingInput extends BriefingInputBase {
  dashboard: "trends";
  summary: {
    totalMentions: number;
    dominantTopic: string | null;
    narrativeRiskLevel: "Low" | "Elevated" | "High";
    hottestProvince: string | null;
    averageNegativeShare: number;
  };
  rankings: Array<{
    topic: string;
    mentionCount: number;
    shareOfVoice: number;
    negativeShare: number;
    velocity: number | null;
  }>;
  trends: Array<{
    date: string;
    topic: string;
    mentionCount: number;
    shareOfVoice: number;
  }>;
  sourceMix: SocialSourceMixItem[];
}

export interface InvestorSectorMixItem {
  sector: string;
  projectCount: number;
  totalKnownExpenditure: number;
}

export interface InvestorGeographyMixItem {
  geography: string;
  projectCount: number;
  highValueProjectCount: number;
  totalKnownExpenditure: number;
}

export interface InvestorBriefingInput extends BriefingInputBase {
  dashboard: "investor";
  summary: {
    opportunityCount: number;
    totalKnownExpenditure: number;
    topProvince: string | null;
    topSector: string | null;
    highValueOpportunityCount: number;
    averageInvestmentScore: number | null;
  };
  rankings: Array<{
    projectName: string;
    province: string;
    municipality: string | null;
    sector: string;
    stage: string;
    investmentScore: number;
    dataQualityFlag: string;
  }>;
  sectorMix: InvestorSectorMixItem[];
  geographyMix: InvestorGeographyMixItem[];
}

export type DashboardBriefingInput =
  | ProvinceBriefingInput
  | LeadershipBriefingInput
  | MunicipalityWardsBriefingInput
  | TrendsBriefingInput
  | InvestorBriefingInput;

export interface DashboardBriefingPromptPackage {
  system: string;
  user: string;
  payload: DashboardBriefingInput;
}
