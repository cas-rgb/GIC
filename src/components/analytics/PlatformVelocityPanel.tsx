"use client";

import { motion } from "framer-motion";
import { TrendingUp, Activity, MessageSquare, Flame } from "lucide-react";

export default function PlatformVelocityPanel({ trends }: { trends: any[] }) {
  if (!trends || trends.length === 0) return null;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-6 h-6 text-emerald-500" />
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Cross-Platform Velocity</h3>
          <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Multi-Network Narrative Traction</p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {trends.map((item, idx) => {
          const isBearish = item.sentiment === "Bearish";
          const isBullish = item.sentiment === "Bullish";
          
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

              <div className="flex items-center gap-6">
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
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
