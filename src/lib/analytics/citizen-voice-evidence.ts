import { CitizenVoiceEvidenceResponse } from "@/lib/analytics/types";
import { normalizeIssueFamily } from "@/lib/analytics/issue-taxonomy";
import { query } from "@/lib/db";

interface EvidenceRow {
  documentId: string;
  title: string;
  url: string;
  sourceName: string;
  sourceType: string;
  province: string;
  municipality: string | null;
  issueFamily: string;
  sentimentLabel: string;
  sentimentScore: string | number;
  confidence: string | number;
  publishedAt: string | null;
  excerpt: string;
  sourceKey: string;
}

interface LegacyEvidenceRow {
  documentId: string;
  title: string;
  url: string;
  sourceName: string;
  sourceType: string;
  province: string;
  municipality: string | null;
  rawIssue: string;
  sentimentLabel: string;
  urgency: string | number | null;
  publishedAt: string | null;
  excerpt: string;
  sourceKey: string;
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "string" ? Number(value) : value;
}

function inferLegacySentimentScore(sentimentLabel: string, urgency: number): number {
  if (sentimentLabel === "negative") {
    return urgency * 10;
  }

  if (sentimentLabel === "positive") {
    return Math.max(0, 40 - urgency * 4);
  }

  return Math.max(20, 50 - urgency * 2);
}

