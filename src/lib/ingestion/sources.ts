import { IngestionSourceConfig } from "@/lib/ingestion/types";

export const INGESTION_SOURCES: IngestionSourceConfig[] = [
  {
    sourceId:
      process.env.V2_NEWS_SOURCE_ID ?? "00000000-0000-0000-0000-000000000001",
    sourceType: "news",
    baseUrl: process.env.V2_NEWS_RSS_URL,
    active: process.env.V2_NEWS_SOURCE_ACTIVE === "true",
  },
];
