import { SignalExtractor } from "@/lib/processing/contracts";
import {
  CanonicalSector,
  DocumentClassification,
  DocumentRecord,
  NormalizedSignal,
} from "@/lib/processing/types";

const SIGNAL_RULES: Array<{
  sector: CanonicalSector;
  signalType: string;
  sentiment: "positive" | "neutral" | "negative";
  severityScore: number;
  urgencyScore: number;
  patterns: RegExp[];
}> = [
  {
    sector: "Civil",
    signalType: "water_outage",
    sentiment: "negative",
    severityScore: 82,
    urgencyScore: 88,
    patterns: [/water outage/i, /no water/i, /water cuts/i, /burst pipe/i],
  },
  {
    sector: "Roads",
    signalType: "road_damage",
    sentiment: "negative",
    severityScore: 70,
    urgencyScore: 68,
    patterns: [/pothole/i, /road damage/i, /bridge damage/i, /road collapse/i],
  },
  {
    sector: "Health",
    signalType: "facility_pressure",
    sentiment: "negative",
    severityScore: 76,
    urgencyScore: 72,
    patterns: [/clinic shortage/i, /hospital backlog/i, /medical supplies/i],
  },
  {
    sector: "Planning",
    signalType: "development_notice",
    sentiment: "neutral",
    severityScore: 34,
    urgencyScore: 28,
    patterns: [/rezoning/i, /spatial plan/i, /development application/i],
  },
  {
    sector: "Structural",
    signalType: "structural_risk",
    sentiment: "negative",
    severityScore: 84,
    urgencyScore: 79,
    patterns: [/structural damage/i, /unsafe building/i, /collapse/i],
  },
];

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export class RuleBasedSignalExtractor implements SignalExtractor {
  async extract(
    document: DocumentRecord,
    classification: DocumentClassification
  ): Promise<NormalizedSignal[]> {
    const sentences = splitSentences(`${document.title}. ${document.contentText}`).slice(
      0,
      50
    );
    const signals: NormalizedSignal[] = [];

    for (const sentence of sentences) {
      for (const rule of SIGNAL_RULES) {
        if (!rule.patterns.some((pattern) => pattern.test(sentence))) {
          continue;
        }

        if (
          classification.sectorHints.length > 0 &&
          !classification.sectorHints.includes(rule.sector)
        ) {
          continue;
        }

        signals.push({
          sector: rule.sector,
          signalType: rule.signalType,
          sentiment: rule.sentiment,
          severityScore: rule.severityScore,
          urgencyScore: rule.urgencyScore,
          confidenceScore: 0.72,
          eventDate: document.publishedAt,
          summaryText: sentence.slice(0, 400),
          sourceUrl: document.url,
        });

        if (signals.length >= 5) {
          return signals;
        }
      }
    }

    if (signals.length === 0) {
      signals.push({
        sector: classification.sectorHints[0] ?? "Civil",
        signalType: "general_signal",
        sentiment: "neutral",
        severityScore: 30,
        urgencyScore: 25,
        confidenceScore: 0.45,
        eventDate: document.publishedAt,
        summaryText: document.title.slice(0, 400),
        sourceUrl: document.url,
      });
    }

    return signals;
  }
}
