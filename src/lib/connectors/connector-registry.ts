import { DataConnector } from "@/types/connectors";

export const MOCK_CONNECTORS: DataConnector[] = [
  {
    id: "conn-news-01",
    name: "SABC & News24 Feed",
    type: "news_feed",
    isEnabled: true,
    lastIngestedAt: new Date().toISOString(),
    status: "success",
    credibilityScore: 0.95,
    health: { uptime: 99.8, errorCount: 2, latencyMs: 420 },
    config: { url: "https://news.sa/rss" },
    retryLimit: 3,
    geographicFocus: ["South Africa"],
  },
  {
    id: "conn-social-01",
    name: "Twitter Social Listening",
    type: "social_media",
    isEnabled: false,
    status: "idle",
    credibilityScore: 0.65,
    health: { uptime: 94.2, errorCount: 45, latencyMs: 1200 },
    config: { keywords: ["infrastructure", "protest", "service delivery"] },
    retryLimit: 5,
    geographicFocus: ["Gauteng", "KZN"],
  },
  {
    id: "conn-manual-01",
    name: "CSV Infrastructure Audit",
    type: "csv_import",
    isEnabled: true,
    lastIngestedAt: new Date().toISOString(),
    status: "failed",
    credibilityScore: 1.0,
    health: {
      uptime: 100,
      errorCount: 1,
      latencyMs: 0,
      lastError: "Invalid date format in row 45",
    },
    config: { allowedUsers: ["admin-01"] },
    retryLimit: 0,
  },
  {
    id: "conn-tavily-01",
    name: "Tavily Deep Search",
    type: "tavily_enrichment",
    isEnabled: false,
    status: "idle",
    credibilityScore: 0.9,
    health: { uptime: 100, errorCount: 0, latencyMs: 0 },
    config: { apiKeySource: "ENV" },
    retryLimit: 2,
  },
];

export class ConnectorRegistry {
  private static connectors: DataConnector[] = MOCK_CONNECTORS;

  static getConnectors() {
    return this.connectors;
  }

  static toggleConnector(id: string) {
    this.connectors = this.connectors.map((c) =>
      c.id === id ? { ...c, isEnabled: !c.isEnabled } : c,
    );
    return this.connectors;
  }

  static getHealthSummary() {
    const active = this.connectors.filter((c) => c.isEnabled).length;
    const healthy = this.connectors.filter(
      (c) => c.status === "success",
    ).length;
    const failed = this.connectors.filter((c) => c.status === "failed").length;

    return { active, healthy, failed, total: this.connectors.length };
  }
}
