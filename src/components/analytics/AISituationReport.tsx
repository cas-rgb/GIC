"use client";
import { useEffect, useState } from "react";
import { Activity, ShieldCheck, Map as MapIcon } from "lucide-react";
import ExportToPDFFooter from "../ui/ExportToPDFFooter";
import ProvinceExecutiveBriefing from "./ProvinceExecutiveBriefing";
import PoliticalPRDeskHeader from "./PoliticalPRDeskHeader";

interface AISituationReportProps {
  province?: string;
  days: number;
}

export default function AISituationReport({
  province,
  days,
}: AISituationReportProps) {
  const areaLabel = province || "Gauteng";
  const [isMounted, setIsMounted] = useState(false);

  // SSR Hydration Shield
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="p-12 text-slate-400 font-black animate-pulse uppercase tracking-[0.2em] text-center border border-slate-200 bg-slate-50 mt-8">
        Aligning Geopolitical Node...
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {/* 1. AGGRESSIVE INTELLIGENCE: BLINDSPOTS & ALIGNMENTS */}
      <div>
        <ProvinceExecutiveBriefing province={areaLabel} />
      </div>

      {/* 2. REAL-TIME EXECUTIVES AT RISK & FLASHPOINTS */}
      <div className="mt-8">
        <PoliticalPRDeskHeader province={areaLabel} />
      </div>

      <ExportToPDFFooter confidenceRating="VERIFIED" />
    </div>
  );
}
