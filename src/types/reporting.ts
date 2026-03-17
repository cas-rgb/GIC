// src/types/reporting.ts
import { ConfidenceRating, DataTrace } from '@/lib/reporting-schema';

export type ConfidenceLevel = ConfidenceRating;

export interface MetricTrace extends DataTrace {
  metricName: string;
  sourceTables: string[];
  generatedAt: string;
  queryContext?: string[];
  notes?: string[];
}

export interface GovernedMetric<T = unknown> {
  id: string;
  label: string;
  value: T | null;
  confidence: number; // 0.0 - 1.0
  rating: ConfidenceRating;
  sourceCount: number;
  trace: DataTrace[];
  governanceNote?: string;
  emptyState?: 'Insufficient Data' | 'Awaiting Source Integration' | 'Partial Coverage';
}
