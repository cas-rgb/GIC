"use client";

import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function WordTree({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="p-8 text-slate-300 font-black uppercase text-[10px]">No Semantic Signals</div>;

    const sorted = [...data].sort((a, b) => b.count - a.count);
    const maxCount = Math.max(...data.map(d => d.count)) || 1;

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-10 h-full flex flex-col shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Target className="w-48 h-48 text-white" />
            </div>

            <div className="relative z-10 mb-8">
                <h3 className="text-xl font-display font-black text-white tracking-tight uppercase">Visual Word Tree</h3>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Semantic Grievance Mapping</p>
            </div>

            <div className="flex-1 flex flex-wrap gap-4 items-center justify-center content-center relative z-10">
                {sorted.map((item, i) => {
                    const scale = 0.8 + (item.count / maxCount) * 1.5;
                    const opacity = 0.4 + (item.count / maxCount) * 0.6;

                    return (
                        <motion.div
                            key={item.word}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: opacity, scale: scale }}
                            transition={{ delay: i * 0.05 }}
                            className="text-white font-display font-black tracking-tighter uppercase whitespace-nowrap cursor-pointer hover:text-gic-blue hover:opacity-100 transition-all px-2"
                            style={{ fontSize: `${scale * 12}px` }}
                        >
                            {item.word}
                            <span className="ml-1 text-[8px] opacity-30 font-sans tracking-normal bg-white/10 px-1 rounded">{item.count}</span>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-8 flex items-center gap-2 border-t border-white/5 pt-6 text-[8px] font-black text-white/40 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-gic-blue" />
                <span>Anchored in OSINT Common-Vector Logic</span>
            </div>
        </div>
    );
}
