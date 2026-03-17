import { createHash } from "crypto";

import { RawFetchedDocument } from "@/lib/ingestion/types";

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function normalizeFetchedDocument(
  document: RawFetchedDocument
): RawFetchedDocument {
  return {
    ...document,
    title: normalizeWhitespace(document.title),
    contentText: normalizeWhitespace(document.contentText),
    language: document.language ?? "en",
  };
}

export function computeContentHash(document: RawFetchedDocument): string {
  return createHash("sha256")
    .update(`${document.title}\n${document.contentText}`)
    .digest("hex");
}
