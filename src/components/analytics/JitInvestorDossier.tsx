"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, ShieldCheck, Activity, MapPin, 
  Target, AlertTriangle, Users2, FileText, 
  ChevronRight, Building2, Zap, AlertCircle
} from "lucide-react";

export interface HighTechInvestorDossier {
  investorName: string;
  classification: string;
  capitalVelocity: string;
  riskAppetite: string;

  activeProvincialOperations: {
    province: string;
    municipality: string;
    targetWards: string[];
    activeCapital: string;
    focusAreas: string[];
  }[];

  investmentTargeting: {
    impoverishedCommunities: {
      communityName: string;
      severeDeficit: string;
      requiredCapital: string;
      strategicRationale: string;
    }[];
    projectsActivelySeekingFunding: {
      projectName: string;
      requiredInvestmentType: string;
      whyTheyShouldBeInvolved: string;
    }[];
  };

  leadershipMatch: {
    keyDecisionMakers: string[];
    localBuyInProbability: number;
    politicalFrictionPoints: string[];
  };
}

export default function JitInvestorDossier({ data }: { data: HighTechInvestorDossier }) {
  if (!data) return null;

  // Animation variants
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="bg-blue-950/80 rounded-[2rem] p-8 md:p-12 border border-blue-900/50 shadow-2xl relative overflow-hidden mt-8 mb-12 backdrop-blur-xl print:bg-white print:text-slate-900 print:border-none print:shadow-none print:m-0 print:p-0 print:overflow-visible"
    >
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gic-gold/5 blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      {/* Header */}
      <motion.div variants={item} className="pb-8 border-b border-blue-900/50 flex flex-col md:flex-row md:justify-between items-start md:items-center relative z-10 gap-6">
        <div>
           <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-slate-900 border border-blue-800/50 rounded-full flex items-center justify-center shadow-inner">
                 <Building2 className="w-6 h-6 text-gic-gold" />
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-white print:text-slate-900 tracking-tight">{data.investorName}</h2>
           </div>
           <div className="flex items-center gap-4 pl-[4.5rem]">
             <span className="text-xs font-black uppercase tracking-[0.2em] text-gic-gold px-3 py-1 bg-gic-gold/10 border border-gic-gold/20 rounded-full">
               {data.classification}
             </span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-blue-900/50 pl-4">
               Live Demographic Sync
             </span>
           </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors print:hidden shadow-xl shadow-white/5"
        >
          <FileText className="w-4 h-4" /> Export Intelligence
        </button>
      </motion.div>

      {/* Primary Metrics Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 relative z-10 border-b border-blue-900/50">
        <div className="bg-slate-950/60 border border-blue-900/30 rounded-3xl p-6 hover:border-blue-700/50 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Capital Velocity
            </p>
            <p className="text-xl font-black text-white">{data.capitalVelocity}</p>
        </div>
        <div className="bg-slate-950/60 border border-blue-900/30 rounded-3xl p-6 hover:border-blue-700/50 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Risk Appetite
            </p>
            <p className="text-xl font-black text-white">{data.riskAppetite}</p>
        </div>
        <div className="bg-slate-950/60 border border-blue-900/30 rounded-3xl p-6 hover:border-blue-700/50 transition-colors relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-b from-emerald-500 to-emerald-900 opacity-50" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Local Buy-In Probability
            </p>
            <div className="flex items-baseline gap-2">
               <p className="text-4xl font-black text-emerald-400">{data.leadershipMatch.localBuyInProbability}%</p>
               <span className="text-xs font-bold text-slate-400 uppercase">Success Rate</span>
            </div>
        </div>
      </motion.div>

      {/* Geographic & Ward Level Targeting */}
      <motion.div variants={item} className="py-10 border-b border-blue-900/50 relative z-10">
        <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" /> Active Provincial Operations
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.activeProvincialOperations.map((op, i) => (
            <div key={i} className="bg-slate-900/40 border border-blue-900/30 rounded-2xl p-6 relative">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-bold text-lg">{op.municipality}</h4>
                    <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">{op.province}</p>
                  </div>
                  <span className="bg-blue-900/30 text-blue-300 border border-blue-800/50 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">
                    {op.activeCapital}
                  </span>
               </div>
               
               <div className="space-y-4">
                 <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Target Wards</p>
                   <div className="flex flex-wrap gap-2">
                     {op.targetWards.map((w, j) => (
                       <span key={j} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700">
                         {w}
                       </span>
                     ))}
                   </div>
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Infrastructure Focus</p>
                   <div className="flex flex-wrap gap-2">
                     {op.focusAreas.map((f, j) => (
                       <span key={j} className="text-[11px] text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-900/50 px-2.5 py-1 rounded-md">
                         {f}
                       </span>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Impoverished Targeting Data Table */}
      <motion.div variants={item} className="py-10 border-b border-blue-900/50 relative z-10">
        <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400" /> Impoverished Community Targeting
        </h3>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-blue-900/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="py-4 pl-4">Community / Ward</th>
                <th className="py-4">Severe Deficit</th>
                <th className="py-4">Req. Capital</th>
                <th className="py-4 pr-4">Strategic Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/20 text-sm">
              {data.investmentTargeting.impoverishedCommunities.map((comm, idx) => (
                <tr key={idx} className="hover:bg-blue-900/10 transition-colors">
                  <td className="py-4 pl-4 font-bold text-white whitespace-nowrap">{comm.communityName}</td>
                  <td className="py-4 text-rose-400 font-medium break-words w-48">{comm.severeDeficit}</td>
                  <td className="py-4 font-black text-emerald-400 tracking-wider w-32">{comm.requiredCapital}</td>
                  <td className="py-4 pr-4 text-slate-300 text-xs leading-relaxed max-w-sm">{comm.strategicRationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Leadership & Projects Split */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-10 py-10 relative z-10">
        
        {/* Leadership & Friction */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Users2 className="w-5 h-5 text-gic-gold" /> Key Decision Makers & Friction
          </h3>
          
          <div className="bg-slate-900/50 border border-blue-900/30 p-5 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Principals</p>
            <div className="space-y-2">
              {data.leadershipMatch.keyDecisionMakers.map((dm, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-blue-900/50">
                   <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center border border-blue-800">
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                   </div>
                   <p className="text-sm font-bold text-slate-200">{dm}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-rose-950/20 border border-rose-900/30 p-5 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-3 block">Political Friction Points</p>
            <ul className="space-y-3">
              {data.leadershipMatch.politicalFrictionPoints.map((point, i) => (
                <li key={i} className="flex gap-3 text-xs font-medium text-slate-300 items-start">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Projects Seeking Funding */}
        <div>
          <h3 className="text-lg font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" /> Projects Actively Pitching
          </h3>
          <div className="space-y-4">
            {data.investmentTargeting.projectsActivelySeekingFunding.map((proj, i) => (
              <div key={i} className="bg-slate-900/40 border border-t-0 border-r-0 border-b-0 border-l-4 border-l-blue-500 rounded-lg p-5">
                 <h4 className="text-white font-bold mb-1">{proj.projectName}</h4>
                 <p className="text-[10px] font-black tracking-widest uppercase text-gic-gold mb-3">{proj.requiredInvestmentType}</p>
                 <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                   {proj.whyTheyShouldBeInvolved}
                 </p>
              </div>
            ))}
          </div>
        </div>
        
      </motion.div>

    </motion.div>
  );
}
