"use client";

import { ShieldCheck } from "lucide-react";

interface ExportToPDFFooterProps {
  confidenceRating?: string;
}

export default function ExportToPDFFooter({
  confidenceRating = "PARTIAL",
}: ExportToPDFFooterProps) {
  const today = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="hidden print:block fixed bottom-0 left-0 right-0 p-8 w-full bg-white z-[9999]">
      <div className="grid grid-cols-2 gap-8 border-t border-slate-900 pt-6">
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Autonomous Data Lineage
          </h4>
          <div className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
            Governed Reporting Protocol: Next-Gen Civic Intelligence
            <br />
            Generated: {today}
          </div>
        </div>
        <div className="text-right">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Institutional Verification
          </h4>
          <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed flex items-center justify-end gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Confidence Rating: {confidenceRating}
          </p>
        </div>
      </div>
      <div className="text-center text-slate-300 font-black uppercase tracking-[0.4em] text-[8px] mt-6">
        GIC Community Insights • Government Insight Engine • Johannesburg, South Africa
      </div>
    </div>
  );
}
