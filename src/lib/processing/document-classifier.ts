import { DocumentClassifier } from "@/lib/processing/contracts";
import {
  CanonicalDocType,
  CanonicalSector,
  DocumentClassification,
  DocumentRecord,
} from "@/lib/processing/types";

const DOC_TYPE_RULES: Array<{
  type: CanonicalDocType;
  patterns: RegExp[];
}> = [
  {
    type: "tender",
    patterns: [/tender/i, /rfp/i, /bid number/i, /closing date/i],
  },
  {
    type: "budget",
    patterns: [/budget vote/i, /appropriation/i, /medium term/i, /allocation/i],
  },
  {
    type: "report",
    patterns: [/annual report/i, /oversight report/i, /audit report/i],
  },
  {
    type: "notice",
    patterns: [/public notice/i, /gazette/i, /notice is hereby given/i],
  },
  { type: "article", patterns: [/.+/i] },
];

const SECTOR_RULES: Array<{ sector: CanonicalSector; patterns: RegExp[] }> = [
  {
    sector: "Civil",
    patterns: [/water/i, /sewer/i, /sanitation/i, /wastewater/i],
  },
  { sector: "Roads", patterns: [/road/i, /pothole/i, /bridge/i, /transport/i] },
  {
    sector: "Health",
    patterns: [/clinic/i, /hospital/i, /health/i, /medical/i],
  },
  {
    sector: "Planning",
    patterns: [
      /rezoning/i,
      /spatial/i,
      /idp/i,
      /land use/i,
      /housing development/i,
    ],
  },
  {
    sector: "Structural",
    patterns: [/building/i, /collapse/i, /structural/i, /facility/i],
  },
  {
    sector: "Apex",
    patterns: [/executive/i, /provincial strategy/i, /intervention plan/i],
  },
];

function detectDocType(text: string): CanonicalDocType {
  for (const rule of DOC_TYPE_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return rule.type;
    }
  }

  return "article";
}

function detectSectorHints(text: string): CanonicalSector[] {
  const sectors = SECTOR_RULES.filter((rule) =>
    rule.patterns.some((pattern) => pattern.test(text)),
  ).map((rule) => rule.sector);

  return sectors.length > 0 ? sectors : ["Civil"];
}

export class RuleBasedDocumentClassifier implements DocumentClassifier {
  async classify(document: DocumentRecord): Promise<DocumentClassification> {
    const corpus = `${document.title}\n${document.contentText}`.slice(0, 10000);

    return {
      docType: detectDocType(corpus),
      sectorHints: detectSectorHints(corpus),
      language: "en",
      confidence: 0.75,
    };
  }
}
