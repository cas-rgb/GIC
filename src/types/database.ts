import { Sentiment, Category, BaseEntity } from "./index";

/**
 * GIC Platform Core Database Schema
 * Supporting South Africa, Eswatini, and Lesotho.
 * Optimized for regional filtering and AI-driven insights.
 */

// 1. Communities
export interface Community extends BaseEntity {
  name: string;
  province: string;
  municipality: string;
  lat: number;
  lng: number;
  population: number;
  riskScore: number; // 0-100
  priorityStatus: "High Risk" | "Moderate" | "Stable" | "Urgent Action";
  infrastructureScore: number; // 0-100
  image: string;
  tags: string[];
  governance?: {
    mayor: string;
    governingParty: string;
    voteSplit: Record<string, number>; // e.g., { "ANC": 45, "DA": 30 }
    premier: string;
  };
  culture?: {
    primaryLanguages: string[];
    niches: string[]; // e.g., "Mining Heritage", "Zulu Traditional"
  };
  wikipediaBrief?: string;
  environmental?: {
    crimeRate: "High" | "Medium" | "Low";
    weatherRisk: "Elevated" | "Standard";
    fundingStability: number; // 0-1
  };
  infrastructureNeeds: string[];
  demographics: {
    youthPercentage: number;
    employmentRate: number;
  };
  lastAuditDate: any;
}

// 2. Community Priority Scores
export interface CommunityPriorityScore extends BaseEntity {
  communityId: string;
  score: number;
  delta: number; // Change from last period
  period: string; // e.g., "2026-Q1"
  rank: number;
  confidence: number;
}

// 3. Community Signals
export type SignalLayer =
  | "issue"
  | "sentiment"
  | "momentum"
  | "location"
  | "influence"
  | "engagement"
  | "event"
  | "risk"
  | "development"
  | "narrative"
  | "evidence";

export interface CommunitySignal extends BaseEntity {
  communityId: string;
  type: "social" | "media" | "direct" | "field_agent";
  text: string;
  layers: SignalLayer[]; // Explicit mapping to the 11-layer philosophy
  sentiment: Sentiment;
  emotion?: "anger" | "frustration" | "hope" | "pride" | "neutral"; // From Category 2
  urgency: number; // 1-5
  momentum: number; // 0-1 (velocity/growth)
  influenceId?: string; // Reference to MOCK_STAKEHOLDERS or NewsSource
  influencer?: {
    name: string;
    username: string;
    followers: number;
    type: "journalist" | "leader" | "activist" | "ngo" | "politician";
  }; // From Category 5
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  }; // From Category 6
  potentialImpact?: string; // Descriptive risk projection
  eventTrigger?: boolean; // From Category 7 (Protest, Strike, etc.)
  category: Category;
  source: string;
  sourceType: "local_news" | "journalist" | "ngo" | "social_media"; // For Category 11 Rule
  sourceUrl?: string;
  evidenceId?: string; // Link to EvidenceSource (Category 11)
  platform?: string; // Twitter/X, Facebook, etc.
  geotag?: {
    lat: number;
    lng: number;
  };
  reliabilityScore: number; // 0-1 (Calculated based on SourceType)
}

// 3b. Evidence Sources (The "Fact Library")
export interface EvidenceSource extends BaseEntity {
  signalId: string;
  title: string;
  snippet?: string; // From Category 11
  fileUrl?: string;
  originalSourceUrl: string;
  verificationStatus: "verified" | "unverified" | "disputed";
  hash?: string; // For site integrity
  capturedBy: string;
  metadata: {
    dateMentioned?: string;
    sourceName: string;
    platform?: string;
    [key: string]: any;
  };
  rag_score?: number;     // Injected by RAG AI Layer
  source_name?: string;   // Injected by SQL Joins
}

// 4. GIC Logical Intelligence
export interface GICLogicalIntelligence extends BaseEntity {
  sector: Category;
  logicType: "cross_sector" | "predictive" | "structural";
  narrative: string;
  relatedCommunities: string[]; // id[]
  supportingEvidence: string[];
  logicStrength: number; // 0-1
}

// 5. GIC Projects
export interface GICProject extends BaseEntity {
  name: string;
  sector: Category;
  communityId: string; // Primary linkage
  budget: number;
  currency: "ZAR" | "SZL" | "LSL";
  stage: "Planning" | "Execution" | "Handover" | "Delayed";
  progress: number; // 0-100
  riskVelocity: "High" | "Medium" | "Low";
  startDate: any;
  completionDate: any;
  lat: number;
  lng: number;
  visual?: string;
}

