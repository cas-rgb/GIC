export type ConnectorSourceType =
  | "news_feed"
  | "social_media"
  | "public_website"
  | "csv_import"
  | "manual_upload"
  | "tavily_enrichment";

export type IngestionStatus =
  | "idle"
  | "running"
  | "success"
  | "failed"
  | "partially_successful";

export interface ConnectorHealth {
  uptime: number; // percentage
  lastError?: string;
  errorCount: number;
  latencyMs: number;
}

export interface IngestionLog {
  id: string;
  sourceId: string;
  timestamp: string;
  status: IngestionStatus;
  recordsProcessed: number;
  recordsFailed: number;
  errorLog?: string;
  classification: "critical" | "normal" | "low";
}

export interface DataConnector {
  id: string;
  name: string;
  type: ConnectorSourceType;
  isEnabled: boolean;
  lastIngestedAt?: string;
  status: IngestionStatus;
  credibilityScore: number; // 0-1
  health: ConnectorHealth;
  config: Record<string, any>;
  retryLimit: number;
  geographicFocus?: string[];
}

export interface IngestionRecord {
  id: string;
  sourceId: string;
  rawContent: any;
  normalizedContent: {
    title: string;
    description: string;
    geography: string[];
    category: string;
    severity: "critical" | "high" | "medium" | "low";
  };
  status: "pending_review" | "approved" | "rejected" | "auto_processed";
  ingestedAt: string;
  duplicateId?: string; // Reference to existing record if duplicate detected
}
