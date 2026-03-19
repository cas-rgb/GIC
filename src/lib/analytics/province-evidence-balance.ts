import { query } from "@/lib/db";
import {
  EvidenceBalanceRow,
  ProvinceEvidenceBalanceResponse,
} from "@/lib/analytics/types";

interface EvidenceBalanceSqlRow {
  evidenceClass: string;
  sourceCount: number;
  documentCount: number;
  avgReliabilityScore: string | number;
}

function toNumber(value: string | number): number {
  return typeof value === "string" ? Number(value) : value;
}

function classifySourceType(sourceType: string): string {
  if (
    ["gov", "official_gov", "treasury", "utility", "stats"].includes(sourceType)
  ) {
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

export async function getProvinceEvidenceBalance(
  province: string,
  days = 30,
): Promise<ProvinceEvidenceBalanceResponse> {
  const result = await query<EvidenceBalanceSqlRow>(
    `
      select
        source_type as "evidenceClass",
        sum(source_count)::int as "sourceCount",
        sum(document_count)::int as "documentCount",
        round(avg(avg_reliability_score)::numeric, 3) as "avgReliabilityScore"
      from fact_source_reliability_daily
      where province = $1
        and day >= current_date - ($2::int - 1)
      group by source_type
      order by sum(document_count) desc, source_type asc
    `,
    [province, days],
  );

  const totalDocuments = result.rows.reduce(
    (sum, row) => sum + row.documentCount,
    0,
  );

  const grouped = new Map<
    string,
    {
      evidenceClass: string;
      sourceCount: number;
      documentCount: number;
      reliabilityTotal: number;
      rows: number;
    }
  >();

  for (const row of result.rows) {
    const evidenceClass = classifySourceType(row.evidenceClass);
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
              0,
            ) / totalDocuments
          ).toFixed(3),
        )
      : 0;

  return {
    province,
    days,
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
    caveats: rows.some((row) => row.evidenceClass === "Social")
      ? []
      : [
          "Social evidence is not yet present in the governed province fact mix for this province and window.",
        ],
    trace: {
      table: "fact_source_reliability_daily",
      query: `province=${province};days=${days}`,
    },
  };
}
