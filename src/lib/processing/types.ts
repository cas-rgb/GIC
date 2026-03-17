export type CanonicalSector =
  | "Civil"
  | "Roads"
  | "Health"
  | "Planning"
  | "Structural"
  | "Apex";

export type CanonicalDocType =
  | "article"
  | "report"
  | "tender"
  | "budget"
  | "notice";

export type CanonicalSentiment = "positive" | "neutral" | "negative";
export type CanonicalSeverity = "Low" | "Medium" | "High";

export interface ProcessDocumentJob {
  documentId: string;
  sourceId: string;
  parserVersion: string;
  processingMode: "full" | "reprocess";
}

export interface DocumentRecord {
  id: string;
  sourceId: string;
  locationId: string | null;
  url: string;
  title: string;
  contentText: string;
  publishedAt: string | null;
  docType: CanonicalDocType;
  status: "active" | "archived" | "rejected";
}

export interface NormalizedLocation {
  country: string;
  province: string | null;
  district: string | null;
  municipality: string | null;
  ward: string | null;
  confidence: number;
}

export interface DocumentClassification {
  docType: CanonicalDocType;
  sectorHints: CanonicalSector[];
  language: string;
  confidence: number;
}

export interface NormalizedSignal {
  sector: CanonicalSector;
  signalType: string;
  sentiment: CanonicalSentiment;
  severityScore: number;
  urgencyScore: number;
  confidenceScore: number;
  eventDate: string | null;
  summaryText: string;
  sourceUrl: string | null;
}

export interface NormalizedIncident {
  serviceDomain: string;
  incidentType: string;
  failureIndicator: boolean;
  citizenPressureIndicator: boolean;
  protestIndicator: boolean;
  responseIndicator: boolean;
  recurrenceIndicator: boolean;
  severity: CanonicalSeverity;
  classificationConfidence: number;
  openedAt: string | null;
  closedAt: string | null;
}

export interface NormalizedTender {
  sector: CanonicalSector;
  title: string;
  issuer: string | null;
  closingDate: string | null;
  estimatedValue: number | null;
  status: "Open" | "Closed" | "Awarded" | "Cancelled";
}

export interface NormalizedBudget {
  sector: CanonicalSector;
  programName: string;
  budgetAmount: number;
  periodStart: string;
  periodEnd: string;
}

export interface ProcessingQualityReport {
  passed: boolean;
  errors: string[];
  warnings: string[];
  extractionConfidence: number;
}

export interface ProcessedDocumentResult {
  documentId: string;
  location: NormalizedLocation | null;
  documentClassification: DocumentClassification;
  signals: NormalizedSignal[];
  incidents: NormalizedIncident[];
  tenders: NormalizedTender[];
  budgets: NormalizedBudget[];
  quality: ProcessingQualityReport;
}
