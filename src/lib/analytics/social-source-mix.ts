import { query } from "@/lib/db";
import { SocialSourceMixResponse } from "@/lib/analytics/types";

interface SocialSourceMixSqlRow {
  sourceType: string;
  documentCount: number;
  mentionCount: number;
}

export async function getSocialSourceMix(
  province: string | null,
  days = 30
): Promise<SocialSourceMixResponse> {
  const params = [province, days];

  const result = await query<SocialSourceMixSqlRow>(
    `
      select
        src.source_type as "sourceType",
        count(distinct d.id)::int as "documentCount",
        count(cvm.id)::int as "mentionCount"
      from citizen_voice_mentions cvm
      join documents d on d.id = cvm.document_id
      join sources src on src.id = d.source_id
      where ($1::text is null or cvm.province = $1)
        and coalesce(date(d.published_at), date(d.created_at)) >= current_date - ($2::int - 1)
      group by src.source_type
      order by count(cvm.id) desc, src.source_type asc
    `,
    params
  );

  const totalMentions = Math.max(
    result.rows.reduce((sum, row) => sum + row.mentionCount, 0),
    1
  );

  return {
    province,
    days,
    rows: result.rows.map((row) => ({
      sourceType: row.sourceType,
      documentCount: row.documentCount,
      mentionCount: row.mentionCount,
      share: Number(((row.mentionCount / totalMentions) * 100).toFixed(1)),
    })),
    trace: {
      table: "citizen_voice_mentions,documents,sources",
      query: `province=${province ?? "all"};days=${days}`,
    },
  };
}
