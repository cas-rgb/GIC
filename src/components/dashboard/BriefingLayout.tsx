"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Flag, ShieldAlert, TrendingUp, Info } from "lucide-react";

interface BriefingLayoutProps {
  country: string;
  province: string;
  metrics: any;
  projects: any[];
  sos: any;
  dashboardOneData?: {
    kpis: any;
    breakdown: any[];
    trend: any[];
    distribution: any[];
    matrix: any[];
  };
}

export default function BriefingLayout({
  country,
  province,
  metrics,
  projects,
  sos,
  dashboardOneData,
}: BriefingLayoutProps) {
  const today = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="hidden print:block min-h-screen bg-white p-12 text-slate-900 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
            Strategic Intelligence Briefing
          </h1>
          <div className="flex items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-xs">
            <Flag className="w-4 h-4" />
            <span>
              {country} / {province} Regional Profile
            </span>
          </div>
        </div>
        <div className="text-right text-slate-400 font-black uppercase tracking-widest text-[10px]">
          <p>Confidential: Strategic Level 1</p>
          <p>Generated: {today}</p>
        </div>
      </div>

      {/* Dashboard 1: State of the Province Sections */}
      {dashboardOneData && (
        <div className="mb-12 space-y-12">
          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 border-l-4 border-slate-900 pl-4">
              Executive Summary: {province}
            </h2>
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 italic text-sm leading-relaxed text-slate-600">
              The following synthesis is generated from{" "}
              {dashboardOneData.kpis.concernVolume.value || 0} validated
              provincial signals. The top public concern is currently identified
              as{" "}
              <span className="text-slate-900 font-black uppercase">
                {dashboardOneData.kpis.topConcern.value || "N/A"}
              </span>
              . Strategic alignment with provincial budget priorities is rated
              as{" "}
              <span className="text-slate-900 font-black uppercase">
                {dashboardOneData.kpis.alignmentScore.rating}
              </span>
              .
            </div>
          </section>

          <div className="grid grid-cols-2 gap-12">
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-900" />
                Top 5 Public Concerns
              </h3>
              <div className="space-y-4">
                {dashboardOneData.breakdown.slice(0, 5).map((b, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-slate-100"
                  >
                    <span className="text-sm font-bold text-slate-700">
                      {b.topic}
                    </span>
                    <span className="text-xs font-black text-slate-400">
                      {b.percentage.toFixed(1)}% SOV
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-900" />
                Municipality Ranking Summary
              </h3>
              <div className="space-y-4">
                {dashboardOneData.distribution.slice(0, 5).map((d, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-slate-100"
                  >
                    <span className="text-sm font-bold text-slate-700">
                      {d.name}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {d.value} Signals
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-900" />
              Budget Alignment Commentary
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {dashboardOneData.kpis.alignmentScore.governanceNote}. Alignment
              analysis indicates a focus on {province} infrastructure delivery
              nodes.
            </p>
          </section>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-12 bg-white print:static print:mt-12">
        <div className="grid grid-cols-2 gap-12 border-t border-slate-100 pt-8 mb-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Autonomous Data Lineage
            </h4>
            <div className="text-[9px] font-bold text-slate-500 uppercase">
              Governed Reporting Protocol: Next-Gen Civic Intelligence
            </div>
          </div>
          <div className="text-right">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Institutional Verification
            </h4>
            <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
              Confidence Rating: {sos?.rating || "PARTIAL"}
            </p>
          </div>
        </div>
        <div className="text-center text-slate-300 font-black uppercase tracking-[0.4em] text-[8px]">
          GIC Community Insights • Government Insight Engine • Johannesburg
          South Africa
        </div>
      </div>
    </div>
  );
}
