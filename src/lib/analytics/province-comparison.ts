import { ProvinceComparisonResponse, ProvinceComparisonRow } from "@/lib/analytics/types";
import { getProvinceSentiment } from "@/lib/analytics/province-sentiment";
import { getProvinceSummary } from "@/lib/analytics/province-summary";
import { getSourceHealthSummary } from "@/lib/source-registry/health-queries";

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

export async function getProvinceComparison(
  days = 30
): Promise<ProvinceComparisonResponse> {
  const rows = await Promise.all(
    PROVINCES.map(async (province): Promise<ProvinceComparisonRow> => {
      const [summary, sentiment, health] = await Promise.all([
        getProvinceSummary(province, days),
        getProvinceSentiment(province, days),
        getSourceHealthSummary(province),
      ]);

      return {
        province,
        pressureScore: summary.summary.pressureScore,
        escalationScore: summary.summary.escalationScore,
        sentimentScore: sentiment.summary.currentSentimentScore,
        evidenceConfidenceScore: summary.summary.evidenceConfidenceScore,
        officialEvidenceShare: summary.summary.officialEvidenceShare,
        topPressureDomain: summary.summary.topPressureDomain,
        highestExposureMunicipality: summary.summary.highestExposureMunicipality,
        healthyConnectorCount: health.totals.healthyCount,
        staleConnectorCount: health.totals.staleCount,
        failingConnectorCount: health.totals.failingCount,
      };
    })
  );

  return {
    days,
    rows: rows.sort((left, right) => right.pressureScore - left.pressureScore),
    trace: {
      tables: [
        "fact_service_pressure_daily",
        "fact_source_reliability_daily",
        "fact_sentiment_daily",
        "sources",
      ],
      query: `days=${days}`,
    },
  };
}
