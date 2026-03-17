import { query } from "@/lib/db";
import {
  EvidenceBalanceRow,
  MunicipalityEvidenceBalanceResponse,
} from "@/lib/analytics/types";

interface SourceMixRow {
  sourceType: string;
  sourceCount: number;
  documentCount: number;
  avgReliabilityScore: string | number;
}

function classifySourceType(sourceType: string): string {
  if (["gov", "official_gov", "treasury", "utility", "stats"].includes(sourceType)) {
    return "Official";
  }

  if (["ngo", "research", "watchdog"].includes(sourceType)) {
    return "Civic and Research";
  }

  if (sourceType === "social") {
    return "Social";
  }

  return "Media";
}

function toNumber(value: string | number): number {
  return typeof value === "string" ? Number(value) : value;
}

export async function getMunicipalityEvidenceBalance(
  province: string,
  municipality: string,
  days = 30
): Promise<MunicipalityEvidenceBalanceResponse> {
  const result = await query<SourceMixRow>(
    `
      select
        src.source_type as "sourceType",
        count(distinct src.id)::int as "sourceCount",
        count(distinct d.id)::int as "documentCount",
        round(avg(src.reliability_score)::numeric, 3) as "avgReliabilityScore"
      from documents d
      join sources src on src.id = d.source_id
      join locations l on l.id = d.location_id
      where d.status = 'active'
        and l.province = $1
        and l.municipality = $2
        and coalesce(date(d.published_at), date(d.created_at)) >= current_date - ($3::int - 1)
      group by src.source_type
      order by count(distinct d.id) desc, src.source_type asc
    `,
    [province, municipality, days]
  );

  const totalDocuments = result.rows.reduce((sum, row) => sum + row.documentCount, 0);
  const grouped = new Map<
    string,
    { evidenceClass: string; sourceCount: number; documentCount: number; reliabilityTotal: number; rows: number }
  >();

  for (const row of result.rows) {
    const evidenceClass = classifySourceType(row.sourceType);
    const current = grouped.get(evidenceClass) ?? {
      evidenceClass,
      sourceCount: 0,
      documentCount: 0,
      reliabilityTotal: 0,
      rows: 0,
    };

    current.sourceCount += row.sourceCount;
    current.documentCount += row.documentCount;
    current.reliabilityTotal += toNumber(row.avgReliabilityScore);
    current.rows += 1;
    grouped.set(evidenceClass, current);
  }

  const rows: EvidenceBalanceRow[] = Array.from(grouped.values())
    .map((row) => ({
      evidenceClass: row.evidenceClass,
      sourceCount: row.sourceCount,
      documentCount: row.documentCount,
      avgReliabilityScore:
        row.rows > 0 ? Number((row.reliabilityTotal / row.rows).toFixed(3)) : 0,
      documentShare:
        totalDocuments > 0
          ? Number(((row.documentCount / totalDocuments) * 100).toFixed(1))
          : 0,
    }))
    .sort((left, right) => right.documentCount - left.documentCount);

  const officialRow = rows.find((row) => row.evidenceClass === "Official");
  const narrativeDocumentCount = rows
    .filter((row) => row.evidenceClass !== "Official")
    .reduce((sum, row) => sum + row.documentCount, 0);
  const weightedConfidence =
    totalDocuments > 0
      ? Number(
          (
            rows.reduce(
              (sum, row) => sum + row.avgReliabilityScore * row.documentCount,
              0
            ) / totalDocuments
          ).toFixed(3)
        )
      : 0;

  return {
    province,
    municipality,
    summary: {
      officialDocumentShare: officialRow?.documentShare ?? 0,
      narrativeDocumentShare:
        totalDocuments > 0
          ? Number(((narrativeDocumentCount / totalDocuments) * 100).toFixed(1))
          : 0,
      weightedConfidence,
      dominantEvidenceClass: rows[0]?.evidenceClass ?? null,
    },
    rows,
    caveats:
      totalDocuments === 0
        ? ["No municipality-level evidence rows are currently mapped for this municipality."]
        : [],
    trace: {
      table: "documents,sources,locations",
      query: `province=${province};municipality=${municipality};days=${days}`,
    },
  };
}
