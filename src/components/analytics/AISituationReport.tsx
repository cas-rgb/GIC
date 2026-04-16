import { Activity, ShieldCheck, Map as MapIcon } from "lucide-react";
import ExportToPDFFooter from "../ui/ExportToPDFFooter";
import ProvinceExecutiveBriefing from "./ProvinceExecutiveBriefing";
import PoliticalPRDeskHeader from "./PoliticalPRDeskHeader";

interface AISituationReportProps {
  province?: string;
  days: number;
  initialData?: any;
}

export default function AISituationReport({
  province,
  days,
  initialData
}: AISituationReportProps) {
  const areaLabel = province || "Gauteng";
  const briefingData = initialData;

  return (
    <div className="space-y-6 mt-8">
      {/* 1. AGGRESSIVE INTELLIGENCE: BLINDSPOTS & ALIGNMENTS */}
      <div>
        <ProvinceExecutiveBriefing province={areaLabel} data={briefingData} />
      </div>

      {/* 2. REAL-TIME EXECUTIVES AT RISK & FLASHPOINTS */}
      <div className="mt-8">
        <PoliticalPRDeskHeader province={areaLabel} data={briefingData} />
      </div>

      <ExportToPDFFooter confidenceRating="VERIFIED" />
    </div>
  );
}
