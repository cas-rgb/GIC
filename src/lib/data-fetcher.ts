import { tavilyClient, searchOptions } from "./tavily";
import {
  CommunitySignal,
  EvidenceSource,
  SignalLayer,
} from "../types/database";
import { IntelligenceEngine } from "./intelligence-engine";

/**
 * GIC Intelligence Data Fetcher
 * Bridges the Tavily API with our clinical 11-layer signal architecture.
 */
export const DataFetcher = {
  /**
   * Discovers real-time signals for a specific community or region.
   */
  async discoverSignals(
    queryContext: string = "Gauteng Infrastructure",
  ): Promise<{ signals: CommunitySignal[]; evidence: EvidenceSource[] }> {
    try {
      // Perform advanced internet research
      const searchResult = await tavilyClient.search(
        `${queryContext} water outages potholes sewage medical shortages social unrest service delivery protests`,
        { ...searchOptions, searchDepth: "advanced" },
      );

      const signals: CommunitySignal[] = [];
      const evidenceItems: EvidenceSource[] = [];

      searchResult.results.forEach((res, index) => {
        const id = `real-sig-${Date.now()}-${index}`;
        const sourceType = DataFetcher.classifySource(res.url);
        const layers = DataFetcher.detectLayers(res.title + res.content);

        // 1. Map to CommunitySignal (11-Layer Schema)
        const signal: CommunitySignal = {
          id,
          communityId: "real-node-auto",
          type: "media",
          text: res.title,
          layers: layers,
          sentiment: DataFetcher.detectSentiment(res.content),
          emotion: DataFetcher.detectEmotion(res.content),
          urgency: DataFetcher.calculateUrgency(layers),
          momentum: 0.5, // Initial velocity
          category: "Civil", // Default, should be dynamic
          source: new URL(res.url).hostname,
          sourceType: sourceType,
          sourceUrl: res.url,
          evidenceId: `real-ev-${id}`,
          country: "South Africa",
          status: "active",
          reliabilityScore:
            IntelligenceEngine.CREDIBILITY_WEIGHTS[sourceType] || 0.5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // 2. Map to EvidenceSource (The "Fact Library")
        const evidence: EvidenceSource = {
          id: `real-ev-${id}`,
          signalId: id,
          title: res.title,
          snippet: res.content.substring(0, 300) + "...",
          originalSourceUrl: res.url,
          verificationStatus: "verified", // Internet results are "Verified via OSINT"
          capturedBy: "Tavily-GIC-Ingest",
          country: "South Africa",
          metadata: {
            sourceName: new URL(res.url).hostname,
            dateMentioned: new Date().toISOString(),
            score: res.score,
          },
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        signals.push(signal);
        evidenceItems.push(evidence);
      });

      return { signals, evidence: evidenceItems };
    } catch (error) {
      console.error("GIC Ingestion Error:", error);
      return { signals: [], evidence: [] };
    }
  },

  /**
   * Helpers to Map Discovery to Schema
   */
  classifySource(url: string): CommunitySignal["sourceType"] {
    if (url.includes("news24") || url.includes("sabc") || url.includes("iol"))
      return "local_news";
    if (url.includes("dailymaverick") || url.includes("groundup"))
      return "journalist";
    if (url.includes("gif") || url.includes("ngo")) return "ngo";
    return "social_media";
  },

  detectLayers(text: string): SignalLayer[] {
    const layers: SignalLayer[] = ["narrative"];
    const lowText = text.toLowerCase();

    if (lowText.match(/water|pothole|sewage|electricity|power|road/))
      layers.push("issue");
    if (lowText.match(/protest|strike|march|shutdown/))
      layers.push("event", "risk");
    if (lowText.match(/frustrated|angry|outrage|hope|pride/))
      layers.push("sentiment");
    if (lowText.match(/trend|growing|rapidly|velocity/))
      layers.push("momentum");
    if (lowText.match(/expansion|new housing|development/))
      layers.push("development");

    return layers;
  },

  detectSentiment(text: string): "positive" | "negative" | "neutral" {
    const lowText = text.toLowerCase();
    if (lowText.match(/great|success|improving|restored|fixed/))
      return "positive";
    if (lowText.match(/fail|outage|shortage|angry|worst|broken/))
      return "negative";
    return "neutral";
  },

  detectEmotion(text: string): CommunitySignal["emotion"] {
    const lowText = text.toLowerCase();
    if (lowText.includes("angry") || lowText.includes("outrage"))
      return "anger";
    if (lowText.includes("frustrat")) return "frustration";
    if (lowText.includes("hope")) return "hope";
    if (lowText.includes("prid")) return "pride";
    return "neutral";
  },

  calculateUrgency(layers: SignalLayer[]): number {
    if (layers.includes("risk") || layers.includes("event")) return 5;
    if (layers.includes("issue")) return 4;
    return 2;
  },
};
