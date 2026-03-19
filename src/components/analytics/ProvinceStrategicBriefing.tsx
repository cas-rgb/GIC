"use client";
import { useEffect, useState } from "react";
import { ProvinceSummaryResponse } from "@/lib/analytics/types";
interface ProvinceStrategicBriefingProps {
  province: string;
  days: number;
  summaryData: ProvinceSummaryResponse;
  trendDirection: string;
}
export default function ProvinceStrategicBriefing({
  province,
  days,
  summaryData,
  trendDirection,
}: ProvinceStrategicBriefingProps) {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function loadBriefing() {
      setIsLoading(true);
      try {
        const contextString = JSON.stringify({
          pressureCaseCount: summaryData.summary.pressureCaseCount,
          topPressureDomain: summaryData.summary.topPressureDomain,
          escalationScore: summaryData.summary.escalationScore,
          officialEvidenceShare: summaryData.summary.officialEvidenceShare,
          highestExposureMunicipality:
            summaryData.summary.highestExposureMunicipality,
          trendDirection,
        });
        const result = { success: true, text: "Strategic overview unavailable" };
        if (result.success && result.text) {
          setBriefing(result.text);
        } else {
          setBriefing("AI Strategic Briefing is currently unavailable.");
        }
      } catch (error) {
        console.error("Failed to load briefing:", error);
        setBriefing("AI Strategic Briefing is currently unavailable.");
      } finally {
        setIsLoading(false);
      }
    }
    void loadBriefing();
  }, [province, days, summaryData, trendDirection]);
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 mb-6">
        {" "}
        <div className="h-4 bg-slate-200 w-full"></div>{" "}
        <div className="h-4 bg-slate-200 w-5/6"></div>{" "}
        <div className="h-4 bg-slate-200 w-4/6"></div>{" "}
      </div>
    );
  }
  return (
    <p className="text-lg text-slate-600 leading-relaxed font-light mb-6">
      {" "}
      {briefing}{" "}
    </p>
  );
}
