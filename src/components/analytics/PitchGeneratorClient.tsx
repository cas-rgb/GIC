"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Target, ShieldAlert, BarChart, Rocket, CheckCircle2, TrendingUp, Search } from "lucide-react";
import ProgressSpinner from "@/components/ui/ProgressSpinner";

interface PitchData {
  readinessScore: number;
  investmentCase: string;
  esgImpact: { pillar: string; projection: string }[];
  criticalGaps: string[];
}

export default function PitchGeneratorClient() {
  const searchParams = useSearchParams();
  const province = searchParams.get("province") || "Gauteng";
  const municipality = searchParams.get("municipality") || "";
  const serviceDomain = searchParams.get("serviceDomain") || "";

  const [ward, setWard] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [data, setData] = useState<PitchData | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePitch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/generate-pitch', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province, municipality, serviceDomain, ward, projectType })
      });
      const payload = await res.json();
      setData(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
       <div className="bg-slate-900 border border-slate-700 rounded-[2rem] p-16 flex flex-col items-center justify-center min-h-[500px] shadow-2xl relative overflow-hidden h-full mt-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none" />
          <ProgressSpinner durationMs={15000} message="Drafting Institutional Pitch Pack..." />
          <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-slate-500">Synthesizing ESG & ROI Trajectories</p>
       </div>
     );
  }

  return (
    <div className="space-y-8 pb-16 print:pb-0 print:bg-white print:text-slate-900">
       {/* Search Input */}
       <div className="relative mb-8 print:hidden">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500/50" />
          <input 
            type="text" 
            placeholder="Search structural readiness, investment cases, or SDG alignment..." 
            className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 shadow-inner"
          />
       </div>

       {/* Target Deal Desk Configurator */}
       <div className="rounded-[2rem] border border-rose-900/40 bg-slate-900 p-8 shadow-2xl relative overflow-hidden print:hidden flex flex-col gap-6 mb-8 mt-4">
         <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none" />
         
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">
              Strategic Pitch Scope
            </p>
            <p className="mt-2 text-lg font-medium text-slate-300">
              Generating Institutional Pitch for: <span className="font-bold text-white uppercase tracking-widest break-words space-x-2">
                 <span className="bg-slate-800 px-2 py-1 rounded">[{province}]</span>
                 {municipality && <span className="bg-slate-800 px-2 py-1 rounded">[{municipality}]</span>}
                 {serviceDomain && <span className="bg-slate-800 px-2 py-1 rounded">[{serviceDomain}]</span>}
              </span>
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Hyper-Local Ward Focus (Optional)</label>
               <input 
                 type="text" 
                 value={ward}
                 onChange={(e) => setWard(e.target.value)}
                 placeholder="e.g. Ward 65 or Sandton Central" 
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:border-rose-500/50 shadow-inner"
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Infrastructure Project Type (Optional)</label>
               <input 
                 type="text" 
                 value={projectType}
                 onChange={(e) => setProjectType(e.target.value)}
                 placeholder="e.g. Bulk Water, Smart Clinic, Social Housing" 
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:border-rose-500/50 shadow-inner"
               />
            </div>
         </div>
         
         <div className="flex justify-between items-center mt-2 relative z-10">
            <button
               onClick={() => window.print()}
               className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg"
             >
               <FileText className="w-4 h-4" /> Export Pitch Deck PDF
            </button>
            <button 
              onClick={generatePitch}
              className="px-8 py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl text-sm font-black uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all flex items-center gap-2"
            >
               Generate Pitch < Rocket className="w-4 h-4" />
            </button>
         </div>
       </div>

       {data && data.investmentCase && (
         <>
         {/* Score & Pitch Wrapper */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[2rem] p-8 text-center shadow-2xl print:border-none print:shadow-none print:bg-slate-50">
               <div className="w-32 h-32 mx-auto bg-slate-900 border-[8px] border-slate-800 rounded-full flex items-center justify-center relative mb-6 shadow-inner">
                  {/* Dynamically color the ring based on readiness */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                    <circle cx="50%" cy="50%" r="56" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className={data.readinessScore > 75 ? 'text-emerald-500' : data.readinessScore > 50 ? 'text-amber-500' : 'text-rose-500'} strokeDasharray="351.858" strokeDashoffset={351.858 - (351.858 * data.readinessScore) / 100} />
                  </svg>
                  <span className="text-4xl font-display font-black text-white print:text-slate-900">{data.readinessScore}</span>
               </div>
               <h3 className="text-lg font-black text-white uppercase tracking-widest print:text-slate-900">Investment Readiness</h3>
               <p className="text-xs font-bold text-slate-400 mt-2">Proprietary GIC Scoring Index</p>
            </div>

            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-[2rem] p-10 shadow-2xl print:border-none print:shadow-none print:p-0">
               <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5 print:border-slate-200">
                  <Target className="w-6 h-6 text-rose-500" />
                  <h3 className="text-2xl font-display font-black text-white uppercase tracking-wider print:text-slate-900">Why Invest Here?</h3>
               </div>
               <div className="text-slate-300 font-inter text-lg leading-relaxed space-y-6 whitespace-pre-wrap print:text-slate-700">
                  {data.investmentCase}
               </div>
            </div>
         </div>

         {/* ESG & Gaps */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group print:border-none print:shadow-none print:p-0">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] pointer-events-none print:hidden" />
               <div className="flex items-center gap-3 mb-8">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-black text-white uppercase tracking-wider print:text-slate-900">ESG Impact Projections</h3>
               </div>
               <div className="space-y-6 relative z-10">
                  {data.esgImpact?.map((esg, idx) => (
                     <div key={idx} className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 print:bg-slate-50 print:border-slate-200">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md mb-3 inline-block">
                           {esg.pillar}
                        </span>
                        <p className="text-sm font-medium text-slate-300 leading-relaxed print:text-slate-700">{esg.projection}</p>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group print:border-none print:shadow-none print:p-0">
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[60px] pointer-events-none print:hidden" />
               <div className="flex items-center gap-3 mb-8">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-black text-white uppercase tracking-wider print:text-slate-900">Critical Mitigation Gaps</h3>
               </div>
               <div className="space-y-4 relative z-10">
                  {data.criticalGaps?.map((gap, idx) => (
                     <div key={idx} className="flex gap-4 items-start bg-slate-950/50 p-5 rounded-2xl border border-slate-800 print:bg-slate-50 print:border-slate-200">
                        <span className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20 text-rose-500 text-xs font-black">
                           {idx + 1}
                        </span>
                        <p className="text-sm font-medium text-slate-300 leading-relaxed print:text-slate-700 mt-0.5">{gap}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
       </>
       )}
    </div>
  );
}
