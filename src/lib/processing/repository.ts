import {
  DocumentRecord,
  NormalizedBudget,
  NormalizedIncident,
  NormalizedLocation,
  NormalizedSignal,
  NormalizedTender,
  ProcessingQualityReport,
} from "@/lib/processing/types";

export interface ProcessingRepository {
  getDocument(documentId: string): Promise<DocumentRecord>;
  upsertLocation(location: NormalizedLocation): Promise<string>;
  saveSignals(
    documentId: string,
    locationId: string | null,
    signals: NormalizedSignal[]
  ): Promise<string[]>;
  saveIncidents(
    signalIds: string[],
    locationId: string | null,
    incidents: NormalizedIncident[]
  ): Promise<void>;
  saveTenders(
    documentId: string,
    locationId: string | null,
    tenders: NormalizedTender[]
  ): Promise<void>;
  saveBudgets(
    documentId: string,
    locationId: string | null,
    budgets: NormalizedBudget[]
  ): Promise<void>;
  markProcessed(
    documentId: string,
    parserVersion: string,
    quality: ProcessingQualityReport
  ): Promise<void>;
}
