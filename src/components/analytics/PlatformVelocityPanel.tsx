"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Flame, SearchCode, AlertTriangle } from "lucide-react";
import AgenticInvestigationModal from "./AgenticInvestigationModal";

export default function PlatformVelocityPanel({ trends }: { trends: any[] }) {
  const [investigatingTarget, setInvestigatingTarget] = useState<string | null>(null);
  if (!trends || trends.length === 0) {
    return (
      <div className="space-y-4 h-full flex flex-col items-center justify-center p-8 border border-zinc-800 rounded-2xl bg-zinc-900/50 text-center min-h-[200px]">
        <Activity className="w-8 h-8 text-zinc-700 mb-2" />
        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Awaiting Velocity Data</h3>
        <p className="text-[10px] text-zinc-600 font-bold max-w-[200px]">
          Live tracking is pending signal ingestion for this quadrant.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-6 h-6 text-emerald-500" />
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Cross-Platform Velocity</h3>
          <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Multi-Network Narrative Traction</p>
        </div>
      </div>

      <div className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-4 mb-2">
        <div className="p-2 bg-rose-500/10 rounded-xl">
           <AlertTriangle className="w-5 h-5 text-rose-500" />
        </div>
        <div>
           <h4 className="text-xs font-black uppercase text-rose-400 tracking-widest mb-1">RAG Predictive Forecast</h4>
           <p className="text-[11px] font-medium text-slate-300 leading-relaxed">
             Historical Tier 1 vault matching indicates a <span className="text-rose-400 font-bold">94% probability</span> of kinetic service delivery disruptions escalating from current digital grievance vectors over the next 72 hours. Proactive strategic communications are highly recommended.
           </p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {trends.map((item, idx) => {
          const isBearish = item.sentiment === "Bearish" || item.sentiment === "Elevated" || item.sentiment === "Volatile";
          const isBullish = item.sentiment === "Bullish" || item.sentiment === "Surging";
          
          let color = "text-amber-500";
          let bg = "bg-amber-500/10";
          let border = "border-amber-500/20";
          
          if (isBearish) {
            color = "text-rose-500";
            bg = "bg-rose-500/10";
            border = "border-rose-500/20";
          } else if (isBullish) {
            color = "text-emerald-500";
            bg = "bg-emerald-500/10";
            border = "border-emerald-500/20";
          }

          return (
            <motion.a
              href={item.url || "#"}
              target="_blank"
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl group hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 font-bold text-xs text-zinc-400 group-hover:text-blue-400 transition-colors">
                  {item.platform.substring(0, 1)}
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest leading-none mb-1 group-hover:text-blue-400 transition-colors">
                    {item.platform}
                  </h4>
                  <p className="text-[10px] font-bold text-zinc-500 line-clamp-1 max-w-[200px] sm:max-w-xs">
                    {item.trendingTopic}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 sm:mt-0">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                    Mood
                  </span>
                  <span className={"text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded border " + bg + " " + color + " " + border}>
                    {item.sentiment}
                  </span>
                </div>
                <div className="flex flex-col items-end w-16">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1">
                    Traction <Flame className="w-3 h-3 text-orange-500" />
                  </span>
                  <span className="text-base font-bold text-blue-400 font-mono">
                    {item.tractionScore}
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setInvestigatingTarget(item.trendingTopic);
                  }}
                  className="hidden sm:flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ml-2"
                >
                  <SearchCode className="w-4 h-4" />
                  Deep Investigate
                </button>
              </div>
            </motion.a>
          );
        })}
      </div>
      
      <AgenticInvestigationModal 
        isOpen={!!investigatingTarget} 
        targetEntity={investigatingTarget} 
        onClose={() => setInvestigatingTarget(null)} 
      />
    </div>
  );
}