// 6. News Articles
export interface NewsArticle extends BaseEntity {
  title: string;
  content: string;
  url: string;
  sourceName: string;
  publishedAt: any;
  sentiment: Sentiment;
  relevanceScore: number;
  geographyLinks: string[]; // provinces or municipalities mentioned
  categories: Category[];
  narrativeTheme?:
    | "Service Delivery Crisis"
    | "Government Accountability"
    | "Community Activism"
    | "Infrastructure Investment"
    | "Urban Expansion"; // From Category 10
  publicQuotes?: string[]; // From Category 2
}

// 7. Project Vulnerability Ledger
export interface ProjectVulnerabilityLedger extends BaseEntity {
  projectId: string;
  vector: "Social" | "Environmental" | "Technical" | "Financial";
  vulnerabilityIndex: number; // 0-1
  probability: number; // 0-1
  justification: string;
  mitigationStrategy: string;
  lastAuditBy: string;
}

// 8. Provincial Promises
export interface ProvincialPromise extends BaseEntity {
  premierName: string;
  promiseText: string;
  sector: Category;
  deliveryDeadline: any;
  fulfillmentStatus: "On Track" | "At Risk" | "Broken" | "Fulfilled";
  budgetAllocated: number;
  publicSentimentScore: number;
}

// 9. Regional Benchmarks
export interface RegionalBenchmark extends BaseEntity {
  metric: string;
  value: number;
  averageValue: number; // For comparison
  unit: string;
  comparisonRegion: string; // e.g., "Global Average" or "SA National Avg"
  trend: "improving" | "declining" | "stable";
}

// 10. Service Strategic Insights
export interface ServiceStrategicInsight extends BaseEntity {
  sector: Category;
  executiveSummary: string;
  interventionSuggestions: string[];
  opportunityClusters: string[];
  dataAnchors: string[]; // references to specific datasets
  confidenceLevel: number;
}

// 11. Service Visual Analytics
export interface ServiceVisualAnalytics extends BaseEntity {
  vizType: "heatmap" | "choropleth" | "network" | "trend";
  sector: Category;
  metadata: Record<string, any>; // layer settings, color scales
  refreshFrequency: "real-time" | "daily" | "weekly";
  layerSource: string; // API or Collection name
}

// 12. Strategic Insights (Executive Level)
export interface StrategicInsight extends BaseEntity {
  title: string;
  briefing: string;
  priorityLevel: "Strategic" | "Tactical" | "Critical";
  forecastWindow: "6mo" | "12mo" | "36mo";
  aiModel: string;
  groundingData: string[]; // List of IDs from other collections
}

/**
 * Performance & Performance Strategy
 */

export const DATABASE_INDEXES = {
  regional_filtering: ["country", "province", "municipality", "status"],
  time_series: ["publishedAt", "createdAt", "period"],
  linkage: ["communityId", "projectId"],
  performance: ["urgency", "riskScore", "vulnerabilityIndex"],
};

export const COMMON_FILTERS = {
  active_in_province: (province: string) => ({ province, status: "active" }),
  high_risk_projects: () => ({ riskVelocity: "High" }),
  critical_vulnerabilities: () => ({ vulnerabilityIndex: { $gt: 0.8 } }),
};

// --- STRUCTURED DATASETS (Expansion) ---

export interface LeaderEntry extends BaseEntity {
  name: string;
  role: string;
  level: "National" | "Provincial" | "Municipal";
  portfolio?: string;
  lastVerified: string;
}

export interface InfrastructureOpportunity extends BaseEntity {
  title: string;
  sector: Category;
  description: string;
  expectedTenderDate?: string;
  estimatedValue?: number;
  probabilityScore: number; // ML generated
  relevanceToGIC: number;
}

export interface TenderNotice extends BaseEntity {
  tenderId: string;
  title: string;
  sector: Category;
  value?: number;
  closingDate: string;
  sourceUrl: string;
  stage: "Open" | "Closed" | "Awarded" | "Cancelled";
}

export interface RiskSignalEntry extends BaseEntity {
  vector: "Social" | "Environmental" | "Technical" | "Financial" | "Security";
  intensity: number;
  description: string;
  frequency: number;
  lastDetected: string;
}

export interface PlanningBudget extends BaseEntity {
  programName: string;
  budgetAllocation: number;
  period: string;
  idpLink?: string;
}

export interface FundingPartner extends BaseEntity {
  name: string;
  type:
    | "NGO"
    | "Private Equity"
    | "Development Bank"
    | "Corporate Social Investment";
  focusSectors: Category[];
  regionalFocus: string[]; // provinces/countries
  activeProjects: string[]; // IDs
}
