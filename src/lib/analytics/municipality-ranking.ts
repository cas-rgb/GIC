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
): Promise<MunicipalityRankingResponse> {
  const [result, aiResult] = await Promise.all([
    query<MunicipalityRankingSqlRow>(
    `
      with ranked as (
        select
          l.municipality as municipality,
          count(*)::int as "pressureCaseCount",
          count(*) filter (where si.severity = 'High')::int as "highSeverityCount",
          count(*) filter (where si.protest_indicator = true)::int as "protestCount",
          count(*) filter (where si.response_indicator = true)::int as "responseCount",
          mode() within group (order by si.service_domain) as "dominantServiceDomain",
          round((
            count(*) * 1.0 +
            count(*) filter (where si.severity = 'High') * 1.5 +
            count(*) filter (where si.protest_indicator = true) * 1.2 -
            count(*) filter (where si.response_indicator = true) * 0.5
          )::numeric, 2) as "riskScore",
          round(avg(si.classification_confidence)::numeric, 3) as "confidence"
        from service_incidents si
        join signals s on s.id = si.signal_id
        left join locations l on l.id = coalesce(si.location_id, s.location_id)
        where ($1::text = 'All Provinces' or l.province = $1)
          and si.citizen_pressure_indicator = true
          and si.failure_indicator = true
          and l.municipality is not null
        group by l.municipality
      )
      select *
      from ranked
      order by "riskScore" desc, "pressureCaseCount" desc
      limit 10
    `,
    [province],
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
      order by created_at desc
    `,
    [province]
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
