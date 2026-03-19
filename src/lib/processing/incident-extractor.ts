import { IncidentExtractor } from "@/lib/processing/contracts";
import {
  DocumentRecord,
  NormalizedIncident,
  NormalizedSignal,
} from "@/lib/processing/types";

function scoreToSeverity(score: number): "Low" | "Medium" | "High" {
  if (score >= 75) {
    return "High";
  }

  if (score >= 45) {
    return "Medium";
  }

  return "Low";
}

function inferServiceDomain(signalType: string, summaryText: string): string {
  const corpus = `${signalType} ${summaryText}`.toLowerCase();

  if (corpus.includes("water") || corpus.includes("sewer")) {
    return "Water Infrastructure";
  }

  if (
    corpus.includes("road") ||
    corpus.includes("bridge") ||
    corpus.includes("pothole")
  ) {
    return "Roads and Transport";
  }

  if (
    corpus.includes("clinic") ||
    corpus.includes("hospital") ||
    corpus.includes("medical")
  ) {
    return "Healthcare";
  }

  if (corpus.includes("structural") || corpus.includes("building")) {
    return "Provincial Infrastructure";
  }

  return "Other";
}

export class RuleBasedIncidentExtractor implements IncidentExtractor {
  async extract(
    _document: DocumentRecord,
    signals: NormalizedSignal[],
  ): Promise<NormalizedIncident[]> {
    return signals
      .filter(
        (signal) =>
          signal.sentiment === "negative" && signal.severityScore >= 45,
      )
      .map((signal) => {
        const lowerSummary = signal.summaryText.toLowerCase();

        return {
          serviceDomain: inferServiceDomain(
            signal.signalType,
            signal.summaryText,
          ),
          incidentType: signal.signalType,
          failureIndicator: signal.severityScore >= 55,
          citizenPressureIndicator:
            /protest|anger|frustration|residents|complaint|shutdown/.test(
              lowerSummary,
            ),
          protestIndicator: /protest|march|blockade|shutdown/.test(
            lowerSummary,
          ),
          responseIndicator:
            /restored|repair|response|intervention|dispatched/.test(
              lowerSummary,
            ),
          recurrenceIndicator: /again|recurring|ongoing|repeated/.test(
            lowerSummary,
          ),
          severity: scoreToSeverity(signal.severityScore),
          classificationConfidence: signal.confidenceScore,
          openedAt: signal.eventDate,
          closedAt: null,
        };
      })
      .filter(
        (incident) =>
          incident.failureIndicator || incident.citizenPressureIndicator,
      );
  }
}
