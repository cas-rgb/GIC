"use client";

import { motion } from 'framer-motion';

export default function SignalPulse({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="p-5 text-[8px] font-black text-slate-300 uppercase">No Pulse Data</div>;
    const maxVal = Math.max(...data.map(d => d.volume)) || 1;

    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-5 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Signal Pulse (Volume)</span>
                <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-gic-blue animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-gic-blue/50" />
                </div>
            </div>
            <div className="flex-1 flex items-end gap-1.5 px-1">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(d.volume / maxVal) * 100}%` }}
                            transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                            className="w-full bg-slate-900 rounded-lg group-hover:bg-gic-blue transition-colors relative"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded font-black">
                                {d.volume}
                            </div>
                        </motion.div>
                        <span className="text-[7px] font-black text-slate-300 uppercase truncate w-full text-center">{d.day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
