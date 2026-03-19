import { WaterReliabilityResponse } from "@/lib/analytics/types";
import { query } from "@/lib/db";

interface WaterReliabilityRow {
  date: string;
  waterReliabilityScore: string | number;
  officialDocumentCount: number;
  officialSignalCount: number;
  officialIncidentCount: number;
  avgSourceReliability: string | number;
}

function toNumber(value: string | number): number {
  return typeof value === "string" ? Number(value) : value;
}

export async function getWaterReliability(
  province: string,
  days = 30,
): Promise<WaterReliabilityResponse> {
  const result = await query<WaterReliabilityRow>(
    `
      select
        day::text as date,
        water_reliability_score as "waterReliabilityScore",
        official_document_count as "officialDocumentCount",
        official_signal_count as "officialSignalCount",
        official_incident_count as "officialIncidentCount",
        avg_source_reliability as "avgSourceReliability"
      from fact_water_reliability_daily
      where province = $1
        and day >= current_date - ($2::int - 1)
      order by day asc
    `,
    [province, days],
  );

  const series = result.rows.map((row) => ({
    date: row.date,
    waterReliabilityScore: toNumber(row.waterReliabilityScore),
    officialDocumentCount: row.officialDocumentCount,
    officialSignalCount: row.officialSignalCount,
    officialIncidentCount: row.officialIncidentCount,
    avgSourceReliability: toNumber(row.avgSourceReliability),
  }));

  const latest = series[series.length - 1] ?? null;

  return {
    province,
    days,
    summary: {
      waterReliabilityScore: latest?.waterReliabilityScore ?? 0,
      officialDocumentCount: latest?.officialDocumentCount ?? 0,
      officialSignalCount: latest?.officialSignalCount ?? 0,
      officialIncidentCount: latest?.officialIncidentCount ?? 0,
      avgSourceReliability: latest?.avgSourceReliability ?? 0,
      latestDay: latest?.date ?? null,
    },
    series,
    caveats: [
      "Water reliability is currently derived from official DWS and other official water-related documents, signals, and incidents only.",
      "This layer is designed to reduce narrative bias in water-related provincial interpretation, not to replace full utility telemetry.",
    ],
    trace: {
      table: "fact_water_reliability_daily",
      query: `province=${province};days=${days}`,
    },
  };
}
