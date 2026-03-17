"use client";

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function PredictiveGrowth({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="p-5 text-[8px] font-black text-white/30 uppercase italic">No Forecast Data Sync</div>;
    const maxVal = Math.max(...data.map(d => d.growth)) || 1;

    return (
        <div className="bg-slate-900 rounded-3xl border border-white/5 p-5 h-full flex flex-col text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-12 h-12" />
            </div>
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-6 relative z-10">Predictive Growth Forecast</span>
            <div className="flex-1 flex items-end gap-3 px-2 mb-2 relative z-10">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(d.growth / maxVal) * 100}%` }}
                            transition={{ delay: i * 0.2 }}
                            className="w-full bg-gic-blue/50 rounded-t-xl group-hover:bg-gic-blue transition-colors border-x border-t border-white/10"
                        />
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{d.period}</span>
                        <span className="text-[10px] font-black text-gic-blue">+{Math.round(d.growth)}%</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-[7px] font-black text-white/20 uppercase tracking-widest">
                ML Projection (Alpha Blueprint Matching)
            </div>
        </div>
    );
}
