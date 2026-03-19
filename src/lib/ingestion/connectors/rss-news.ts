import { parseStringPromise } from "xml2js";

import {
  IngestionSourceConfig,
  RawFetchedDocument,
  SourceConnector,
} from "@/lib/ingestion/types";

interface RssItem {
  guid?: Array<{ _: string } | string>;
  link?: string[];
  title?: string[];
  pubDate?: string[];
  description?: string[];
  "content:encoded"?: string[];
  category?: string[];
}

interface ParsedRss {
  rss?: {
    channel?: Array<{
      item?: RssItem[];
    }>;
  };
}

export class RssNewsConnector implements SourceConnector {
  constructor(private readonly feedUrl: string) {}

  async fetch(_config: IngestionSourceConfig): Promise<RawFetchedDocument[]> {
    const response = await fetch(this.feedUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`rss fetch failed: ${response.status}`);
    }

    const xml = await response.text();
    const parsed = (await parseStringPromise(xml)) as ParsedRss;
    const items = parsed.rss?.channel?.[0]?.item ?? [];

    return items.slice(0, 25).map((item) => {
      const guidValue = item.guid?.[0];
      const externalId =
        typeof guidValue === "string"
          ? guidValue
          : (guidValue?._ ?? item.link?.[0]);

      return {
        externalId,
        url: item.link?.[0] ?? "",
        title: item.title?.[0] ?? "Untitled",
        publishedAt: item.pubDate?.[0]
          ? new Date(item.pubDate[0]).toISOString()
          : null,
        contentText:
          item.description?.[0] ?? item["content:encoded"]?.[0] ?? "",
        docTypeHint: "article",
        language: "en",
        metadata: {
          categories: item.category ?? [],
        },
      };
    });
  }
}
