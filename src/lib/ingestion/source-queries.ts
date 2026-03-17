import { query } from "@/lib/db";
import { IngestionSourceConfig } from "@/lib/ingestion/types";

interface SourceRow {
  id: string;
  source_type:
    | "news"
    | "gov"
    | "internal"
    | "social"
    | "ngo"
    | "treasury"
    | "utility"
    | "stats"
    | "research"
    | "watchdog";
  base_url: string | null;
  active: boolean;
}

export async function getActiveRssIngestionSources(): Promise<
  IngestionSourceConfig[]
> {
  const result = await query<SourceRow>(`
    select
      id,
      source_type,
      base_url,
      active
    from sources
    where active = true
      and base_url is not null
      and source_type = 'news'
    order by id asc
  `);

  return result.rows.map((row) => ({
    sourceId: row.id,
    sourceType: row.source_type,
    baseUrl: row.base_url ?? undefined,
    active: row.active,
  }));
}