export async function getCitizenVoiceEvidence(
  province: string | null,
  municipality: string | null,
  ward: string | null,
  issueFamily: string | null,
  sourceType: string | null,
  days = 30
): Promise<CitizenVoiceEvidenceResponse> {
  const normalizedIssueFamily = normalizeIssueFamily(issueFamily);
  const normalizedWard = ward?.trim() ? ward.trim() : null;
  const normalizedSourceType = sourceType?.trim() ? sourceType.trim() : null;
  const params = [province, municipality, normalizedWard, normalizedIssueFamily, normalizedSourceType, days];

  const [citizenDocumentsResult, legacyDocumentsResult] = await Promise.all([
    query<EvidenceRow>(
      `
        select
          d.id::text as "documentId",
          d.title,
          d.url,
          src.name as "sourceName",
          src.source_type as "sourceType",
          cvm.province,
          cvm.municipality,
          cvm.issue_family as "issueFamily",
          cvm.sentiment_label as "sentimentLabel",
          cvm.sentiment_score as "sentimentScore",
          cvm.confidence,
          d.published_at::text as "publishedAt",
          cvm.evidence_text as excerpt,
          src.id::text as "sourceKey"
        from citizen_voice_mentions cvm
        join documents d on d.id = cvm.document_id
        join sources src on src.id = d.source_id
        left join locations l on l.id = d.location_id
        where ($1::text is null or cvm.province = $1)
          and ($2::text is null or cvm.municipality = $2)
          and ($3::text is null or l.ward = $3)
          and ($4::text is null or cvm.issue_family = $4)
          and ($5::text is null or src.source_type = $5)
          and coalesce(date(d.published_at), date(d.created_at)) >= current_date - ($6::int - 1)
        order by d.published_at desc nulls last, d.created_at desc
        limit 18
      `,
      params
    ),
    query<LegacyEvidenceRow>(
      `
        select
          d.id::text as "documentId",
          d.title,
          d.url,
          src.name as "sourceName",
          src.source_type as "sourceType",
          l.province,
          l.municipality,
          split_part(d.title, '|', 1) as "rawIssue",
          case
            when d.content_text ilike '%Sentiment: negative%' then 'negative'
            when d.content_text ilike '%Sentiment: positive%' then 'positive'
            when d.content_text ilike '%Sentiment: neutral%' then 'neutral'
            else 'neutral'
          end as "sentimentLabel",
          substring(d.content_text from 'Urgency: ([0-9]+)') as urgency,
          d.published_at::text as "publishedAt",
          left(regexp_replace(d.content_text, '\\s+', ' ', 'g'), 260) as excerpt,
          src.id::text as "sourceKey"
        from documents d
        join sources src on src.id = d.source_id
        join locations l on l.id = d.location_id
        where d.parser_version = 'legacy-community-signals-v1'
          and d.status = 'active'
          and ($1::text is null or l.province = $1)
          and ($2::text is null or l.municipality = $2)
          and ($3::text is null or l.ward = $3)
          and ($5::text is null or src.source_type = $5)
          and coalesce(date(d.published_at), date(d.created_at)) >= current_date - ($6::int - 1)
        order by d.published_at desc nulls last, d.created_at desc
        limit 30
      `,
      params
    ),
  ]);

  const citizenDocuments = citizenDocumentsResult.rows;
  const legacyDocuments = legacyDocumentsResult.rows
    .map((row): EvidenceRow | null => {
      const mappedIssueFamily = normalizeIssueFamily(row.rawIssue);
      if (normalizedIssueFamily && mappedIssueFamily !== normalizedIssueFamily) {
        return null;
      }

      const urgency = Math.max(0, Math.min(10, toNumber(row.urgency)));

      return {
        documentId: row.documentId,
        title: row.title,
        url: row.url,
        sourceName: row.sourceName,
        sourceType: row.sourceType,
        province: row.province,
        municipality: row.municipality,
        issueFamily: mappedIssueFamily ?? row.rawIssue.trim().toLowerCase(),
        sentimentLabel: row.sentimentLabel,
        sentimentScore: inferLegacySentimentScore(row.sentimentLabel, urgency),
        confidence: 0.62,
        publishedAt: row.publishedAt,
        excerpt: row.excerpt,
        sourceKey: row.sourceKey,
      };
    })
    .filter((row): row is EvidenceRow => row !== null)
    .slice(0, 12);

  const combinedDocuments = [...citizenDocuments, ...legacyDocuments]
    .sort((left, right) => {
      const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : 0;
      const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : 0;
      return rightTime - leftTime;
    })
    .slice(0, 18);

  const documentIds = new Set<string>();
  const sourceKeys = new Set<string>();
  const sourceTypeCounts = new Map<string, number>();
  const negativeScores = combinedDocuments
    .filter((row) => row.sentimentLabel === "negative")
    .map((row) => toNumber(row.sentimentScore));

  combinedDocuments.forEach((row) => {
    documentIds.add(row.documentId);
    sourceKeys.add(row.sourceKey);
    sourceTypeCounts.set(row.sourceType, (sourceTypeCounts.get(row.sourceType) ?? 0) + 1);
  });

  const dominantSourceType =
    [...sourceTypeCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
  const avgNegativeScore =
    negativeScores.length > 0
      ? Number(
          (
            negativeScores.reduce((sum, value) => sum + value, 0) / negativeScores.length
          ).toFixed(2)
        )
      : 0;
  const legacyDocumentIds = new Set(legacyDocuments.map((row) => row.documentId));

  return {
    province,
    municipality,
    ward: normalizedWard,
    issueFamily: normalizedIssueFamily,
    days,
    summary: {
      documentCount: documentIds.size,
      sourceCount: sourceKeys.size,
      legacyDocumentCount: [...documentIds].filter((documentId) => legacyDocumentIds.has(documentId)).length,
      avgNegativeScore,
      dominantSourceType,
    },
    documents: combinedDocuments.map((row) => ({
      documentId: row.documentId,
      title: row.title,
      url: row.url,
      sourceName: row.sourceName,
      sourceType: row.sourceType,
      province: row.province,
      municipality: row.municipality,
      issueFamily: row.issueFamily,
      sentimentLabel: row.sentimentLabel,
      sentimentScore: toNumber(row.sentimentScore),
      confidence: toNumber(row.confidence),
      publishedAt: row.publishedAt,
      excerpt: row.excerpt,
    })),
    caveats: [
      "These are governed documents matched into the public-pressure layer; they are evidence for resident and civic pressure, not official KPI truth.",
      normalizedWard
        ? `Ward slicing is only applied where the governed document already carries a formal ward mapping for ${normalizedWard}.`
        : "Ward slicing is only available when the underlying document already carries a formal ward mapping.",
      normalizedSourceType
        ? `Source filtering is currently limited to governed documents already tagged as ${normalizedSourceType}.`
        : "Source filtering is only available where the underlying document already carries a governed source-type tag.",
      "The evidence flow blends normalized citizen-voice documents with imported legacy community signal documents when they match the active issue family.",
    ],
    trace: {
      tables: ["citizen_voice_mentions", "documents", "sources", "locations"],
      query: `province=${province ?? "all"};municipality=${municipality ?? "all"};ward=${normalizedWard ?? "all"};issue=${normalizedIssueFamily ?? "all"};sourceType=${normalizedSourceType ?? "all"};days=${days}`,
    },
  };
}
