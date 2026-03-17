export interface IngestionSourceConfig {
  sourceId: string;
  sourceType:
    | "news"
    | "gov"
    | "internal"
    | "social"
    | "ngo"
    | "treasury"
    | "utility"
    | "stats"
    | "research"
    | "watchdog";
  baseUrl?: string;
  active: boolean;
}

export interface RawFetchedDocument {
  externalId?: string;
  url: string;
  title: string;
  publishedAt?: string | null;
  contentText: string;
  docTypeHint?: "article" | "report" | "tender" | "budget" | "notice";
  language?: string;
  metadata?: Record<string, unknown>;
}

export interface IngestionResult {
  fetched: number;
  inserted: number;
  skipped: number;
  enqueued: number;
  errors: string[];
}

export interface SourceConnector {
  fetch(config: IngestionSourceConfig): Promise<RawFetchedDocument[]>;
}
