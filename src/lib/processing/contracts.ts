import {
  DocumentClassification,
  DocumentRecord,
  NormalizedBudget,
  NormalizedIncident,
  NormalizedLocation,
  NormalizedSignal,
  NormalizedTender,
} from "@/lib/processing/types";

export interface DocumentClassifier {
  classify(document: DocumentRecord): Promise<DocumentClassification>;
}

export interface LocationResolver {
  resolve(
    document: DocumentRecord,
    classification: DocumentClassification
  ): Promise<NormalizedLocation | null>;
}

export interface SignalExtractor {
  extract(
    document: DocumentRecord,
    classification: DocumentClassification
  ): Promise<NormalizedSignal[]>;
}

export interface IncidentExtractor {
  extract(
    document: DocumentRecord,
    signals: NormalizedSignal[]
  ): Promise<NormalizedIncident[]>;
}

export interface TenderExtractor {
  extract(
    document: DocumentRecord,
    classification: DocumentClassification
  ): Promise<NormalizedTender[]>;
}

export interface BudgetExtractor {
  extract(
    document: DocumentRecord,
    classification: DocumentClassification
  ): Promise<NormalizedBudget[]>;
}
