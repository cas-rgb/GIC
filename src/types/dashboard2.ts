// src/types/dashboard2.ts
import { ConfidenceLevel } from './reporting';
import { DataTrace } from '@/lib/reporting-schema';

export type ServiceDomain =
  | 'Water Infrastructure'
  | 'Electricity Supply'
  | 'Waste Management'
  | 'Sanitation'
  | 'Roads and Transport'
  | 'Public Transport'
  | 'Healthcare'
  | 'Housing and Settlements'
  | 'Local Governance'
  | 'Community Safety'
  | 'Provincial Infrastructure'
  | 'Other';

export type PressureType =
  | 'Outage'
  | 'Delay'
  | 'Breakdown'
  | 'Backlog'
  | 'Complaint'
  | 'Protest'
  | 'Governance Failure'
  | 'Repair / Response'
  | 'Infrastructure Deterioration'
  | 'Access Failure'
  | 'Other';

export type StressStatus =
  | 'Chronic Pressure'
  | 'Escalating Risk'
  | 'Acute Flashpoint'
  | 'Monitored'
  | 'Insufficient Data';

export interface ServicePressureCase {
  id: string;
  sourceId: string;
  province: string;
  municipality: string | null;
  district: string | null;
  serviceDomain: ServiceDomain;
  pressureType: PressureType;
  issueCategory: string | null;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  urgency: 'Low' | 'Medium' | 'High';
  severity: 'Low' | 'Medium' | 'High';
  citizenPressureIndicator: boolean;
  serviceFailureIndicator: boolean;
  protestIndicator: boolean;
  responseIndicator: boolean;
  recurrenceIndicator: boolean;
  infrastructureIndicator: boolean;
  classificationConfidence: number;
  publishedDate: string | null;
}

export interface ProvinceServicePressureBreakdownRow {
  province: string;
  serviceDomain: ServiceDomain;
  pressureCaseCount: number;
  shareOfPressurePercentage: number;
  highSeverityCount: number;
  confidence: ConfidenceLevel;
  sourceCount: number;
  trace: DataTrace[];
}

export interface ProvinceServicePressureTrendRow {
  province: string;
  reportingDate: string;
  serviceDomain: ServiceDomain;
  pressureCaseCount: number;
  rolling7DayAverage: number | null;
  trendDirection: 'UP' | 'DOWN' | 'STABLE' | 'UNKNOWN';
  highSeverityShare: number | null;
  confidence: ConfidenceLevel;
  sourceCount: number;
  trace: DataTrace[];
}

export interface ProvinceMunicipalityExposureRow {
  province: string;
  municipality: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCaseCount: number;
  responseCaseCount: number;
  dominantServiceDomain: ServiceDomain | null;
  confidence: ConfidenceLevel;
  sourceCount: number;
  trace: DataTrace[];
}

export interface ProvinceStressEscalationMatrixRow {
  province: string;
  municipality: string;
  currentPressureScore: number | null;
  recentEscalationScore: number | null;
  severityWeight: number | null;
  stressStatus: StressStatus;
  confidence: ConfidenceLevel;
  methodUsed: 'numeric' | 'partial' | 'none';
  sourceCount: number;
  trace: DataTrace[];
}
