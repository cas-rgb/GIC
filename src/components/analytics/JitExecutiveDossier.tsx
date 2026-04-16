"use client";

import { motion } from "framer-motion";
import { ShieldCheck, AlertCircle, TrendingUp, TrendingDown, ExternalLink, FileText, BrainCircuit, Activity, BookOpen } from "lucide-react";

export interface JitDossierPayload {
  leaderName: string;
  province: string;
  netTrustScore: number;
  prPressureVolume: number;
  scoreCalculationBreakdown: string;
  coreKineticRiskVector: string;
  strategicSummary: string;
  temporalAnalysis: {
    last30DaysActivity: string;
    historicIssues: string;
  };
  infrastructureOpportunities: {
    projectFocus: string;
    prBenefit: string;
    urgency: "High" | "Medium" | "Low";
  }[];
  recentDevelopments: {
    headline: string;
    impact: string;
    sentiment: "positive" | "negative" | "neutral";
  }[];
  mediaLinks: {
    title: string;
    url: string;
    source: string;
  }[];
}

export default function JitExecutiveDossier({ data }: { data: JitDossierPayload }) {
  if (!data) return null;

  const score = data.netTrustScore;
  const isPositive = score >= 0;

  // Animation variants
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="bg-slate-950 rounded-[2rem] p-8 md:p-12 border border-slate-800 shadow-2xl relative overflow-hidden mt-8 mb-12 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:m-0 print:p-0"
      id="executive-dossier-print-target"
    >
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gic-gold/10 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      {/* Header */}
      <motion.div variants={item} className="pb-8 border-b border-white/10 flex flex-col md:flex-row md:justify-between items-start md:items-center relative z-10 gap-6">
        <div>
           <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-slate-900 border border-slate-700/50 rounded-full flex items-center justify-center shadow-inner">
                 <BrainCircuit className="w-6 h-6 text-gic-gold" />
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-white print:text-slate-900">{data.leaderName}</h2>
           </div>
           <div className="flex items-center gap-4 pl-18">
             <span className="text-xs font-black uppercase tracking-[0.3em] text-gic-gold px-3 py-1 bg-gic-gold/10 border border-gic-gold/20 rounded-full">
               Live AI Synthesis
             </span>
             <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
               {data.province} Region
             </span>
           </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors print:hidden shadow-xl shadow-white/5"
        >
          <FileText className="w-4 h-4" /> Export Strategic Brief
        </button>
      </motion.div>

      {/* KPI Matrix */}
      <motion.div variants={item} className="grid grid-cols-1 xl:grid-cols-4 gap-6 py-10 relative z-10 border-b border-white/10">
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 hover:bg-slate-900/60 transition-colors">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-slate-500" />
             Net Public Trust
           </p>
           <div className="flex items-center gap-4">
             <p className={`text-6xl font-display font-black tracking-tight ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
               {score > 0 ? '+' : ''}{score}
             </p>
             {isPositive ? <TrendingUp className="w-8 h-8 text-emerald-500 opacity-80" /> : <TrendingDown className="w-8 h-8 text-rose-500 opacity-80" />}
           </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 hover:bg-slate-900/60 transition-colors">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
             <Activity className="w-4 h-4 text-slate-500" />
             PR Pressure Volume
           </p>
           <p className="text-6xl font-display font-black tracking-tight text-white print:text-slate-900">{data.prPressureVolume}</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 hover:bg-slate-900/60 transition-colors xl:col-span-2 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
             <AlertCircle className="w-32 h-32" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4 flex items-center gap-2 relative z-10">
             <AlertCircle className="w-4 h-4 text-rose-500" />
             Core Kinetic Risk Vector
           </p>
           <p className="text-4xl md:text-5xl font-display font-black text-white print:text-slate-900 relative z-10 tracking-tight leading-tight">
             {data.coreKineticRiskVector}
           </p>
        </div>
      </motion.div>

      {/* Strategic Summary & Temporal Shift */}
      <motion.div variants={item} className="py-10 border-b border-white/10 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div>
             <h3 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
               <FileText className="w-5 h-5 text-gic-gold" /> AI Grounded Synthesis
             </h3>
             <div className="text-slate-300 leading-relaxed space-y-4 font-inter text-lg max-w-4xl print:text-slate-800 whitespace-pre-wrap">
               {data.strategicSummary}
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
             <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl" />
               <h4 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                 <Activity className="w-4 h-4" /> Current Vector (Last 30 Days)
               </h4>
               <p className="text-sm leading-relaxed text-slate-300 font-inter relative z-10">
                 {data.temporalAnalysis?.last30DaysActivity || "Insufficient recent temporal data to build 30-day contrast."}
               </p>
             </div>
             <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 blur-3xl" />
               <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                 <BookOpen className="w-4 h-4" /> Historic Drag (30+ Days)
               </h4>
               <p className="text-sm leading-relaxed text-slate-400 font-inter relative z-10">
                 {data.temporalAnalysis?.historicIssues || "Insufficient historical telemetry for legacy baseline mapping."}
               </p>
             </div>
           </div>
        </div>

        {/* Score Calculation Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 h-fit">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 border-b border-slate-800 pb-4">
             Metric Formulation Matrix
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed font-inter mb-4">
             <strong className="text-white block mb-2">Net Trust & PR Pressure Breakdown:</strong>
             {data.scoreCalculationBreakdown || "Score matrix generated via NLP semantic grouping and volume metrics over standard source polling."}
          </p>
          <div className="mt-6 pt-6 border-t border-slate-800 text-xs font-medium text-slate-500 tracking-wide leading-relaxed">
             This computational scoring model maps source sentiment intensity against aggregated citation velocity to normalize dynamic volatility.
          </div>
        </div>
      </motion.div>

      {/* Grid: Developments & Sources */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-10 relative z-10">
        {/* Recent Developments */}
        <div>
          <h3 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-wider">Top Tier Developments</h3>
          <div className="space-y-4">
            {data.recentDevelopments.map((dev, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h4 className="font-bold text-white text-lg">{dev.headline}</h4>
                  <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                    dev.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                    dev.sentiment === 'negative' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {dev.sentiment}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-inter">{dev.impact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure PR Opportunities */}
        <div className="lg:col-span-2 pt-6">
          <h3 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gic-gold" />
            Strategic PR Opportunities (Infrastructure Focus)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.infrastructureOpportunities.map((opp, idx) => (
              <div key={idx} className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full" />
                <div className="flex justify-between items-start gap-2 mb-4 relative z-10">
                  <h4 className="font-bold text-emerald-400 text-lg leading-tight">{opp.projectFocus}</h4>
                  <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-full shrink-0 ${
                    opp.urgency === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                    opp.urgency === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {opp.urgency}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-inter relative z-10">
                  <strong className="text-white">PR Benefit:</strong> {opp.prBenefit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Source Web */}
        <div className="lg:col-span-2 pt-6">
          <h3 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gic-gold" />
            Extracted Intelligence Media Sources
          </h3>
          <div className="space-y-3">
            {data.mediaLinks.map((link, i) => (
              <a 
                key={i} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer"
                className="block group bg-slate-900/20 hover:bg-slate-800/50 border border-slate-800/50 hover:border-slate-700 rounded-xl p-4 transition-all"
              >
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gic-gold mb-1">
                      {link.source}
                    </p>
                    <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                      {link.title}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
