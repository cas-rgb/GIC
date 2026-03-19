"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Map as MapIcon, Download } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import AISituationReport from "@/components/analytics/AISituationReport";
import ProvinceMap from "@/components/analytics/ProvinceMap";
import DeepDiveDrawer from "@/components/ui/DeepDiveDrawer";
import { ProvinceRecommendationsResponse } from "@/lib/recommendations/types";
export default function SituationReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const province = searchParams.get("province") || "Gauteng";
  const days = searchParams.get("days") ? Number(searchParams.get("days")) : 30;
  
  // Drawer logic kept for compatibility, though map clicks now route away
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  function handleMunicipalitySelect(municipalityId: string) {
    router.push(`/executive/municipalities?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(municipalityId)}&days=${days}`);
  }
  function downloadFile(
    content: string,
    filename: string,
    contentType: string,
  ) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  async function exportRecommendations(format: "csv" | "json") {
    const response = await fetch(
      `/api/intelligence/province-recommendations?province=${encodeURIComponent(province)}&days=${days}`,
      { cache: "no-store" },
    );
    if (!response.ok) return;
    const payload = (await response.json()) as ProvinceRecommendationsResponse;
    const baseName = `${province.toLowerCase().replace(/\s+/g, "-")}-situation-report`;
    if (format === "json") {
      downloadFile(
        JSON.stringify(payload, null, 2),
        `${baseName}.json`,
        "application/json;charset=utf-8",
      );
      return;
    }
    const header = [
      "title",
      "issue",
      "urgency",
      "impact_tier",
      "recommended_action",
    ];
    const lines = payload.recommendations.map((r) =>
      [r.title, r.issue, r.urgency, r.impactTier, r.recommendedAction]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );
    downloadFile(
      [header.join(","), ...lines].join("\n"),
      `${baseName}.csv`,
      "text/csv;charset=utf-8",
    );
  }
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="p-12 text-slate-400 font-black animate-pulse uppercase tracking-[0.2em]">
        Acquiring Province Demographics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="State of the Province"
        subtitle={`What ${province} is experiencing overall across critical infrastructure sectors.`}
        headerImage="/projects/MAJWEMASWEU-X5-1039-1024x683.webp"
      />{" "}
      <div className="space-y-8 mt-6">
        {" "}
        <AISituationReport province={province} days={days} />{" "}
        <section className="bg-white shadow-xl overflow-hidden border border-slate-200">
          {" "}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            {" "}
            <div>
              {" "}
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                {" "}
                <MapIcon className="w-5 h-5 text-blue-600" /> Regional Pressure
                Map{" "}
              </h3>{" "}
            </div>{" "}
          </div>{" "}
          <div className="h-[450px] w-full bg-slate-50 relative">
            {" "}
            <ProvinceMap
              province={province}
              days={days}
              onMunicipalitySelect={handleMunicipalitySelect}
            />{" "}
          </div>{" "}
        </section>{" "}
      </div>{" "}
      <DeepDiveDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedMunicipality || "Municipality View"}
        subtitle={`Lens 2: Deep dive into current conditions across ${selectedMunicipality}`}
      >
        {" "}
        {selectedMunicipality && (
          <div className="space-y-8">
            {" "}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {" "}
              <div className="flex flex-col gap-2 p-6 bg-white border-l-4 border-amber-600 shadow-sm">
                {" "}
                <div className="flex items-center justify-between text-amber-600">
                  {" "}
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    Identity
                  </p>{" "}
                  <span className="material-symbols-outlined text-lg">
                    home_work
                  </span>{" "}
                </div>{" "}
                <p className="text-slate-900 text-xl font-black">
                  Urban Residential
                </p>{" "}
                <p className="text-slate-500 text-xs">
                  Middle-income housing and mixed retail.
                </p>{" "}
              </div>{" "}
              <div className="flex flex-col gap-2 p-6 bg-white border-l-4 border-purple-600 shadow-sm">
                {" "}
                <div className="flex items-center justify-between text-purple-600">
                  {" "}
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    Politics
                  </p>{" "}
                  <span className="material-symbols-outlined text-lg">
                    how_to_vote
                  </span>{" "}
                </div>{" "}
                <p className="text-slate-900 text-xl font-black">
                  Coalition Zone
                </p>{" "}
                <p className="text-slate-500 text-xs">
                  High contestation between top parties.
                </p>{" "}
              </div>{" "}
              <div className="flex flex-col gap-2 p-6 bg-white border-l-4 border-blue-600 shadow-sm">
                {" "}
                <div className="flex items-center justify-between text-blue-600">
                  {" "}
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    History
                  </p>{" "}
                  <span className="material-symbols-outlined text-lg">
                    history_edu
                  </span>{" "}
                </div>{" "}
                <p className="text-slate-900 text-xl font-black">
                  Historical Hub
                </p>{" "}
                <p className="text-slate-500 text-xs">
                  Significant civic heritage.
                </p>{" "}
              </div>{" "}
              <div className="flex flex-col gap-2 p-6 bg-white border-l-4 border-red-600 shadow-sm">
                {" "}
                <div className="flex items-center justify-between text-red-600">
                  {" "}
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    Pressure
                  </p>{" "}
                  <span className="material-symbols-outlined text-lg">
                    speed
                  </span>{" "}
                </div>{" "}
                <p className="text-slate-900 text-xl font-black">
                  High Tension
                </p>{" "}
                <p className="text-slate-500 text-xs">
                  Frequent service delivery protests.
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="h-[60vh] bg-slate-50 border border-slate-200 overflow-hidden relative flex flex-col items-center justify-center p-8 text-center">
              {" "}
              <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                {" "}
                <MapIcon className="w-8 h-8" />{" "}
              </div>{" "}
              <h3 className="text-xl font-black text-slate-800 mb-2">
                Ward-Level Topology Rendering
              </h3>{" "}
              <p className="text-slate-500 max-w-md">
                {" "}
                Loading high-resolution geospatial vector tiles for{" "}
                {selectedMunicipality}...{" "}
              </p>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </DeepDiveDrawer>{" "}
    </div>
  );
}
