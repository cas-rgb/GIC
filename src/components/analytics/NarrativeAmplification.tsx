"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, MessageSquare, Award } from "lucide-react";

interface NarrativeDriver {
  voice: string;
  impact: number;
  reach: string;
  citations: number;
  leadershipScore: number;
  keyNarrative: string;
}

export default function NarrativeAmplification({
  drivers,
}: {
  drivers: NarrativeDriver[];
}) {
  if (!drivers || drivers.length === 0) {
    return (
      <div className="bg-slate-900 rounded-[3rem] p-10 h-full flex items-center justify-center border-4 border-slate-800">
        <span className="text-slate-500 font-display font-black uppercase tracking-widest animate-pulse">
          Analyzing Narrative Drivers...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-[3rem] p-10 h-full overflow-hidden border-4 border-slate-800 shadow-2xl relative">
      <div className="absolute top-0 right-0 p-10 opacity-10">
        <Users className="w-40 h-40 text-gic-blue" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-black text-white tracking-tighter uppercase mb-1 underline decoration-gic-blue decoration-4 underline-offset-8">
              Public Sentiment Analysis
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Cross-Channel Impact Analysis
            </p>
          </div>
          <div className="bg-gic-blue/10 px-4 py-2 rounded-full border border-gic-blue/20">
            <span className="text-gic-blue text-[10px] font-black uppercase tracking-widest">
              Data Verified
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-4 scrollbar-hide">
          {drivers.map((driver, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800/50 hover:bg-slate-800 p-6 rounded-2xl border border-slate-700/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-display font-black text-white mb-1">
                    {driver.voice}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-gic-blue uppercase tracking-widest">
                      {driver.reach}
                    </span>
                    <div className="flex items-center gap-1 text-slate-500">
                      <MessageSquare className="w-3 h-3" />
                      <span className="text-[9px] font-black">
                        {driver.citations} Citations
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-display font-black text-white leading-none">
                    {driver.impact}%
                  </div>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                    Impact
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-400 font-medium italic mb-4 leading-relaxed group-hover:text-slate-300 transition-colors">
                "{driver.keyNarrative}"
              </p>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">
                  <span>Leadership Score</span>
                  <span className="text-gic-blue">
                    {driver.leadershipScore}%
                  </span>
                </div>
                <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${driver.leadershipScore}%` }}
                    className="h-full bg-gic-blue shadow-[0_0_10px_rgba(4,198,255,0.5)]"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
