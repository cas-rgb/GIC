export interface TraceRef {
  table: string;
  query?: string;
}

export interface ServicePressurePoint {
  date: string;
  serviceDomain: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
  confidence: number;
}

export interface ServicePressureResponse {
  province: string;
  days: number;
  serviceDomain: string | null;
  series: ServicePressurePoint[];
  totals: {
    pressureCaseCount: number;
    highSeverityCount: number;
    protestCount: number;
    responseCount: number;
  };
  trace: TraceRef;
}

export interface MunicipalityRankingRow {
  municipality: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
  dominantServiceDomain: string | null;
  riskScore: number;
  confidence: number;
  aiSynthesis?: AINarrativeSynthesisRow[];
}

export interface MunicipalityRankingResponse {
  province: string;
  rows: MunicipalityRankingRow[];
  trace: TraceRef;
}

export interface ProvinceSummaryResponse {
  province: string;
  days: number;
  serviceDomain: string | null;
  summary: {
    pressureScore: number;
    escalationScore: number;
    evidenceConfidenceScore: number;
    officialEvidenceShare: number;
    pressureCaseCount: number;
    highSeverityCount: number;
    protestCount: number;
    responseCount: number;
    topPressureDomain: string | null;
    highestExposureMunicipality: string | null;
  };
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface ProvincePressureTrendPoint {
  date: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
}

export interface ProvincePressureTrendResponse {
  province: string;
  days: number;
  serviceDomain: string | null;
  series: ProvincePressureTrendPoint[];
  trace: TraceRef;
}

export interface ProvinceIssueHeatmapCell {
  municipality: string;
  serviceDomain: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
}

export interface ProvinceIssueHeatmapResponse {
  province: string;
  days: number;
  serviceDomain: string | null;
  municipalities: string[];
  serviceDomains: string[];
  cells: ProvinceIssueHeatmapCell[];
  trace: TraceRef;
}

export interface ProvinceAlignmentMatrixRow {
  serviceDomain: string;
  concernVolume: number;
  concernShare: number;
  officialAttentionCount: number;
  officialAttentionShare: number;
  alignmentGap: number;
}

export interface ProvinceAlignmentMatrixResponse {
  province: string;
  days: number;
  serviceDomain: string | null;
  rows: ProvinceAlignmentMatrixRow[];
  summary: {
    strongestAlignedIssue: string | null;
    weakestAlignedIssue: string | null;
    avgAlignmentGap: number;
  };
  trace: TraceRef;
}

export interface InfrastructureProjectSectorRow {
  normalizedSector: string;
  projectCount: number;
  projectsWithBudgetCount: number;
  highValueProjectCount: number;
  totalKnownExpenditure: number;
  avgLatestAmount: number | null;
}

export interface InfrastructureProjectGeographyRow {
  geography: string;
  projectCount: number;
  projectsWithBudgetCount: number;
  highValueProjectCount: number;
  totalKnownExpenditure: number;
  avgLatestAmount: number | null;
  dominantSector: string | null;
}

export interface InfrastructureProjectsSummaryResponse {
  snapshotDate: string | null;
  province: string | null;
  summary: {
    rawProjectCount: number;
    screenedProjectCount: number;
    screenedOutProjectCount: number;
    projectsWithBudgetCount: number;
    highValueProjectCount: number;
    totalKnownExpenditure: number;
    avgLatestAmount: number | null;
    topSector: string | null;
  };
  sectorBreakdown: InfrastructureProjectSectorRow[];
  geographyRows: InfrastructureProjectGeographyRow[];
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface InvestorOpportunityRow {
  projectId: string;
  projectName: string;
  province: string;
  municipality: string | null;
  normalizedSector: string;
  normalizedProjectStage: string;
  latestBudgetYear: string | null;
  latestBudgetPhase: string | null;
  latestAmount: number | null;
  totalKnownExpenditure: number;
  investmentScore: number;
  dataQualityFlag: string;
}

export interface InvestorOpportunitiesResponse {
  snapshotDate: string | null;
  province: string | null;
  summary: {
    opportunityCount: number;
    totalKnownExpenditure: number;
    highValueOpportunityCount: number;
    averageInvestmentScore: number | null;
    topSector: string | null;
  };
  rows: InvestorOpportunityRow[];
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface InvestorOpportunityDetailResponse {
  projectId: string;
  summary: {
    projectName: string;
    province: string;
    municipality: string | null;
    normalizedSector: string;
    normalizedProjectStage: string;
    latestBudgetYear: string | null;
    latestBudgetPhase: string | null;
    latestAmount: number | null;
    totalKnownExpenditure: number;
    investmentScore: number;
    dataQualityFlag: string;
    sourceUrl: string | null;
  };
  fundingRows: Array<{
    financialYear: string | null;
    budgetPhase: string | null;
    amount: number;
  }>;
  updateRows: Array<{
    updateType: string;
    updateSummary: string;
    effectiveDate: string | null;
  }>;
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface InvestorProvinceOpportunityRow {
  province: string;
  opportunityCount: number;
  highValueOpportunityCount: number;
  totalKnownExpenditure: number;
  averageInvestmentScore: number | null;
  dominantSector: string | null;
  leadMunicipality: string | null;
  dataQualityOkShare: number;
}

export interface InvestorExecutiveSummaryResponse {
  snapshotDate: string | null;
  summary: {
    provinceCount: number;
    opportunityCount: number;
    highValueOpportunityCount: number;
    totalKnownExpenditure: number;
    averageInvestmentScore: number | null;
    topProvince: string | null;
    topSector: string | null;
    leadOpportunityName: string | null;
    leadOpportunityProvince: string | null;
    leadOpportunityScore: number | null;
  };
  narratives: string[];
  provinces: InvestorProvinceOpportunityRow[];
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface EvidenceBalanceRow {
  evidenceClass: string;
  sourceCount: number;
  documentCount: number;
  avgReliabilityScore: number;
  documentShare: number;
}

export interface ProvinceEvidenceBalanceResponse {
  province: string;
  days: number;
  summary: {
    officialDocumentShare: number;
    narrativeDocumentShare: number;
    weightedConfidence: number;
    dominantEvidenceClass: string | null;
  };
  rows: EvidenceBalanceRow[];
  caveats: string[];
  trace: TraceRef;
}

export interface ProvinceSentimentTrendPoint {
  date: string;
  sentimentScore: number;
  negativeShare: number;
  positiveShare: number;
  mentionCount: number;
}

export interface ProvinceSentimentTopicRow {
  topic: string;
  sentimentScore: number;
  negativeShare: number;
  positiveShare: number;
  mentionCount: number;
  avgConfidence: number;
  shareOfVoice: number;
}

export interface ProvinceSentimentResponse {
  province: string;
  days: number;
  trend: ProvinceSentimentTrendPoint[];
  topics: ProvinceSentimentTopicRow[];
  summary: {
    currentSentimentScore: number | null;
    negativeShare: number;
    positiveShare: number;
    mentionCount: number;
    topComplaintTopic: string | null;
  };
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface LeadershipSentimentLeaderRow {
  leaderName: string;
  office: string;
  sentimentScore: number;
  mentionCount: number;
  positiveMentionCount: number;
  neutralMentionCount: number;
  negativeMentionCount: number;
  confidence: number;
  linkedIssues: string[];
  linkedIssueBreakdown: Array<{
    topic: string;
    mentionCount: number;
  }>;
  topNarratives: string[];
  aiSynthesis?: AINarrativeSynthesisRow[];
  prAdvice?: string;
}

export interface LeadershipSentimentResponse {
  province: string;
  days: number;
  leaders: LeadershipSentimentLeaderRow[];
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface LeadershipEvidenceDocumentRow {
  documentId: string;
  title: string;
  url: string;
  sourceName: string;
  sourceType: string;
  municipality: string | null;
  publishedAt: string | null;
  mentionCount: number;
  excerpt: string;
}

export interface LeadershipEvidenceResponse {
  province: string;
  leaderName: string | null;
  office: string | null;
  summary: {
    documentCount: number;
    sourceCount: number;
    municipalityCount: number;
  };
  documents: LeadershipEvidenceDocumentRow[];
  caveats: string[];
  trace: TraceRef;
}

export interface MunicipalLeadershipEvidenceResponse {
  province: string;
  municipality: string;
  leaderName: string | null;
  office: string | null;
  summary: {
    documentCount: number;
    sourceCount: number;
  };
  documents: LeadershipEvidenceDocumentRow[];
  caveats: string[];
  trace: TraceRef;
}

export interface MunicipalLeadershipSentimentResponse {
  province: string;
  municipality: string;
  days: number;
  leaders: LeadershipSentimentLeaderRow[];
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface MunicipalityOption {
  municipality: string;
  pressureDocumentCount: number;
  sentimentMentionCount: number;
}

export interface MunicipalityDirectoryResponse {
  province: string;
  rows: MunicipalityOption[];
  trace: TraceRef;
}

export interface MunicipalitySummaryResponse {
  province: string;
  municipality: string;
  days: number;
  serviceDomain: string | null;
  summary: {
    pressureScore: number;
    escalationScore: number;
    sentimentScore: number | null;
    negativeShare: number;
    evidenceConfidenceScore: number;
    officialEvidenceShare: number;
    pressureCaseCount: number;
    highSeverityCount: number;
    protestCount: number;
    responseCount: number;
    topPressureDomain: string | null;
    topComplaintTopic: string | null;
  };
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface MunicipalityPressureTrendPoint {
  date: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
}

export interface MunicipalityPressureTrendResponse {
  province: string;
  municipality: string;
  days: number;
  serviceDomain: string | null;
  series: MunicipalityPressureTrendPoint[];
  trace: TraceRef;
}

export interface MunicipalityIssueMatrixRow {
  serviceDomain: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
}

export interface MunicipalityIssueMatrixResponse {
  province: string;
  municipality: string;
  days: number;
  serviceDomain: string | null;
  rows: MunicipalityIssueMatrixRow[];
  trace: TraceRef;
}

export interface MunicipalityEvidenceBalanceResponse {
  province: string;
  municipality: string;
  summary: {
    officialDocumentShare: number;
    narrativeDocumentShare: number;
    weightedConfidence: number;
    dominantEvidenceClass: string | null;
  };
  rows: EvidenceBalanceRow[];
  caveats: string[];
  trace: TraceRef;
}

export interface WardCoverageRow {
  ward: string;
  documentCount: number;
  pressureCaseCount: number;
  sentimentMentionCount: number;
}

export interface WardReadyCommunityRow {
  community: string;
  documentCount: number;
  avgUrgency: number;
  dominantIssue: string | null;
}

export interface WardCoverageResponse {
  province: string;
  municipality: string;
  summary: {
    wardCount: number;
    registryWardCount: number;
    evidenceBackedWardCount: number;
    documentCount: number;
    pressureCaseCount: number;
    sentimentMentionCount: number;
    wardReadyCommunityCount: number;
    wardReadinessLabel: string;
  };
  rows: WardCoverageRow[];
  communityRows: WardReadyCommunityRow[];
  caveats: string[];
  trace: TraceRef;
}

export interface WardProfileResponse {
  province: string;
  municipality: string;
  ward: string;
  wardNumber: number | null;
  wardLabel: string;
  districtName: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  summary: {
    hasCouncillor: boolean;
    hasElectionHistory: boolean;
    hasInfrastructureHistory: boolean;
    hasBudgetAllocations: boolean;
  };
  trace: TraceRef;
}

export interface PlaceProfileResponse {
  geographyLevel: "province" | "municipality" | "ward";
  province: string;
  municipality: string | null;
  ward: string | null;
  latestYear: number | null;
  demographics: {
    populationTotal: number | null;
    householdsTotal: number | null;
    unemploymentRate: number | null;
    serviceAccessWater: number | null;
    serviceAccessElectricity: number | null;
    serviceAccessSanitation: number | null;
    languageProfile: Record<string, unknown>;
    settlementProfile: Record<string, unknown>;
    economicProfile: Record<string, unknown>;
    incomeBandSummary: Record<string, unknown>;
  } | null;
  trace: TraceRef;
}

export interface ElectionHistoryRow {
  electionYear: number;
  electionType: string;
  partyName: string;
  candidateName: string | null;
  votes: number | null;
  voteShare: number | null;
  turnout: number | null;
  winnerFlag: boolean;
}

export interface ElectionHistoryResponse {
  geographyLevel: "province" | "municipality" | "ward";
  province: string;
  municipality: string | null;
  ward: string | null;
  rows: ElectionHistoryRow[];
  trace: TraceRef;
}

export interface WardCouncillorResponse {
  province: string;
  municipality: string;
  ward: string;
  wardNumber: number | null;
  wardLabel: string;
  councillorName: string | null;
  partyName: string | null;
  officeTitle: string | null;
  termStart: string | null;
  termEnd: string | null;
  verificationTier: string | null;
  confidenceScore: number | null;
  sourceName: string | null;
  sourceUrl: string | null;
  retrievedAt: string | null;
  trace: TraceRef;
}

export interface HistoricalInfrastructureRow {
  issueFamily: string | null;
  serviceDomain: string | null;
  eventDate: string | null;
  periodYear: number | null;
  severity: string | null;
  summaryText: string;
  budgetAmount: number | null;
  projectName: string | null;
  projectStatus: string | null;
  sourceName: string;
  sourceUrl: string | null;
  verificationTier: string;
}

export interface HistoricalInfrastructureResponse {
  geographyLevel: "province" | "municipality" | "ward";
  province: string;
  municipality: string | null;
  ward: string | null;
  rows: HistoricalInfrastructureRow[];
  trace: TraceRef;
}

export interface BudgetAllocationRow {
  geographyLevel: "province" | "municipality" | "ward";
  province: string;
  municipality: string | null;
  ward: string | null;
  issueFamily: string | null;
  serviceDomain: string | null;
  periodYear: number | null;
  budgetAmount: number | null;
  projectName: string | null;
  projectStatus: string | null;
  summaryText: string;
  sourceName: string;
  sourceUrl: string | null;
  verificationTier: string;
}

export interface BudgetAllocationResponse {
  geographyLevel: "province" | "municipality" | "ward";
  province: string;
  municipality: string | null;
  ward: string | null;
  rows: BudgetAllocationRow[];
  trace: TraceRef;
}

export interface PlaceContextResponse {
  geographyLevel: "province" | "municipality";
  province: string;
  municipality: string | null;
  wikipediaTitle: string | null;
  wikipediaDescription: string | null;
  wikipediaExtract: string | null;
  wikipediaUrl: string | null;
  storyAngles: string[];
  tags: string[];
  knownWardCount: number;
  evidenceBackedWardCount: number;
  trace: TraceRef;
}

export interface MunicipalityEvidenceDocumentRow {
  documentId: string;
  title: string;
  url: string;
  sourceName: string;
  sourceType: string;
  publishedAt: string | null;
  mentionCount: number;
  excerpt: string;
}

export interface MunicipalityEvidenceMentionRow {
  topic: string;
  sentimentLabel: string;
  sentimentScore: number;
  confidence: number;
  evidenceText: string;
  title: string;
  sourceName: string;
}

export interface MunicipalityEvidenceResponse {
  province: string;
  municipality: string;
  ward: string | null;
  topic: string | null;
  summary: {
    documentCount: number;
    mentionCount: number;
    sourceCount: number;
  };
  documents: MunicipalityEvidenceDocumentRow[];
  mentions: MunicipalityEvidenceMentionRow[];
  caveats: string[];
  trace: TraceRef;
}

export interface ProvinceEvidenceDocumentRow {
  documentId: string;
  title: string;
  url: string;
  sourceName: string;
  sourceType: string;
  municipality: string | null;
  publishedAt: string | null;
  mentionCount: number;
  excerpt: string;
}

export interface ProvinceEvidenceMentionRow {
  topic: string;
  municipality: string | null;
  sentimentLabel: string;
  sentimentScore: number;
  confidence: number;
  evidenceText: string;
  title: string;
  sourceName: string;
}

export interface ProvinceEvidenceResponse {
  province: string;
  topic: string | null;
  summary: {
    documentCount: number;
    mentionCount: number;
    sourceCount: number;
    municipalityCount: number;
  };
  documents: ProvinceEvidenceDocumentRow[];
  mentions: ProvinceEvidenceMentionRow[];
  caveats: string[];
  trace: TraceRef;
}

export interface WaterReliabilityResponse {
  province: string;
  days: number;
  summary: {
    waterReliabilityScore: number;
    officialDocumentCount: number;
    officialSignalCount: number;
    officialIncidentCount: number;
    avgSourceReliability: number;
    latestDay: string | null;
  };
  series: Array<{
    date: string;
    waterReliabilityScore: number;
    officialDocumentCount: number;
    officialSignalCount: number;
    officialIncidentCount: number;
    avgSourceReliability: number;
  }>;
  caveats: string[];
  trace: TraceRef;
}

export interface ProvinceComparisonRow {
  province: string;
  pressureScore: number;
  escalationScore: number;
  sentimentScore: number | null;
  evidenceConfidenceScore: number;
  officialEvidenceShare: number;
  topPressureDomain: string | null;
  highestExposureMunicipality: string | null;
  healthyConnectorCount: number;
  staleConnectorCount: number;
  failingConnectorCount: number;
}

export interface ProvinceComparisonResponse {
  days: number;
  rows: ProvinceComparisonRow[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface MunicipalityComparisonRow {
  municipality: string;
  pressureScore: number;
  escalationScore: number;
  sentimentScore: number | null;
  evidenceConfidenceScore: number;
  officialEvidenceShare: number;
  topPressureDomain: string | null;
  topComplaintTopic: string | null;
}

export interface MunicipalityComparisonResponse {
  province: string;
  days: number;
  rows: MunicipalityComparisonRow[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface CitizenVoiceTrendPoint {
  date: string;
  mentionCount: number;
  documentCount: number;
  negativeShare: number;
  avgSentimentScore: number;
}

export interface CitizenVoiceIssueRow {
  issueFamily: string;
  mentionCount: number;
  documentCount: number;
  negativeShare: number;
  avgSentimentScore: number;
  avgConfidence: number;
}

export interface CitizenVoiceIssueTrendRow {
  issueFamily: string;
  date: string;
  mentionCount: number;
  documentCount: number;
}

export interface CitizenVoiceTrendsResponse {
  days: number;
  province: string | null;
  trend: CitizenVoiceTrendPoint[];
  issues: CitizenVoiceIssueRow[];
  issueTrend: CitizenVoiceIssueTrendRow[];
  summary: {
    mentionCount: number;
    documentCount: number;
    avgNegativeShare: number;
    dominantIssueFamily: string | null;
  };
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface SocialTrendConcernProvinceRow {
  province: string;
  mentionCount: number;
  documentCount: number;
  avgNegativeShare: number;
  avgSentimentScore: number;
  dominantIssueFamily: string | null;
  intensityScore: number;
}

export interface SocialTrendEvidenceHighlightRow {
  documentId: string;
  title: string;
  url: string;
  sourceName: string;
  sourceType: string;
  province: string;
  municipality: string | null;
  issueFamily: string;
  sentimentLabel: string;
  sentimentScore: number;
  confidence: number;
  excerpt: string;
}

export interface AINarrativeSynthesisRow {
  whoInvolved: string | null;
  whatHappened: string | null;
  whyItHappened: string | null;
  howResolvedOrCurrent: string | null;
  whenTimeline: string | null;
  sourceEvidence: string | null;
}

export interface SocialTrendsExecutiveSummaryResponse {
  province: string | null;
  days: number;
  summary: {
    totalCitizenMentions: number;
    totalCitizenDocuments: number;
    totalLegacyCommunityDocuments: number;
    activeProvinceCount: number;
    averageNegativeShare: number;
    legacyNegativeShare: number;
    legacyAvgUrgency: number;
    dominantIssueFamily: string | null;
    hottestProvince: string | null;
    narrativeRiskLevel: "Low" | "Elevated" | "High";
  };
  narratives: string[];
  aiSynthesis: AINarrativeSynthesisRow[];
  concernProvinces: SocialTrendConcernProvinceRow[];
  evidenceHighlights: SocialTrendEvidenceHighlightRow[];
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface SocialSourceMixRow {
  sourceType: string;
  documentCount: number;
  mentionCount: number;
  share: number;
}

export interface SocialSourceMixResponse {
  province: string | null;
  days: number;
  rows: SocialSourceMixRow[];
  trace: TraceRef;
}

export interface MunicipalityCitizenVoiceIssueRow {
  issueFamily: string;
  mentionCount: number;
  documentCount: number;
  avgNegativeShare: number;
  avgSentimentScore: number;
  intensityScore: number;
}

export interface MunicipalityCitizenVoiceSummaryResponse {
  province: string;
  municipality: string;
  days: number;
  summary: {
    totalCitizenMentions: number;
    totalCitizenDocuments: number;
    averageNegativeShare: number;
    dominantIssueFamily: string | null;
    narrativeRiskLevel: "Low" | "Elevated" | "High";
  };
  narratives: string[];
  issues: MunicipalityCitizenVoiceIssueRow[];
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface LegacyCommunityIssueRow {
  issue: string;
  documentCount: number;
  avgUrgency: number;
  dominantSentiment: string | null;
}

export interface MunicipalityLegacyCommunitySignalsResponse {
  province: string;
  municipality: string;
  days: number;
  summary: {
    documentCount: number;
    sourceCount: number;
    avgUrgency: number;
    negativeShare: number;
    topPlatform: string | null;
  };
  issues: LegacyCommunityIssueRow[];
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface ProvinceLegacyCommunityIssueRow {
  issue: string;
  documentCount: number;
  provinceCount: number;
  avgUrgency: number;
  dominantSentiment: string | null;
}

export interface ProvinceLegacyCommunitySignalsResponse {
  province: string | null;
  days: number;
  summary: {
    documentCount: number;
    sourceCount: number;
    provinceCount: number;
    avgUrgency: number;
    negativeShare: number;
    topPlatform: string | null;
  };
  issues: ProvinceLegacyCommunityIssueRow[];
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface ComplaintClusterRow {
  issueFamily: string;
  mentionCount: number;
  documentCount: number;
  municipalityCount: number;
  avgNegativeShare: number;
  avgSentimentScore: number;
  intensityScore: number;
}

export interface ComplaintClustersResponse {
  province: string | null;
  days: number;
  summary: {
    issueCount: number;
    totalMentions: number;
    dominantIssueFamily: string | null;
    widestSpreadIssueFamily: string | null;
  };
  rows: ComplaintClusterRow[];
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}

export interface CitizenVoiceEvidenceDocumentRow {
  documentId: string;
  title: string;
  url: string;
  sourceName: string;
  sourceType: string;
  province: string;
  municipality: string | null;
  issueFamily: string;
  sentimentLabel: string;
  sentimentScore: number;
  confidence: number;
  publishedAt: string | null;
  excerpt: string;
}

export interface CitizenVoiceEvidenceResponse {
  province: string | null;
  municipality?: string | null;
  ward?: string | null;
  issueFamily: string | null;
  days: number;
  summary: {
    documentCount: number;
    sourceCount: number;
    legacyDocumentCount: number;
    avgNegativeScore: number;
    dominantSourceType: string | null;
  };
  documents: CitizenVoiceEvidenceDocumentRow[];
  caveats: string[];
  trace: {
    tables: string[];
    query?: string;
  };
}
