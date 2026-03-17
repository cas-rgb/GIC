export interface SourceRegistrySummaryRow {
  province: string | null;
  sourceCount: number;
  officialCount: number;
  kpiTruthCount: number;
}

export interface SourceRegistryTypeRow {
  sourceType: string;
  sourceCount: number;
}

export interface SourceRegistrySummaryResponse {
  totals: {
    sourceCount: number;
    verifiedCount: number;
    officialKpiTruthCount: number;
  };
  byProvince: SourceRegistrySummaryRow[];
  byType: SourceRegistryTypeRow[];
  trace: {
    table: string;
  };
}

export interface SourceHealthSummaryRow {
  sourceId: string;
  sourceName: string;
  sourceType: string;
  province: string | null;
  healthStatus: "healthy" | "stale" | "failing" | "never_run";
  lastAttemptedAt: string | null;
  lastIngestedAt: string | null;
  lastError: string | null;
  hoursSinceSuccess: number | null;
}

export interface SourceHealthProvinceRow {
  province: string | null;
  activeSourceCount: number;
  healthyCount: number;
  staleCount: number;
  failingCount: number;
  neverRunCount: number;
  refreshedLast24hCount: number;
  latestSuccessAt: string | null;
}

export interface SourceHealthSummaryResponse {
  province: string | null;
  totals: {
    activeSourceCount: number;
    healthyCount: number;
    staleCount: number;
    failingCount: number;
    neverRunCount: number;
    refreshedLast24hCount: number;
    latestSuccessAt: string | null;
  };
  byProvince: SourceHealthProvinceRow[];
  bySource: SourceHealthSummaryRow[];
  trace: {
    table: string;
    query?: string;
  };
}

export interface CitizenVoiceQueryPackRow {
  scopeType: string;
  scopeName: string;
  platform: string;
  issueFamily: string;
  packCount: number;
}

export interface CitizenVoiceIssueRow {
  issueFamily: string;
  packCount: number;
}

export interface CitizenVoiceReadinessResponse {
  totals: {
    packCount: number;
    verifiedCount: number;
    provinceCoverageCount: number;
  };
  byScope: CitizenVoiceQueryPackRow[];
  byIssue: CitizenVoiceIssueRow[];
  trace: {
    table: string;
  };
}
