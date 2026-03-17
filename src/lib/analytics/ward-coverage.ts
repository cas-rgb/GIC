import { query } from "@/lib/db";
import { WardCoverageResponse } from "@/lib/analytics/types";

interface WardRow {
  ward: string;
  documentCount: number;
  pressureCaseCount: number;
  sentimentMentionCount: number;
}

interface CommunityRow {
  community: string;
  documentCount: number;
  avgUrgency: string | number | null;
  dominantIssue: string | null;
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "string" ? Number(value) : value;
}

export async function getWardCoverage(
  province: string,
  municipality: string
): Promise<WardCoverageResponse> {
  const [result, communityResult] = await Promise.all([
    query<WardRow>(
      `
      with base_wards as (
        select distinct l.ward
        from locations l
        where l.province = $1
          and l.municipality = $2
          and l.ward is not null
          and btrim(l.ward) <> ''
      ),
      document_counts as (
        select
          l.ward,
          count(distinct coalesce(d.id, s.document_id))::int as document_count
        from signals s
        join locations l on l.id = s.location_id
        left join documents d
          on d.id = s.document_id
         and d.status = 'active'
        where l.province = $1
          and l.municipality = $2
          and l.ward is not null
          and btrim(l.ward) <> ''
        group by l.ward
      ),
      pressure_counts as (
        select
          l.ward,
          count(*)::int as pressure_case_count
        from service_incidents si
        join locations l on l.id = si.location_id
        where l.province = $1
          and l.municipality = $2
          and l.ward is not null
          and btrim(l.ward) <> ''
        group by l.ward
      ),
      sentiment_counts as (
        select
          l.ward,
          count(*)::int as sentiment_mention_count
        from sentiment_mentions sm
        join locations l on l.id = sm.location_id
        where l.province = $1
          and l.municipality = $2
          and l.ward is not null
          and btrim(l.ward) <> ''
        group by l.ward
      )
      select
        bw.ward,
        coalesce(dc.document_count, 0)::int as "documentCount",
        coalesce(pc.pressure_case_count, 0)::int as "pressureCaseCount",
        coalesce(sc.sentiment_mention_count, 0)::int as "sentimentMentionCount"
      from base_wards bw
      left join document_counts dc on dc.ward = bw.ward
      left join pressure_counts pc on pc.ward = bw.ward
      left join sentiment_counts sc on sc.ward = bw.ward
      order by ("documentCount" + "pressureCaseCount" + "sentimentMentionCount") desc, bw.ward asc
    `,
      [province, municipality]
    ),
    query<CommunityRow>(
      `
        with legacy_docs as (
          select
            nullif(btrim(split_part(d.title, '|', 2)), '') as community,
            nullif(btrim(split_part(d.title, '|', 1)), '') as issue,
            substring(d.content_text from 'Urgency: ([0-9]+)')::numeric as urgency
          from documents d
          join signals s on s.document_id = d.id
          join locations l on l.id = s.location_id
          where d.parser_version = 'legacy-community-signals-v1'
            and d.status = 'active'
            and l.province = $1
            and l.municipality = $2
        ),
        issue_ranked as (
          select
            community,
            issue,
            count(*)::int as row_count,
            row_number() over (partition by community order by count(*) desc, issue asc) as issue_rank
          from legacy_docs
          where community is not null
          group by community, issue
        )
        select
          ld.community as community,
          count(*)::int as "documentCount",
          round(avg(ld.urgency)::numeric, 1) as "avgUrgency",
          max(ir.issue) filter (where ir.issue_rank = 1) as "dominantIssue"
        from legacy_docs ld
        left join issue_ranked ir on ir.community = ld.community
        where ld.community is not null
        group by ld.community
        order by "documentCount" desc, "avgUrgency" desc nulls last, ld.community asc
        limit 8
      `,
      [province, municipality]
    ),
  ]);

  const summary = result.rows.reduce(
    (acc, row) => {
      acc.wardCount += 1;
      acc.documentCount += row.documentCount;
      acc.pressureCaseCount += row.pressureCaseCount;
      acc.sentimentMentionCount += row.sentimentMentionCount;
      return acc;
    },
    {
      wardCount: 0,
      documentCount: 0,
      pressureCaseCount: 0,
      sentimentMentionCount: 0,
    }
  );
  const communityRows = communityResult.rows.map((row) => ({
    community: row.community,
    documentCount: row.documentCount,
    avgUrgency: toNumber(row.avgUrgency),
    dominantIssue: row.dominantIssue,
  }));
  const registryWardCount = result.rows.length;
  const evidenceBackedWardCount = result.rows.filter(
    (row) =>
      row.documentCount > 0 ||
      row.pressureCaseCount > 0 ||
      row.sentimentMentionCount > 0
  ).length;
  const wardReadinessLabel =
    evidenceBackedWardCount >= 5
      ? "Operational"
      : evidenceBackedWardCount > 0
        ? "Partial"
        : registryWardCount > 0
          ? "Registry Only"
        : communityRows.length > 0
          ? "Community-led"
          : "Sparse";

  return {
    province,
    municipality,
    summary: {
      ...summary,
      registryWardCount,
      evidenceBackedWardCount,
      wardReadyCommunityCount: communityRows.length,
      wardReadinessLabel,
    },
    rows: result.rows,
    communityRows,
    caveats:
      registryWardCount === 0
        ? [
            communityRows.length > 0
              ? "Formal ward mapping is still sparse here, so the local view falls back to ward-ready community evidence imported from legacy Firebase signals."
              : "No governed ward-level rows are currently mapped for this municipality, so the ward view remains a coverage shell rather than a decision surface.",
          ]
        : evidenceBackedWardCount === 0
          ? [
              `The governed location registry lists ${registryWardCount} wards for this municipality, but current issue and evidence metrics are not yet ward-resolved here.`,
            ]
          : evidenceBackedWardCount < registryWardCount
            ? [
                `The governed location registry lists ${registryWardCount} wards for this municipality, but only ${evidenceBackedWardCount} currently carry ward-resolved evidence.`,
              ]
            : [],
    trace: {
      table: "locations,signals,documents,service_incidents,sentiment_mentions",
      query: `province=${province};municipality=${municipality}`,
    },
  };
}
