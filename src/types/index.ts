export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Category = 'Civil' | 'Roads' | 'Health' | 'Planning' | 'Structural' | 'Apex';
export type Urgency = number;

export interface AISignal {
    community: string;
    issue: string;
    sentiment: Sentiment;
    urgency: Urgency;
    evidence: string;
    source: string;
    category: Category;
    province?: string;
    premierMentioned?: string;
    timestamp?: any; // Firestore Timestamp
    ingestedAt?: string;
    communityId?: string;
}

export interface PredictionData {
    forecast6mo: number;
    forecast12mo: number;
    forecast36mo: number;
    confidence: number;
}

export interface EngagementStrategy {
    action: string;
    description: string;
    evidence: string;
    confidence: number;
    cultureMatch: string;
}

export interface NarrativeDriver {
    voice: string;
    impact: number; // 0-100
    reach: string; // e.g., "Cross-channel", "Local only"
    citations: number;
    leadershipScore: number;
    keyNarrative: string;
}

export interface RiskIndicator {
    issue: string;
    escalationProbability: number; // 0-1
    mediaPickupLikelihood: number; // 0-1
    trendTrajectory: 'rising' | 'stable' | 'falling';
    isEmerging: boolean;
}

export interface StrategicRecommendation {
    timing: 'immediate' | 'planned' | 'monitoring';
    framing: string;
    priorityCommunities: string[];
    mitigationStrategy: string;
}

export interface ExecutiveBriefing {
    briefing: string;
}

export interface AdvancedInsights {
    proportionality: { name: string; value: number }[];
    velocity: number;
    reliability: number;
    totalSignals: number;
}
export interface DeepDossier {
    community: string;
    summary: string;
    strategicRisks: string[];
    growthOpportunities: string[];
    influentialNarratives: string[];
    forecast36m: string;
    sources: string[];
}

export interface Region {
    id: string;
    name: string;
    type: 'province' | 'municipality' | 'community';
    parentId?: string;
    premier?: string;
}

export interface NewsArticle {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: {
        name: string;
    };
}

export interface LookalikeCase {
    target: string;
    matchTo: string;
    score: number;
    reason: string;
    respondsTo: string;
}

export interface SilentDemandZone {
    name: string;
    totalSignals: number;
    riskLevel: number;
}

export interface StrategicInsights {
    serviceName: string;
    totalDatabaseStrength: number;
    lookalikes: LookalikeCase[];
    silentDemand: SilentDemandZone[];
    hotspots: any[];
    interventionBrief: string | null;
}

export interface CommunitySignal {
    id: string;
    community: string;
    issue: string;
    evidence: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    urgency: number;
    platform?: string;
    timestamp?: { seconds: number; nanoseconds: number };
    source?: string;
    category?: string;
}

export interface TacticalRiskData {
    projectId: string;
    projectName: string;
    vulnerability_index: number;
    situational_volatility: number;
    justification: string;
    vectors: Record<string, number>;
    supporting_evidence: Array<{
        source: string;
        impact: string;
        url: string;
        content: string;
        urgency: number;
    }>;
}
// --- BASE TYPES ---

export interface BaseEntity {
    id: string;
    createdAt: any; // Firestore Timestamp
    updatedAt: any; // Firestore Timestamp
    country: 'South Africa' | 'Namibia' | 'Botswana' | 'Eswatini' | 'Lesotho';
    province?: string;
    municipality?: string;
    ward?: string;
    status: 'active' | 'archived' | 'pending';
}

// --- GIC GRAND ORCHESTRATION (40 DATASETS) ---

export type StrategicDomain = 
    | 'GovernmentLeadership' 
    | 'InfrastructurePlanning' 
    | 'ProcurementTenders' 
    | 'SocioeconomicIntel' 
    | 'MiningIndustrial' 
    | 'EnvironmentalRisk' 
    | 'GICInternal';

export interface DatasetEntry extends BaseEntity {
    domain: StrategicDomain;
    datasetId: string; // e.g., "Dataset 1", "Dataset 14"
    municipality: string;
    ward?: string;
    province: string;
    payload: any; // Flexible per-dataset data
    source: string;
    confidence: number;
}

export interface RegionalRegistry {
    provinces: {
        name: string;
        municipalities: {
            name: string;
            wards?: string[];
        }[];
    }[];
}

export interface ReasoningStep {
    id: string;
    title: string;
    description: string;
    impact: string;
}

export interface GroundingData {
    label: string;
    value: string;
}

export interface StrategicReasoning {
    primaryNode: string;
    logicStrength: number;
    reasoningSteps: ReasoningStep[];
    groundingData: GroundingData[];
}
