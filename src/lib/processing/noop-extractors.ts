import {
  BudgetExtractor,
  TenderExtractor,
} from "@/lib/processing/contracts";
import {
  DocumentClassification,
  DocumentRecord,
  NormalizedBudget,
  NormalizedTender,
} from "@/lib/processing/types";

export class NoopTenderExtractor implements TenderExtractor {
  async extract(
    _document: DocumentRecord,
    _classification: DocumentClassification
  ): Promise<NormalizedTender[]> {
    return [];
  }
}

export class NoopBudgetExtractor implements BudgetExtractor {
  async extract(
    _document: DocumentRecord,
    _classification: DocumentClassification
  ): Promise<NormalizedBudget[]> {
    return [];
  }
}
