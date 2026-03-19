import { RuleBasedDocumentClassifier } from "@/lib/processing/document-classifier";
import { RuleBasedIncidentExtractor } from "@/lib/processing/incident-extractor";
import { RuleBasedLocationResolver } from "@/lib/processing/location-resolver";
import {
  NoopBudgetExtractor,
  NoopTenderExtractor,
} from "@/lib/processing/noop-extractors";
import { DocumentProcessor } from "@/lib/processing/processor";
import { PostgresProcessingRepository } from "@/lib/processing/postgres-repository";
import { RuleBasedSignalExtractor } from "@/lib/processing/signal-extractor";

export function createDocumentProcessor(): DocumentProcessor {
  return new DocumentProcessor({
    repository: new PostgresProcessingRepository(),
    classifier: new RuleBasedDocumentClassifier(),
    locationResolver: new RuleBasedLocationResolver(),
    signalExtractor: new RuleBasedSignalExtractor(),
    incidentExtractor: new RuleBasedIncidentExtractor(),
    tenderExtractor: new NoopTenderExtractor(),
    budgetExtractor: new NoopBudgetExtractor(),
  });
}
