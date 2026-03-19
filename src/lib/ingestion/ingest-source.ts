import { enqueueProcessDocument } from "@/lib/jobs/enqueue";
import {
  computeContentHash,
  normalizeFetchedDocument,
} from "@/lib/ingestion/normalize";
import {
  documentExistsByHash,
  insertDocument,
} from "@/lib/ingestion/repository";
import {
  IngestionResult,
  IngestionSourceConfig,
  SourceConnector,
} from "@/lib/ingestion/types";

export async function ingestSource(
  connector: SourceConnector,
  config: IngestionSourceConfig,
  parserVersion = "ingestion-v1",
): Promise<IngestionResult> {
  const result: IngestionResult = {
    fetched: 0,
    inserted: 0,
    skipped: 0,
    enqueued: 0,
    errors: [],
  };

  const fetchedDocuments = await connector.fetch(config);
  result.fetched = fetchedDocuments.length;

  for (const rawDocument of fetchedDocuments) {
    try {
      const document = normalizeFetchedDocument(rawDocument);

      if (!document.title || !document.contentText || !document.url) {
        result.skipped += 1;
        continue;
      }

      const contentHash = computeContentHash(document);
      const exists = await documentExistsByHash(contentHash);

      if (exists) {
        result.skipped += 1;
        continue;
      }

      const documentId = await insertDocument({
        sourceId: config.sourceId,
        externalId: document.externalId,
        url: document.url,
        title: document.title,
        publishedAt: document.publishedAt,
        docType: document.docTypeHint ?? "article",
        language: document.language ?? "en",
        contentText: document.contentText,
        contentHash,
        parserVersion,
      });

      result.inserted += 1;

      await enqueueProcessDocument({
        documentId,
        sourceId: config.sourceId,
        parserVersion: "processor-v1",
        processingMode: "full",
      });

      result.enqueued += 1;
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return result;
}
