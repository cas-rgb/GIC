"use client";

import { motion } from "framer-motion";
import { 
  Briefcase,
  AlertTriangle,
  MapPin, 
  Target,
  Zap,
  Building2,
  FileText
} from "lucide-react";
import { useEffect, useState } from "react";
import ProgressSpinner from "@/components/ui/ProgressSpinner";

export interface InvestorLandscapeDossier {
  landscapeSummary: string;
  activeInvestors: {
    investorName: string;
    strategicFocus: string;
    capitalVelocity: string;
    activeOperations: string;
  }[];
  impoverishedTargets: {
    communityName: string;
    criticalDeficit: string;
    requiredCapital: string;
    strategicInvestmentRationale: string;
  }[];
  projectsSeekingFunding: {
    projectName: string;
    promoter: string;
    investmentType: string;
    whyGetInvolved: string;
  }[];
}

export default function JitInvestorLandscape({ province, municipality, serviceDomain }: { province: string, municipality?: string | null, serviceDomain?: string | null }) {
  const [data, setData] = useState<InvestorLandscapeDossier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/analytics/investigate-investor-landscape', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ province, municipality, serviceDomain })
    })
    .then(res => res.json())
    .then(payload => {
      setData(payload);
    })
    .catch(err => console.error("Failed to fetch Investor Landscape", err))
    .finally(() => setLoading(false));
  }, [province, municipality, serviceDomain]);

  if (loading) {
     return (
       <div className="bg-slate-900 border border-slate-700 rounded-[2rem] p-16 flex flex-col items-center justify-center min-h-[500px] shadow-2xl relative overflow-hidden h-full mt-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gic-gold/5 blur-[100px] rounded-full pointer-events-none" />
          <ProgressSpinner durationMs={15000} message="Synthesizing Macro Investment Trajectories..." />
          <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-slate-500">Live Capital Intelligence Ingestion</p>
       </div>
     );
  }

  if (!data || !data.landscapeSummary) return null;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="bg-blue-950/80 rounded-[2rem] p-8 md:p-12 border border-blue-900/50 shadow-2xl relative mt-8 mb-12 backdrop-blur-xl print:bg-white print:text-slate-900 print:border-none print:shadow-none print:overflow-visible overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/10 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none print:hidden" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gic-gold/5 blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none print:hidden" />
      
      {/* Header */}
      <motion.div variants={item} className="pb-8 border-b border-blue-900/50 flex flex-col md:flex-row md:justify-between items-start md:items-center relative z-10 gap-6">
        <div>
           <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-slate-900 border border-blue-800/50 rounded-full flex items-center justify-center shadow-inner">
                 <Building2 className="w-6 h-6 text-gic-gold" />
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-white print:text-slate-900 tracking-tight">Macro Investment Profiling</h2>
           </div>
           <div className="flex items-center gap-4 pl-[4.5rem]">
             <span className="text-xs font-black uppercase tracking-[0.2em] text-gic-gold px-3 py-1 bg-gic-gold/10 border border-gic-gold/20 rounded-full">
               Sector Capital Overview
             </span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-blue-900/50 pl-4">
               Live 30-Day Synthesis
             </span>
           </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors print:hidden shadow-xl shadow-white/5"
        >
          <FileText className="w-4 h-4" /> Export Report
        </button>
      </motion.div>

      {/* Landscape Summary */}
      <motion.div variants={item} className="py-10 border-b border-blue-900/50 relative z-10">
         <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-400" /> Strategic Landscape Intelligence
         </h3>
         <div className="text-slate-300 leading-relaxed font-inter text-lg space-y-6 max-w-5xl whitespace-pre-wrap print:text-slate-800">
           {data.landscapeSummary}
         </div>
      </motion.div>

      {/* Grid: Impoverished Targets & Projects Pitching */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-10 py-10 border-b border-blue-900/50 relative z-10">
        
        {/* Impoverished Targets */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" /> Critical Intervention Zones
          </h3>
          
          <div className="space-y-4">
            {data.impoverishedTargets.map((comm, idx) => (
               <div key={idx} className="bg-rose-950/20 border border-rose-900/40 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-rose-600 rounded-l-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="pl-3">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-bold">{comm.communityName}</h4>
                        <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md uppercase tracking-widest border border-rose-500/20">
                           {comm.requiredCapital}
                        </span>
                     </div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 line-clamp-1">{comm.criticalDeficit}</p>
                     <p className="text-sm font-medium text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-rose-900/30">
                        {comm.strategicInvestmentRationale}
                     </p>
                  </div>
               </div>
            ))}
          </div>
        </div>

        {/* Projects Pitching */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-5 h-5 text-gic-gold" /> Bankable Projects Seeking Pitch
          </h3>
          
          <div className="space-y-4">
            {data.projectsSeekingFunding.map((proj, idx) => (
               <div key={idx} className="bg-slate-900/60 border border-slate-700/50 p-5 rounded-2xl relative group">
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="text-white font-bold">{proj.projectName}</h4>
                     <span className="text-[10px] font-black text-gic-gold bg-gic-gold/10 px-2.5 py-1 rounded-md uppercase tracking-widest border border-gic-gold/20">
                        {proj.investmentType}
                     </span>
                  </div>
                  <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {proj.promoter}
                  </p>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                     {proj.whyGetInvolved}
                  </p>
               </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Active Investors Block */}
      <motion.div variants={item} className="py-10 relative z-10">
         <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-400" /> Currently Active Institutions
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.activeInvestors.map((inv, idx) => (
               <div key={idx} className="bg-slate-950/60 border border-blue-900/30 rounded-2xl p-6 hover:border-blue-700/50 transition-colors relative overflow-hidden">
                  <div className="flex justify-between items-center mb-4 border-b border-blue-900/30 pb-4">
                     <h4 className="text-lg font-black text-white px-2 border-l-2 border-blue-500">{inv.investorName}</h4>
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shadow-emerald-900/20 shadow-lg">
                       {inv.capitalVelocity}
                     </span>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Strategic Focus</span>
                        <p className="text-sm font-bold text-slate-300">{inv.strategicFocus}</p>
                     </div>
                     <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Confirmed Regional Operations</span>
                        <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">{inv.activeOperations}</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </motion.div>

    </motion.div>
  );
}
