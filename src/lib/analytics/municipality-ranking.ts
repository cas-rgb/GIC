import { query } from "@/lib/db";
import { MunicipalityRankingResponse, AINarrativeSynthesisRow } from "@/lib/analytics/types";

interface MunicipalityRankingSqlRow {
  municipality: string;
  pressureCaseCount: number;
  highSeverityCount: number;
  protestCount: number;
  responseCount: number;
  dominantServiceDomain: string | null;
  riskScore: string | number;
  confidence: string | number;
}

export async function getMunicipalityRanking(
  province: string,
  days: number = 365,
  serviceDomain: string = "all"
): Promise<MunicipalityRankingResponse> {
  const params: any[] = [province, days];
  if (serviceDomain !== "all") params.push(serviceDomain);

  const filterClause = serviceDomain !== "all" ? `and si.service_domain = $3` : "";

  const [result, aiResult] = await Promise.all([
    query<MunicipalityRankingSqlRow>(
    `
      with ranked as (
        select
          l.municipality as municipality,
          count(si.id)::int as "pressureCaseCount",
          count(si.id) filter (where si.severity = 'High')::int as "highSeverityCount",
          count(si.id) filter (where si.protest_indicator = true)::int as "protestCount",
          count(si.id) filter (where si.response_indicator = true)::int as "responseCount",
          mode() within group (order by si.service_domain) as "dominantServiceDomain",
          round((
            count(si.id) * 1.0 +
            count(si.id) filter (where si.severity = 'High') * 1.5 +
            count(si.id) filter (where si.protest_indicator = true) * 1.2
          )::numeric, 2) as "riskScore",
          round(avg(si.classification_confidence)::numeric, 3) as "confidence"
        from locations l
        left join service_incidents si on (
          l.id = coalesce(si.location_id, (select location_id from signals where id = si.signal_id))
          and si.opened_at >= (now() - interval '1 day' * $2)
          ${filterClause}
        )
        where ($1::text = 'All Provinces' or l.province = $1)
          and l.municipality is not null
        group by l.municipality
      )
      select *
      from ranked
      order by "pressureCaseCount" desc, municipality asc
    `,
    params,
  ),
  query<AINarrativeSynthesisRow & { municipality: string }>(
    `
      select 
        municipality as "municipality",
        who_involved as "whoInvolved",
        what_happened as "whatHappened",
        why_it_happened as "whyItHappened",
        how_resolved_or_current as "howResolvedOrCurrent",
        when_timeline as "whenTimeline",
        source_evidence as "sourceEvidence"
      from ai_narrative_synthesis
      where lens = 'municipality' and ($1::text = 'All Provinces' or $1::text is null or province = $1)
        and created_at >= (now() - interval '1 day' * $2)
      order by created_at desc
    `,
    [province, days]
  )
  ]);

  const aiSynthesisByMuni = new Map<string, AINarrativeSynthesisRow[]>();
  for (const row of aiResult.rows) {
    const current = aiSynthesisByMuni.get(row.municipality) ?? [];
    current.push(row);
    aiSynthesisByMuni.set(row.municipality, current);
  }

  return {
    province,
    rows: result.rows.map((row) => ({
      ...row,
      riskScore:
        typeof row.riskScore === "string"
          ? Number(row.riskScore)
          : row.riskScore,
      confidence:
        typeof row.confidence === "string"
          ? Number(row.confidence)
          : row.confidence,
      aiSynthesis: aiSynthesisByMuni.get(row.municipality) ?? [],
    })),
    trace: {
      table: "service_incidents",
      query: `province=${province};top=10`,
    },
  };
}
