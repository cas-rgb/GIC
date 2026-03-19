/**
 * GIC Executive Intelligence Platform
 * Governance & Reporting Schema
 *
 * Defines the strict structural layer for governed metrics,
 * data lineage, and confidence scoring.
 */

export type ConfidenceRating =
  | "HIGH" // Extensive cross-verified data
  | "PARTIAL" // Limited source coverage
  | "LOW" // Minimal signals detected
  | "INSUFFICIENT"; // Awaiting source integration

export interface DataTrace {
  table: string;
  query: string;
  sourceCount: number;
  timestamp: string;
}

export interface GovernedMetric<T = number> {
  id: string;
  label: string;
  value: T | null;
  unit?: string;
  confidence: number; // 0.0 - 1.0
  rating: ConfidenceRating;
  trace: DataTrace[];
  governanceNote?: string;
}

export const METRIC_REGISTRY = {
  SOS: {
    id: "gic.strategic.sos",
    label: "Strategic Opportunity Score",
    description:
      "Weighted index of infrastructure momentum, stability, and risk.",
  },
  PORTFOLIO_DENSITY: {
    id: "gic.infrastructure.density",
    label: "Portfolio Project Density",
    description: "Concentration of active tenders and projects per region.",
  },
  RISK_INTENSITY: {
    id: "gic.risk.intensity",
    label: "Regional Risk Intensity",
    description:
      "Aggregated severity of detected environmental and social risks.",
  },
  DELIVERY_CONFIDENCE: {
    id: "gic.executive.delivery",
    label: "National Delivery Confidence",
    description:
      "Calculated reliability of project timelines and budget alignment.",
  },
  PUBLIC_CONCERN_VOLUME: {
    id: "gic.province.concern_volume",
    label: "Public Concern Volume",
    description: "Total number of validated issue mentions in the province.",
  },
  TOP_PUBLIC_CONCERN: {
    id: "gic.province.top_concern",
    label: "Top Public Concern",
    description: "Most frequently mentioned issue topic by share of voice.",
  },
  CONCERN_VELOCITY: {
    id: "gic.province.concern_velocity",
    label: "Concern Velocity",
    description: "Change in issue mentions relative to 7-day average.",
  },
  GOVERNMENT_ALIGNMENT: {
    id: "gic.province.alignment",
    label: "Government Alignment Score",
    description:
      "Comparison of citizen concern frequency vs provincial budget allocation.",
  },
  // --- DASHBOARD 2: SERVICE DELIVERY PRESSURE ---
  ACTIVE_PRESSURE: {
    id: "gic.ops.active_pressure",
    label: "Active Service Pressure",
    description: "Total count of validated service delivery pressure cases.",
  },
  TOP_PRESSURE_DOMAIN: {
    id: "gic.ops.top_domain",
    label: "Top Pressure Domain",
    description: "Service domain most associated with citizen frustration.",
  },
  PRESSURE_TRAJECTORY: {
    id: "gic.ops.trajectory",
    label: "Pressure Trajectory",
    description: "Whether pressure cases are rising, stable, or easing.",
  },
  MOST_EXPOSED_MUNI: {
    id: "gic.ops.exposed_muni",
    label: "Most Exposed Municipality",
    description:
      "Municipality with the highest concentration of service strain.",
  },
  PRESSURE_BREAKDOWN: {
    id: "gic.ops.breakdown",
    label: "Service Delivery Pressure Breakdown",
    description: "Operational friction by functional system.",
  },
  PRESSURE_TREND: {
    id: "gic.ops.trend",
    label: "Pressure Escalation Trend",
    description: "30-day velocity of service failure signals.",
  },
  MUNI_EXPOSURE: {
    id: "gic.ops.exposure_ranking",
    label: "Municipality Exposure Ranking",
    description: "Municipalities ranked by combined severity and frequency.",
  },
  STRESS_MATRIX: {
    id: "gic.ops.stress_matrix",
    label: "Community Stress & Escalation Matrix",
    description: "Quadrant analysis of pressure vs acceleration.",
  },
} as const;

export function calculateConfidence(
  sources: { count: number; expected: number }[],
): number {
  if (sources.length === 0) return 0;
  const totalWeight = sources.length;
  const sum = sources.reduce(
    (acc, s) => acc + Math.min(s.count / s.expected, 1.0),
    0,
  );
  return sum / totalWeight;
}

export function getConfidenceRating(score: number): ConfidenceRating {
  if (score >= 0.8) return "HIGH";
  if (score >= 0.5) return "PARTIAL";
  if (score > 0.1) return "LOW";
  return "INSUFFICIENT";
}
