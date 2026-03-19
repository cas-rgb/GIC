export type VerificationTier =
  | "governed"
  | "verified_enrichment"
  | "ai_candidate";

export interface EnrichmentProvenance {
  sourceUrl: string;
  sourceName: string;
  sourceType: string;
  sourceDate: string | null;
  retrievedAt: string;
  confidenceScore: number;
  verificationTier: VerificationTier;
  verified: boolean;
  lastCheckedAt: string | null;
}

export interface WardReferenceRecord extends EnrichmentProvenance {
  id: string;
  province: string;
  municipality: string;
  ward: string;
  wardLabel: string | null;
  councillorName: string | null;
  party: string | null;
  officeTitle: string | null;
}

export interface LeaderReferenceRecord extends EnrichmentProvenance {
  id: string;
  province: string | null;
  municipality: string | null;
  leaderName: string;
  office: string;
  aliases: string[];
}

export interface BudgetReferenceRecord extends EnrichmentProvenance {
  id: string;
  province: string;
  fiscalYear: string | null;
  issueFamily: string;
  programName: string;
  budgetAmount: number | null;
  budgetPercentage: number | null;
  priorityLabel: string | null;
  sourceDocumentId: string | null;
}

export interface CompanySignalReferenceRecord extends EnrichmentProvenance {
  id: string;
  companyName: string;
  investorType: string | null;
  sector: string;
  province: string | null;
  municipality: string | null;
  projectOrSignalName: string | null;
  signalType: string;
  signalStrength: number | null;
  sourceDocumentId: string | null;
}

export interface EnrichmentPromotionRule {
  description: string;
  requiresVerifiedSource: boolean;
  minimumConfidenceScore: number;
}
