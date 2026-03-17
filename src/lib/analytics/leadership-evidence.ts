import { LeadershipEvidenceDocumentRow, LeadershipEvidenceResponse } from "@/lib/analytics/types";
import { query } from "@/lib/db";

interface DocumentRow {
  documentId: string;
  title: string;
  url: string;
  sourceName: string;
  sourceType: string;
  municipality: string | null;
  publishedAt: string | null;
  mentionCount: number;
  excerpt: string;
}

export async function getLeadershipEvidence(
  province: string,
  leaderName?: string | null,
  office?: string | null,
  days = 30
): Promise<LeadershipEvidenceResponse> {
  const normalizedLeader = leaderName?.trim() || null;
  const normalizedOffice = office?.trim() || null;

  const [documentResult, summaryResult] = await Promise.all([
    query<DocumentRow>(
      `
        select
          d.id as "documentId",
          d.title,
          d.url,
          src.name as "sourceName",
          src.source_type as "sourceType",
          l.municipality,
          d.published_at as "publishedAt",
          count(sm.id)::int as "mentionCount",
          left(regexp_replace(d.content_text, '\\s+', ' ', 'g'), 260) as excerpt
        from documents d
        join sources src on src.id = d.source_id
        join locations l on l.id = d.location_id
        left join sentiment_mentions sm on sm.document_id = d.id
        where d.status = 'active'
          and l.province = $1
          and coalesce(date(d.published_at), date(d.created_at)) >= current_date - ($4::int - 1)
          and (
            $2::text is null
            or d.title ilike ('%' || $2 || '%')
            or d.content_text ilike ('%' || $2 || '%')
            or ($3::text is not null and (d.title ilike ('%' || $3 || '%') or d.content_text ilike ('%' || $3 || '%')))
          )
        group by d.id, d.title, d.url, src.name, src.source_type, l.municipality, d.published_at, d.content_text
        order by coalesce(d.published_at, d.created_at) desc, count(sm.id) desc
        limit 6
      `,
      [province, normalizedLeader, normalizedOffice, days]
    ),
    query<{
      documentCount: number;
      sourceCount: number;
      municipalityCount: number;
    }>(
      `
        select
          count(distinct d.id)::int as "documentCount",
          count(distinct src.id)::int as "sourceCount",
          count(distinct l.municipality)::int as "municipalityCount"
        from documents d
        join sources src on src.id = d.source_id
        join locations l on l.id = d.location_id
        where d.status = 'active'
          and l.province = $1
          and coalesce(date(d.published_at), date(d.created_at)) >= current_date - ($4::int - 1)
          and (
            $2::text is null
            or d.title ilike ('%' || $2 || '%')
            or d.content_text ilike ('%' || $2 || '%')
            or ($3::text is not null and (d.title ilike ('%' || $3 || '%') or d.content_text ilike ('%' || $3 || '%')))
          )
      `,
      [province, normalizedLeader, normalizedOffice, days]
    ),
  ]);

  return {
    province,
    leaderName: normalizedLeader,
    office: normalizedOffice,
    summary: summaryResult.rows[0] ?? {
      documentCount: 0,
      sourceCount: 0,
      municipalityCount: 0,
    },
    documents: documentResult.rows.map(
      (row): LeadershipEvidenceDocumentRow => ({
        documentId: row.documentId,
        title: row.title,
        url: row.url,
        sourceName: row.sourceName,
        sourceType: row.sourceType,
        municipality: row.municipality,
        publishedAt: row.publishedAt,
        mentionCount: row.mentionCount,
        excerpt: row.excerpt,
      })
    ),
    caveats: [
      "Leadership evidence highlights only show governed documents that explicitly mention the selected leader or office.",
      "This layer is thinner than province sentiment because named-leader mentions are still less common than issue mentions.",
    ],
    trace: {
      table: "documents,sources,sentiment_mentions",
      query: `province=${province};leader=${normalizedLeader ?? "all"};office=${normalizedOffice ?? "all"};days=${days}`,
    },
  };
}
