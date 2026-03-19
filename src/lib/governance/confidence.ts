// src/lib/governance/confidence.ts
import { ConfidenceRating } from "@/lib/reporting-schema";

export function toConfidence(sourceCount: number): ConfidenceRating {
  if (sourceCount >= 20) return "HIGH";
  if (sourceCount >= 8) return "PARTIAL";
  if (sourceCount >= 3) return "LOW";
  return "INSUFFICIENT";
}

export function emptyStateFor(confidence: ConfidenceRating) {
  if (confidence === "INSUFFICIENT") return "Insufficient Data";
  if (confidence === "LOW") return "Partial Coverage";
  return undefined;
}
