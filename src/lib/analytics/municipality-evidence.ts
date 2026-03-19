import {
  MunicipalityEvidenceDocumentRow,
  MunicipalityEvidenceMentionRow,
  MunicipalityEvidenceResponse,
} from "@/lib/analytics/types";
import { query } from "@/lib/db";
import {
  expandEvidenceTopics,
  normalizeIssueFamily,
} from "@/lib/analytics/issue-taxonomy";

interface DocumentRow {
  documentId: string;
  title: string;
  url: string;
  sourceName: string;
  sourceType: string;
  publishedAt: string | null;
  mentionCount: number;
  excerpt: string;
}

interface MentionRow {
  topic: string;
  sentimentLabel: string;
  sentimentScore: string | number;
  confidence: string | number;
  evidenceText: string;
  title: string;
  sourceName: string;
}

function toNumber(value: string | number): number {
  return typeof value === "string" ? Number(value) : value;
}

export async function getMunicipalityEvidence(
  province: string,
  municipality: string,
  topic?: string | null,
  ward?: string | null,
): Promise<MunicipalityEvidenceResponse> {
  const normalizedTopic = topic?.trim() ? topic.trim() : null;
  const normalizedWard = ward?.trim() ? ward.trim() : null;
  const evidenceTopics = expandEvidenceTopics(normalizedTopic);
  const normalizedIssueFamily = normalizeIssueFamily(normalizedTopic);

  const [documentResult, mentionResult, summaryResult] = await Promise.all([
    query<DocumentRow>(
      `
        select
          d.id as "documentId",
          d.title,
          d.url,
          src.name as "sourceName",
          src.source_type as "sourceType",
          d.published_at as "publishedAt",
          count(sm.id)::int as "mentionCount",
          left(regexp_replace(d.content_text, '\\s+', ' ', 'g'), 260) as excerpt
        from documents d
        join sources src on src.id = d.source_id
        join locations l on l.id = d.location_id
        left join sentiment_mentions sm on sm.document_id = d.id
        where d.status = 'active'
          and l.province = $1
          and l.municipality = $2
          and ($5::text is null or l.ward = $5)
          and (
            $3::text is null
            or exists (
              select 1
              from sentiment_mentions sm_topic
              where sm_topic.document_id = d.id
                and (
                  sm_topic.topic = any($4::text[])
                  or lower(sm_topic.topic) = any($4::text[])
                )
            )
          )
        group by d.id, d.title, d.url, src.name, src.source_type, d.published_at, d.content_text
        order by coalesce(d.published_at, d.created_at) desc, count(sm.id) desc
        limit 6
      `,
      [province, municipality, normalizedTopic, evidenceTopics, normalizedWard],
    ),
    query<MentionRow>(
      `
        select
          sm.topic,
          sm.sentiment_label as "sentimentLabel",
          sm.sentiment_score as "sentimentScore",
          sm.confidence,
          sm.evidence_text as "evidenceText",
          d.title,
          src.name as "sourceName"
        from sentiment_mentions sm
        join documents d on d.id = sm.document_id
        join sources src on src.id = d.source_id
        join locations l on l.id = d.location_id
        where l.province = $1
          and l.municipality = $2
          and ($5::text is null or l.ward = $5)
          and (
            $3::text is null
            or sm.topic = any($4::text[])
            or lower(sm.topic) = any($4::text[])
          )
        order by coalesce(d.published_at, d.created_at) desc, sm.confidence desc
        limit 8
      `,
      [province, municipality, normalizedTopic, evidenceTopics, normalizedWard],
    ),
    query<{ documentCount: number; mentionCount: number; sourceCount: number }>(
      `
        select
          count(distinct d.id)::int as "documentCount",
          count(sm.id)::int as "mentionCount",
          count(distinct src.id)::int as "sourceCount"
        from documents d
        join sources src on src.id = d.source_id
        join locations l on l.id = d.location_id
        left join sentiment_mentions sm
          on sm.document_id = d.id
         and (
           $3::text is null
           or sm.topic = any($4::text[])
           or lower(sm.topic) = any($4::text[])
         )
        where d.status = 'active'
          and l.province = $1
          and l.municipality = $2
          and ($5::text is null or l.ward = $5)
          and (
            $3::text is null
            or exists (
              select 1
              from sentiment_mentions sm_topic
              where sm_topic.document_id = d.id
                and (
                  sm_topic.topic = any($4::text[])
                  or lower(sm_topic.topic) = any($4::text[])
                )
            )
          )
      `,
      [province, municipality, normalizedTopic, evidenceTopics, normalizedWard],
    ),
  ]);

  return {
    province,
    municipality,
    ward: normalizedWard,
    topic: normalizedIssueFamily ?? normalizedTopic,
    summary: summaryResult.rows[0] ?? {
      documentCount: 0,
      mentionCount: 0,
      sourceCount: 0,
    },
    documents: documentResult.rows.map(
      (row): MunicipalityEvidenceDocumentRow => ({
        documentId: row.documentId,
        title: row.title,
        url: row.url,
        sourceName: row.sourceName,
        sourceType: row.sourceType,
        publishedAt: row.publishedAt,
        mentionCount: row.mentionCount,
        excerpt: row.excerpt,
      }),
    ),
    mentions: mentionResult.rows.map(
      (row): MunicipalityEvidenceMentionRow => ({
        topic: row.topic,
        sentimentLabel: row.sentimentLabel,
        sentimentScore: toNumber(row.sentimentScore),
        confidence: toNumber(row.confidence),
        evidenceText: row.evidenceText,
        title: row.title,
        sourceName: row.sourceName,
      }),
    ),
    caveats: [
      "Municipality evidence drilldown is limited to governed documents that already map to the selected municipality.",
      normalizedWard
        ? `Ward filtering is only applied where governed documents already carry a formal ward mapping for ${normalizedWard}.`
        : "Formal ward filtering is available only where underlying governed documents already carry ward mappings.",
      "Topic filtering follows the governed sentiment topic layer rather than raw keyword search.",
    ],
    trace: {
      table: "documents,sentiment_mentions",
      query: `province=${province};municipality=${municipality};ward=${normalizedWard ?? "all"};topic=${normalizedIssueFamily ?? normalizedTopic ?? "all"}`,
    },
  };
}
