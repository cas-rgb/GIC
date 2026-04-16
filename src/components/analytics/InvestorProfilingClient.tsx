"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import JitInvestorLandscape from "@/components/analytics/JitInvestorLandscape";
import { Search, Building, ShieldCheck, Target, Activity } from "lucide-react";
import ProgressSpinner from "@/components/ui/ProgressSpinner";

export default function InvestorProfilingClient() {
  const searchParams = useSearchParams();
  const activeProvince = searchParams.get("province") ?? "Gauteng";
  const activeMunicipality = searchParams.get("municipality") || null;
  const activeServiceDomain = searchParams.get("serviceDomain") || null;
  const activeDays = searchParams.get("days") || "90";

  const [ward, setWard] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [investorName, setInvestorName] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [climateData, setClimateData] = useState<{
    mandateCheck: string;
    sentimentScore: number;
    recentActivity: string[];
  } | null>(null);

  const checkInvestorClimate = async () => {
    if (!investorName) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/investigate-investor-climate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          province: activeProvince,
          municipality: activeMunicipality,
          serviceDomain: activeServiceDomain,
          ward,
          projectType,
          investorName
        })
      });
      const payload = await res.json();
      setClimateData(payload);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Target Deal Desk Configurator */}
      <div className="rounded-[2rem] border border-blue-900/40 bg-slate-900 p-8 shadow-2xl relative overflow-hidden print:hidden flex flex-col gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
             Targeted Investor Interrogation
           </p>
           <p className="mt-2 text-lg font-medium text-slate-300">
             Actively Ping Specific Investor Sentiments Against: <span className="font-bold text-white uppercase tracking-widest break-words space-x-2">
                <span className="bg-slate-800 px-2 py-1 rounded">[{activeProvince}]</span>
                {activeMunicipality && <span className="bg-slate-800 px-2 py-1 rounded">[{activeMunicipality}]</span>}
                {activeServiceDomain && <span className="bg-slate-800 px-2 py-1 rounded">[{activeServiceDomain}]</span>}
             </span>
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Target Investor Name</label>
              <input 
                type="text" 
                value={investorName}
                onChange={(e) => setInvestorName(e.target.value)}
                placeholder="e.g. World Bank or DBSA" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:border-blue-500/50 shadow-inner"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Hyper-Local Ward Focus (Optional)</label>
              <input 
                type="text" 
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="e.g. Ward 65 or Sandton Central" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:border-blue-500/50 shadow-inner"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Infrastructure Project Type (Optional)</label>
              <input 
                type="text" 
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder="e.g. Bulk Water, Smart Clinic, Social Housing" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:border-blue-500/50 shadow-inner"
              />
           </div>
        </div>
        
        <div className="flex justify-end mt-2 relative z-10">
           <button 
             onClick={checkInvestorClimate}
             disabled={!investorName}
             className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-sm font-black uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 transition-all flex items-center gap-2"
           >
              Run Sentiment & Mandate Audit <Search className="w-4 h-4" />
           </button>
        </div>
      </div>

      {loading && (
         <div className="bg-slate-900 border border-slate-700 rounded-[2rem] p-16 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
            <ProgressSpinner durationMs={12000} message={`Aggregating Mandates for ${investorName}...`} />
            <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-slate-500">Extracting Executive Climate Indicators</p>
         </div>
      )}

      {!loading && climateData && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
           <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
              <Building className="w-6 h-6 text-blue-400" />
              <h3 className="text-2xl font-display font-black text-white uppercase tracking-wider">{investorName} Live Policy Audit</h3>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Ground-Truth Funding Mandate</h4>
                    <p className="text-sm font-medium text-slate-300 bg-slate-950/50 p-6 rounded-2xl border border-slate-800 leading-relaxed whitespace-pre-wrap">{climateData.mandateCheck}</p>
                 </div>
                 
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-rose-400" /> Verified Recent Activity</h4>
                    <div className="space-y-3">
                       {climateData.recentActivity.map((act, i) => (
                          <div key={i} className="flex gap-4 items-start bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                             <p className="text-xs font-medium text-slate-300 leading-relaxed">{act}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-1 bg-slate-950 p-8 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
                 <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 w-full pb-4 border-b border-slate-800">Current Sentiment</div>
                 <div className="w-40 h-40 rounded-full border-8 border-slate-900 shadow-inner flex items-center justify-center relative mb-4">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="50%" cy="50%" r="76" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                      <circle cx="50%" cy="50%" r="76" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className={climateData.sentimentScore > 75 ? 'text-emerald-500' : climateData.sentimentScore > 50 ? 'text-blue-500' : 'text-rose-500'} strokeDasharray="477.522" strokeDashoffset={477.522 - (477.522 * climateData.sentimentScore) / 100} />
                    </svg>
                    <span className="text-5xl font-display font-black text-white">{climateData.sentimentScore}</span>
                 </div>
                 <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded bg-slate-900 border ${climateData.sentimentScore > 75 ? 'text-emerald-500 border-emerald-500/20' : climateData.sentimentScore > 50 ? 'text-blue-500 border-blue-500/20' : 'text-rose-500 border-rose-500/20'}`}>
                    {climateData.sentimentScore > 75 ? "Highly Favorable" : climateData.sentimentScore > 50 ? "Neutral / Cautious" : "Aggressively Hostile"}
                 </span>
              </div>
           </div>
        </div>
      )}

      <JitInvestorLandscape 
         province={activeProvince} 
         municipality={activeMunicipality} 
         serviceDomain={activeServiceDomain} 
      />
    </div>
  );
}

