import { IngestionRecord, DataConnector } from "@/types/connectors";

export class IngestionValidator {
  /**
   * Simulates geographic tagging for raw content.
   */
  static tagGeography(content: string): string[] {
    const regions = [
      "Gauteng",
      "KZN",
      "Western Cape",
      "Limpopo",
      "Maseru",
      "Mbabane",
    ];
    return regions.filter((region) =>
      content.toLowerCase().includes(region.toLowerCase()),
    );
  }

  /**
   * Simulates duplicate detection.
   */
  static detectDuplicates(
    record: Partial<IngestionRecord>,
    existingRecords: IngestionRecord[],
  ): string | undefined {
    const match = existingRecords.find(
      (r) =>
        r.normalizedContent.title === record.normalizedContent?.title ||
        r.rawContent?.id === record.rawContent?.id,
    );
    return match?.id;
  }

  /**
   * Classifies severity based on keywords.
   */
  static classifySeverity(
    content: string,
  ): "critical" | "high" | "medium" | "low" {
    const criticalKeywords = ["protest", "outage", "collapse", "extreme"];
    const highKeywords = ["delay", "warning", "shortage"];

    const lowerContent = content.toLowerCase();
    if (criticalKeywords.some((k) => lowerContent.includes(k)))
      return "critical";
    if (highKeywords.some((k) => lowerContent.includes(k))) return "high";
    return "medium";
  }

  /**
   * Normalizes raw data into GIC protocol format.
   */
  static normalize(connector: DataConnector, rawData: any): IngestionRecord {
    const title = rawData.title || rawData.headline || "Untitled Broadcast";
    const description = rawData.summary || rawData.content || "";

    const geography = this.tagGeography(description);
    const severity = this.classifySeverity(description);

    return {
      id: `rec-${Math.random().toString(36).substr(2, 9)}`,
      sourceId: connector.id,
      rawContent: rawData,
      normalizedContent: {
        title,
        description,
        geography,
        category: rawData.category || "General",
        severity,
      },
      status: "pending_review",
      ingestedAt: new Date().toISOString(),
    };
  }
}
