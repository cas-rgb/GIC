"use client";

import { motion } from "framer-motion";
import { LeadershipSentimentLeaderRow } from "@/lib/analytics/types";
import { ShieldCheck, Activity, Users, AlertCircle, TrendingUp, TrendingDown, ExternalLink, FileText, BrainCircuit, MessageSquareQuote } from "lucide-react";
import { normalizeInfrastructureServiceFilter } from "@/lib/analytics/issue-taxonomy";
import { useRouter } from "next/navigation";
import ExportToPDFFooter from "../ui/ExportToPDFFooter";

interface ExecutiveDossierInlineProps {
  leader: LeadershipSentimentLeaderRow | null;
  days: number;
  province: string;
}

export default function ExecutiveDossierInline({ leader, days, province }: ExecutiveDossierInlineProps) {
  const router = useRouter();

  if (!leader) return null;

  const score = Math.round(leader.sentimentScore * 100);
  const isPositive = score >= 0;
  const totalMentions = leader.linkedIssueBreakdown.reduce((acc, val) => acc + val.mentionCount, 0);
  const dominantIssue = leader.linkedIssueBreakdown[0]?.topic || 'general governance';

  function handleIssueClick(topic: string) {
    const domain = normalizeInfrastructureServiceFilter(topic) || "all";
    router.push(`/executive/social-trends?province=${encodeURIComponent(province)}&serviceDomain=${domain}&days=${days}`);
  }

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
                 <Users className="w-6 h-6 text-gic-gold" />
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-white print:text-slate-900">{leader.leaderName}</h2>
           </div>
           <div className="flex items-center gap-4 pl-18">
             <span className="text-xs font-black uppercase tracking-[0.3em] text-gic-gold px-3 py-1 bg-gic-gold/10 border border-gic-gold/20 rounded-full">
               {leader.office}
             </span>
             <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
               {province} Region
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
             <MessageSquareQuote className="w-4 h-4 text-slate-500" />
             PR Pressure Volume
           </p>
           <p className="text-6xl font-display font-black tracking-tight text-white print:text-slate-900">{totalMentions}</p>
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
             {dominantIssue}
           </p>
        </div>
      </motion.div>

      {/* AI Capabilities Briefing (Intense Layout) */}
      <motion.div variants={item} className="py-10 relative z-10 border-b border-white/10">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
             <BrainCircuit className="w-6 h-6 text-blue-400" />
           </div>
           <div>
             <h3 className="text-xl font-display font-black text-white print:text-slate-900">Generative Intelligence Synthesis</h3>
             <p className="text-xs text-slate-400 print:text-slate-500 font-medium">Mapped PR narrative drivers and operational vectors.</p>
           </div>
        </div>
        
        {leader.aiSynthesis && leader.aiSynthesis.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
               <span className="absolute -top-3 left-4 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">Who is Involved</span>
               <p className="text-sm font-medium text-slate-300 print:text-slate-700 leading-relaxed mt-2">{leader.aiSynthesis[0].whoInvolved}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
               <span className="absolute -top-3 left-4 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">What Happened</span>
               <p className="text-sm font-medium text-slate-300 print:text-slate-700 leading-relaxed mt-2">{leader.aiSynthesis[0].whatHappened}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
               <span className="absolute -top-3 left-4 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">Why It Triggered</span>
               <p className="text-sm font-medium text-slate-300 print:text-slate-700 leading-relaxed mt-2">{leader.aiSynthesis[0].whyItHappened}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
               <span className="absolute -top-3 left-4 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">Temporal Map</span>
               <p className="text-sm font-medium text-slate-300 print:text-slate-700 leading-relaxed mt-2">{leader.aiSynthesis[0].whenTimeline}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
               <span className="absolute -top-3 left-4 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">Current Status</span>
               <p className="text-sm font-medium text-slate-300 print:text-slate-700 leading-relaxed mt-2">{leader.aiSynthesis[0].howResolvedOrCurrent}</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl border-l-4 border-l-blue-500">
            <p className="text-lg font-medium text-slate-300 print:text-slate-700 leading-relaxed">
              "{leader.leaderName}'s current public perception footprint is largely defined by <span className="text-blue-400">{dominantIssue.toLowerCase()}</span> within {province}. The net sentiment remains <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>{isPositive ? 'resilient despite local crises' : 'under extreme pressure'}</span> based on {totalMentions} explicit narrative mentions. Any strategic decisions impacting this service block will disproportionately affect this leader's public standing."
            </p>
          </div>
        )}
      </motion.div>

      {/* Linked Issue Breakdown */}
      <motion.div variants={item} className="pt-10 relative z-10">
         <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-gic-gold/10 border border-gic-gold/20 rounded-lg">
             <Activity className="w-6 h-6 text-gic-gold" />
           </div>
           <div>
             <h3 className="text-xl font-display font-black text-white print:text-slate-900">Issue Isolation Array</h3>
             <p className="text-xs text-slate-400 print:text-slate-500 font-medium">Click on any narrative vector to investigate the physical service footprints.</p>
           </div>
         </div>
         <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mt-8">
             {leader.linkedIssueBreakdown.length > 0 ? (
               <div className="divide-y divide-slate-800/60">
                 {leader.linkedIssueBreakdown.map((issue, idx) => (
                   <button 
                      key={idx} 
                      onClick={() => handleIssueClick(issue.topic)}
                      className="w-full flex items-center justify-between p-6 md:px-8 hover:bg-slate-800/80 transition-all text-left group"
                    >
                      <div>
                        <p className="font-bold text-white print:text-slate-900 text-lg flex items-center gap-3">
                          {issue.topic}
                          <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-gic-gold transition-colors" />
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <span className="hidden md:inline-flex bg-slate-950 border border-slate-800 text-slate-400 print:text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest group-hover:bg-gic-gold/10 group-hover:border-gic-gold/30 group-hover:text-gic-gold transition-colors">
                            {issue.mentionCount > 50 ? "High Intensity" : "Active Tracking"}
                        </span>
                        <div className="text-right min-w-[3rem]">
                          <span className="font-black text-white print:text-slate-900 text-3xl group-hover:text-gic-gold transition-colors">
                            {issue.mentionCount}
                          </span>
                        </div>
                      </div>
                   </button>
                 ))}
               </div>
             ) : (
               <div className="p-12 text-center text-slate-500 text-sm font-medium">
                 No distinct operational topics have been directly linked to this leader in this time frame.
               </div>
             )}
         </div>
         <div className="mt-8 flex justify-end opacity-50">
             <ExportToPDFFooter confidenceRating="VERIFIED" />
         </div>
      </motion.div>

    </motion.div>
  );
}
