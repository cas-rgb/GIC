import {
  MunicipalityComparisonResponse,
  MunicipalityComparisonRow,
} from "@/lib/analytics/types";
import { getMunicipalityDirectory } from "@/lib/analytics/municipality-directory";
import { getMunicipalitySummary } from "@/lib/analytics/municipality-summary";

export async function getMunicipalityComparison(
  province: string,
  days = 30
): Promise<MunicipalityComparisonResponse> {
  const directory = await getMunicipalityDirectory(province);

  const rows = await Promise.all(
    directory.rows.map(async (entry): Promise<MunicipalityComparisonRow> => {
      const summary = await getMunicipalitySummary(province, entry.municipality, days);

      return {
        municipality: entry.municipality,
        pressureScore: summary.summary.pressureScore,
        escalationScore: summary.summary.escalationScore,
        sentimentScore: summary.summary.sentimentScore,
        evidenceConfidenceScore: summary.summary.evidenceConfidenceScore,
        officialEvidenceShare: summary.summary.officialEvidenceShare,
        topPressureDomain: summary.summary.topPressureDomain,
        topComplaintTopic: summary.summary.topComplaintTopic,
      };
    })
  );

  return {
    province,
    days,
    rows: rows.sort((left, right) => right.pressureScore - left.pressureScore),
    trace: {
      tables: [
        "fact_service_pressure_daily",
        "fact_sentiment_daily",
        "documents",
      ],
      query: `province=${province};days=${days}`,
    },
  };
}
