import { query } from "@/lib/db";
import { MunicipalityDirectoryResponse } from "@/lib/analytics/types";

interface MunicipalityRow {
  municipality: string;
  pressureDocumentCount: number;
  sentimentMentionCount: number;
}

export async function getMunicipalityDirectory(
  province: string
): Promise<MunicipalityDirectoryResponse> {
  const result = await query<MunicipalityRow>(
    `
      with registry_locations as (
        select distinct municipality
        from locations
        where province = $1
          and municipality is not null
          and btrim(municipality) <> ''
      ),
      registry_sources as (
        select distinct municipality
        from source_registry
        where province = $1
          and municipality is not null
          and btrim(municipality) <> ''
          and active = true
      ),
      with pressure as (
        select
          municipality,
          sum(source_document_count)::int as pressure_document_count
        from fact_service_pressure_daily
        where province = $1
          and municipality is not null
          and municipality <> 'Province Wide'
        group by municipality
      ),
      sentiment as (
        select
          municipality,
          sum(mention_count)::int as sentiment_mention_count
        from fact_sentiment_daily
        where province = $1
          and municipality is not null
          and municipality <> 'Province Wide'
        group by municipality
      ),
      base as (
        select municipality from pressure
        union
        select municipality from sentiment
        union
        select municipality from registry_locations
        union
        select municipality from registry_sources
      ),
      combined as (
        select
          base.municipality as municipality,
          coalesce(pressure.pressure_document_count, 0)::int as "pressureDocumentCount",
          coalesce(sentiment.sentiment_mention_count, 0)::int as "sentimentMentionCount"
        from base
        left join pressure
          on pressure.municipality = base.municipality
        left join sentiment
          on sentiment.municipality = base.municipality
      )
      select *
      from combined
      order by ("pressureDocumentCount" + "sentimentMentionCount") desc, municipality asc
    `,
    [province]
  );

  return {
    province,
    rows: result.rows,
    trace: {
      table: "fact_service_pressure_daily,fact_sentiment_daily,locations,source_registry",
      query: `province=${province}`,
    },
  };
}
