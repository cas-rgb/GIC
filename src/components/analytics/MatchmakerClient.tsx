"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Building2, Landmark, Target, Crosshair, ArrowRight, Wallet, PieChart, Search } from "lucide-react";
import ProgressSpinner from "@/components/ui/ProgressSpinner";

interface MatchmakerData {
  matches: {
    investorName: string;
    investorType: string;
    matchScore: number;
    alignmentRationale: string;
    capitalThreshold: string;
    lastKnownActivity: string;
  }[];
  marketSentiment: string;
}

export default function MatchmakerClient() {
  const searchParams = useSearchParams();
  const province = searchParams.get("province") || "Gauteng";
  const municipality = searchParams.get("municipality") || "";
  const serviceDomain = searchParams.get("serviceDomain") || "";

  const [ward, setWard] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  
  const [data, setData] = useState<MatchmakerData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMatchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/matchmaker', {
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
          <ProgressSpinner durationMs={12000} message="Isolating High-Probability Capital Alliances..." />
          <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-slate-500">Live Deal Flow Synthesis</p>
       </div>
     );
  }

  return (
    <div className="space-y-8 print:bg-white print:text-black">
      {/* Search Input */}
      <div className="relative mb-8 print:hidden">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/50" />
         <input 
           type="text" 
           placeholder="Search matched investors, mandate thresholds, or structural targets..." 
           className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 shadow-inner"
         />
      </div>

      {/* Target Deal Desk Configurator */}
      <div className="rounded-[2rem] border border-emerald-900/40 bg-slate-900 p-8 shadow-2xl relative overflow-hidden print:hidden flex flex-col gap-6 mt-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
             Strategic Deal Desk Matrix
           </p>
           <p className="mt-2 text-lg font-medium text-slate-300">
             The Deal Room AI is assessing: <span className="font-bold text-white uppercase tracking-widest break-words space-x-2">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 shadow-inner"
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Infrastructure Project Type (Optional)</label>
              <input 
                type="text" 
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                placeholder="e.g. Bulk Water, Smart Clinic, Social Housing" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 shadow-inner"
              />
           </div>
        </div>
        
        <div className="flex justify-end mt-2 relative z-10">
           <button 
             onClick={fetchMatchData}
             className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-black uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
           >
              Launch Targeted Intelligence <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>

      {data && (
        <>
        {/* Sentiment Tracker */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden print:border-none print:shadow-none bg-gradient-to-br from-slate-900 to-slate-950">
          <h3 className="text-xl font-display font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-emerald-500" /> Sector Capital Sentiment
          </h3>
          <p className="text-lg text-slate-300 font-inter leading-relaxed">{data.marketSentiment}</p>
        </div>

        {/* Top Matches */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-wider pl-2 flex items-center gap-2 print:text-slate-900">
            <Crosshair className="w-5 h-5 text-gic-gold" /> Institutional Action Matches
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {data.matches?.map((match, idx) => (
               <motion.div 
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 key={idx} 
                 className="bg-slate-900/80 border border-slate-700/50 rounded-[2rem] p-8 hover:border-emerald-500/30 transition-colors relative group overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-8 flex items-center gap-3">
                     <div className="text-right">
                        <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-0.5">Proprietary Match Index</p>
                        <p className={`text-3xl font-display font-black ${match.matchScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{match.matchScore}/100</p>
                     </div>
                     <Target className={`w-8 h-8 opacity-20 ${match.matchScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`} />
                  </div>

                  <div className="flex items-center gap-4 mb-6 relative z-10">
                     <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center shadow-inner">
                        {match.investorType.includes('Private') ? <Building2 className="w-6 h-6 text-slate-400" /> : <Landmark className="w-6 h-6 text-gic-gold" />}
                     </div>
                     <div>
                        <h4 className="text-2xl font-black text-white">{match.investorName}</h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded inline-block mt-1">
                          {match.investorType}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-6 lg:w-3/4 relative z-10">
                     <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">Deal Alignment Rationale</span>
                        <p className="text-md text-slate-300 leading-relaxed font-medium bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                          {match.alignmentRationale}
                        </p>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Estimated Asset Threshold</span>
                           <p className="text-sm font-bold text-white flex items-center gap-1.5"><Wallet className="w-4 h-4 text-emerald-500" /> {match.capitalThreshold}</p>
                        </div>
                        <div>
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Live Track Record</span>
                           <p className="text-sm font-bold text-white">{match.lastKnownActivity}</p>
                        </div>
                     </div>
                  </div>
               </motion.div>
            ))}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
