import {
  BudgetExtractor,
  DocumentClassifier,
  IncidentExtractor,
  LocationResolver,
  SignalExtractor,
  TenderExtractor,
} from "@/lib/processing/contracts";
import { ProcessingRepository } from "@/lib/processing/repository";
import {
  ProcessDocumentJob,
  ProcessedDocumentResult,
} from "@/lib/processing/types";
import {
  buildQualityReport,
  normalizeSignal,
  validateBudget,
  validateClassification,
  validateIncident,
  validateLocation,
  validateSignal,
  validateTender,
} from "@/lib/processing/validators";

interface ProcessorDependencies {
  repository: ProcessingRepository;
  classifier: DocumentClassifier;
  locationResolver: LocationResolver;
  signalExtractor: SignalExtractor;
  incidentExtractor: IncidentExtractor;
  tenderExtractor: TenderExtractor;
  budgetExtractor: BudgetExtractor;
}

export class DocumentProcessor {
  constructor(private readonly dependencies: ProcessorDependencies) {}

  async process(job: ProcessDocumentJob): Promise<ProcessedDocumentResult> {
    const document = await this.dependencies.repository.getDocument(job.documentId);

    if (!document.contentText.trim()) {
      const quality = buildQualityReport({
        errors: ["document content is empty"],
      });

      await this.dependencies.repository.markProcessed(
        document.id,
        job.parserVersion,
        quality
      );

      throw new Error("document content is empty");
    }

    const classification = await this.dependencies.classifier.classify(document);
    const location = await this.dependencies.locationResolver.resolve(
      document,
      classification
    );

    const signals = (
      await this.dependencies.signalExtractor.extract(document, classification)
    ).map(normalizeSignal);
    const incidents = await this.dependencies.incidentExtractor.extract(
      document,
      signals
    );
    const tenders = await this.dependencies.tenderExtractor.extract(
      document,
      classification
    );
    const budgets = await this.dependencies.budgetExtractor.extract(
      document,
      classification
    );

    const errors = [
      ...validateClassification(classification),
      ...validateLocation(location),
      ...signals.flatMap(validateSignal),
      ...incidents.flatMap(validateIncident),
      ...tenders.flatMap(validateTender),
      ...budgets.flatMap(validateBudget),
    ];

    const quality = buildQualityReport({
      errors,
      warnings: [],
      confidences: [
        classification.confidence,
        ...(location ? [location.confidence] : []),
        ...signals.map((signal) => signal.confidenceScore),
        ...incidents.map((incident) => incident.classificationConfidence),
      ],
    });

    if (quality.passed) {
      const locationId = location
        ? await this.dependencies.repository.upsertLocation(location)
        : null;
      const signalIds = await this.dependencies.repository.saveSignals(
        document.id,
        locationId,
        signals
      );

      await this.dependencies.repository.saveIncidents(
        signalIds,
        locationId,
        incidents
      );
      await this.dependencies.repository.saveTenders(
        document.id,
        locationId,
        tenders
      );
      await this.dependencies.repository.saveBudgets(
        document.id,
        locationId,
        budgets
      );
    }

    await this.dependencies.repository.markProcessed(
      document.id,
      job.parserVersion,
      quality
    );

    return {
      documentId: document.id,
      location,
      documentClassification: classification,
      signals,
      incidents,
      tenders,
      budgets,
      quality,
    };
  }
}
