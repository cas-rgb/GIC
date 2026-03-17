import {
  DocumentClassification,
  NormalizedBudget,
  NormalizedIncident,
  NormalizedLocation,
  NormalizedSignal,
  NormalizedTender,
  ProcessingQualityReport,
} from "@/lib/processing/types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isIsoDate(value: string | null): boolean {
  if (!value) {
    return true;
  }

  return !Number.isNaN(Date.parse(value));
}

export function validateLocation(location: NormalizedLocation | null): string[] {
  if (!location) {
    return [];
  }

  const errors: string[] = [];

  if (!location.country) {
    errors.push("location country missing");
  }

  if (location.confidence < 0 || location.confidence > 1) {
    errors.push("location confidence out of range");
  }

  return errors;
}

export function validateClassification(
  classification: DocumentClassification
): string[] {
  const errors: string[] = [];

  if (!classification.docType) {
    errors.push("docType missing");
  }

  if (classification.confidence < 0 || classification.confidence > 1) {
    errors.push("classification confidence out of range");
  }

  return errors;
}

export function normalizeSignal(signal: NormalizedSignal): NormalizedSignal {
  return {
    ...signal,
    severityScore: clamp(signal.severityScore, 0, 100),
    urgencyScore: clamp(signal.urgencyScore, 0, 100),
    confidenceScore: clamp(signal.confidenceScore, 0, 1),
    summaryText: signal.summaryText.trim(),
  };
}

export function validateSignal(signal: NormalizedSignal): string[] {
  const errors: string[] = [];

  if (!signal.summaryText) {
    errors.push("signal summary empty");
  }

  if (signal.severityScore < 0 || signal.severityScore > 100) {
    errors.push("signal severity out of range");
  }

  if (signal.urgencyScore < 0 || signal.urgencyScore > 100) {
    errors.push("signal urgency out of range");
  }

  if (signal.confidenceScore < 0 || signal.confidenceScore > 1) {
    errors.push("signal confidence out of range");
  }

  if (!isIsoDate(signal.eventDate)) {
    errors.push("signal eventDate invalid");
  }

  return errors;
}

export function validateIncident(incident: NormalizedIncident): string[] {
  const errors: string[] = [];

  if (!incident.serviceDomain) {
    errors.push("incident serviceDomain missing");
  }

  if (!incident.incidentType) {
    errors.push("incident incidentType missing");
  }

  if (
    incident.classificationConfidence < 0 ||
    incident.classificationConfidence > 1
  ) {
    errors.push("incident confidence out of range");
  }

  if (!isIsoDate(incident.openedAt)) {
    errors.push("incident openedAt invalid");
  }

  if (!isIsoDate(incident.closedAt)) {
    errors.push("incident closedAt invalid");
  }

  return errors;
}

export function validateTender(tender: NormalizedTender): string[] {
  const errors: string[] = [];

  if (!tender.title) {
    errors.push("tender title missing");
  }

  if (!isIsoDate(tender.closingDate)) {
    errors.push("tender closingDate invalid");
  }

  if (tender.estimatedValue !== null && tender.estimatedValue < 0) {
    errors.push("tender estimatedValue negative");
  }

  return errors;
}

export function validateBudget(budget: NormalizedBudget): string[] {
  const errors: string[] = [];

  if (!budget.programName) {
    errors.push("budget programName missing");
  }

  if (budget.budgetAmount <= 0) {
    errors.push("budget amount must be positive");
  }

  if (!isIsoDate(budget.periodStart)) {
    errors.push("budget periodStart invalid");
  }

  if (!isIsoDate(budget.periodEnd)) {
    errors.push("budget periodEnd invalid");
  }

  return errors;
}

export function buildQualityReport(input: {
  errors: string[];
  warnings?: string[];
  confidences?: number[];
}): ProcessingQualityReport {
  const confidences = input.confidences ?? [];
  const averageConfidence =
    confidences.length > 0
      ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length
      : 0;

  return {
    passed: input.errors.length === 0,
    errors: input.errors,
    warnings: input.warnings ?? [],
    extractionConfidence: Number(averageConfidence.toFixed(3)),
  };
}
