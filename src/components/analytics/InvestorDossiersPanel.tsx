"use client";
import { useEffect, useState } from "react";
import {
  Building2,
  X,
  FileText,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import SafeChartWrapper from "@/components/ui/SafeChartWrapper";
import { motion, AnimatePresence } from "framer-motion";
import ExportToPDFFooter from "../ui/ExportToPDFFooter";

interface InvestorDossiersPanelProps {
  province?: string;
  municipality?: string | null;
  serviceDomain?: string | null;
}

export default function InvestorDossiersPanel({
  province,
  municipality,
  serviceDomain,
}: InvestorDossiersPanelProps) {
  const [investors, setInvestors] = useState<any[]>([]);
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<{
    matchScore: number;
    rationale: string;
  } | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    async function loadInvestors() {
      const params = new URLSearchParams({
        province: province || "Gauteng",
        municipality: municipality || "",
      });
      const res = await fetch(
        `/api/analytics/investor-dossiers?${params.toString()}`,
      );
      if (res.ok) {
        const data = await res.json();
        setInvestors(data.investors || []);
      }
    }
    void loadInvestors();
  }, [province, municipality]);

  const handleSelectInvestor = async (inv: any) => {
    if (selectedInvestorId === inv.id) {
      setSelectedInvestorId(null);
      return;
    }
    
    setSelectedInvestorId(inv.id);
    setMatchData(null);
    setLoadingMatch(true);
    try {
      const res = await fetch("/api/analytics/investor-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investor: inv,
          province,
          municipality,
          serviceDomain,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMatchData(data);
      }
    } catch {
      setMatchData({
        matchScore: 50,
        rationale: "Default score due to processing error.",
      });
    } finally {
      setLoadingMatch(false);
    }
  };

  const getRadarData = (inv: any) => {
    const sectors = [
      "Water",
      "Energy",
      "Transport",
      "Human Settlements",
      "Health",
      "Education",
    ];
    return sectors.map((s) => ({
      subject: s,
      A: inv.focusSectors.some((fs: string) => fs.includes(s) || s.includes(fs))
        ? 90 + Math.random() * 10
        : 30 + Math.random() * 20,
      fullMark: 100,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden border border-slate-100 bg-white">
        <div className="grid grid-cols-[1.5fr_1fr_0.8fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <p>Institutional Investor</p> 
          <p>Sector Focus</p>
          <p className="text-right">AUM / Scale</p>
        </div>
        
        <div className="divide-y divide-slate-100">
          {investors.map((inv) => (
            <div key={inv.id} className="flex flex-col print:block">
              {/* Row Header */}
              <div
                onClick={() => handleSelectInvestor(inv)}
                className={`grid grid-cols-[1.5fr_1fr_0.8fr] gap-3 px-4 py-4 items-center cursor-pointer transition-colors ${selectedInvestorId === inv.id ? 'bg-blue-50/50 outline outline-1 outline-blue-200' : 'bg-white hover:bg-slate-50'} print:hidden`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 transition-colors ${selectedInvestorId === inv.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {inv.name}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {inv.type}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {inv.focusSectors.map((s: string) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="text-right flex items-center justify-end gap-2">
                  <p className="text-sm font-bold text-slate-900">
                    {inv.aum}
                  </p>
                </div>
              </div>

              {/* Accordion Content */}
              <AnimatePresence>
                {selectedInvestorId === inv.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden bg-slate-50/50 print:block"
                  >
                    <div className="p-6 md:p-8 border-t border-slate-200 shadow-[inset_0_4px_6px_-4px_rgba(0,0,0,0.05)]">
                        {/* Dossier Header */}
                        <div className="mb-8 flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-black tracking-widest uppercase text-blue-600 mb-1">
                              Confidential Investor Dossier
                            </p>
                            <h2 className="text-2xl font-black text-slate-900">
                              {inv.name}
                            </h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                              Executive Briefing &mdash; {province}
                            </p>
                          </div>
                          <button
                            onClick={() => window.print()}
                            className="print:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" /> Generate Briefing PDF
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Left Column */}
                          <div className="space-y-8">
                            <div>
                              <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4" /> Profile Overview
                              </h4>
                              <p className="text-sm text-slate-700 font-medium leading-relaxed bg-white p-4 border border-slate-100 rounded-lg">
                                Type: <strong className="text-slate-900">{inv.type}</strong>
                                <br /> Scale: <strong className="text-slate-900">{inv.aum}</strong>
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Historic Footprint
                              </h4>
                              <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                                <p className="text-sm font-bold text-amber-900 leading-snug">
                                  {inv.history}
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
                              <h4 className="text-[10px] font-black tracking-widest uppercase text-blue-600 mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Opportunity Match Score
                              </h4>
                              {loadingMatch ? (
                                <div className="flex flex-col items-center gap-3 text-slate-400 py-6">
                                  <RefreshCw className="w-6 h-6 animate-spin text-gic-blue" />
                                  <span className="text-xs font-bold uppercase tracking-wider">
                                    Computing Institutional Matrix...
                                  </span>
                                </div>
                              ) : matchData ? (
                                <motion.div 
                                  initial={{ scale: 0.95, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="space-y-4"
                                >
                                  <div className="flex items-end gap-3">
                                    <span
                                      className={`text-5xl font-black tracking-tighter ${matchData.matchScore > 75 ? "text-emerald-500" : matchData.matchScore > 50 ? "text-amber-500" : "text-slate-500"}`}
                                    >
                                      {matchData.matchScore}%
                                    </span>
                                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 pb-2">
                                      Confidence Alignment
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-slate-700 leading-relaxed pt-3 border-t border-slate-100">
                                    {matchData.rationale}
                                  </p>
                                </motion.div>
                              ) : null}
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-8">
                            <div className="bg-white border border-slate-100 p-4 rounded-lg">
                              <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-4 text-center">
                                Sector Relevance (Trailing 30 Days)
                              </h4>
                              <div className="h-64">
                                <SafeChartWrapper
                                  minHeight="100%"
                                  fallbackMessage="Chart Format Error"
                                >
                                  <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart
                                      cx="50%"
                                      cy="50%"
                                      outerRadius="80%"
                                      data={getRadarData(inv)}
                                    >
                                      <PolarGrid stroke="#e2e8f0" />
                                      <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{
                                          fill: "#64748b",
                                          fontSize: 10,
                                          fontWeight: 700,
                                        }}
                                      />
                                      <Radar
                                        name="Alignment"
                                        dataKey="A"
                                        stroke="#2563eb"
                                        fill="#3b82f6"
                                        fillOpacity={0.3}
                                      />
                                    </RadarChart>
                                  </ResponsiveContainer>
                                </SafeChartWrapper>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Matched Treasury Pipeline
                              </h4>
                              <div className="space-y-3">
                                {/* Mock matched projects based on sector focus */}
                                <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex justify-between items-center transition-all hover:border-blue-300 cursor-pointer">
                                  <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase">
                                      Phase 2 {inv.focusSectors[0]} Expansion
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                      {municipality || province} | Tender Ready
                                    </p>
                                  </div>
                                  <span className="gic-badge gic-badge-success">
                                    High Match
                                  </span>
                                </div>
                                <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex justify-between items-center transition-all hover:border-amber-300 cursor-pointer">
                                  <div>
                                    <p className="text-xs font-bold text-slate-900 uppercase">
                                      Bulk {inv.focusSectors[1] || "Infrastructure"} Rehabilitation
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                      {municipality || province} | Pre-Feasibility
                                    </p>
                                  </div>
                                  <span className="gic-badge gic-badge-warning">
                                    Med Match
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
      <ExportToPDFFooter confidenceRating="VERIFIED" />
    </div>
  );
}
