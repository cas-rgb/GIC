"use client";

import { motion } from 'framer-motion';

export default function SectorGravity({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="p-5 text-[8px] font-black text-slate-300 uppercase">No Distribution Data</div>;
    const total = data.reduce((acc, d) => acc + d.value, 0) || 1;

    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-5 h-full flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Sector Distribution</span>
            <div className="flex-1 flex flex-col justify-center gap-3">
                {data.map((d, i) => (
                    <div key={i} className="space-y-1.5 flex flex-col group">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">{d.name}</span>
                            <span className="text-[8px] font-display font-black text-slate-400">{Math.round((d.value / total) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(d.value / total) * 100}%` }}
                                transition={{ delay: i * 0.1 }}
                                className="h-full bg-slate-900 group-hover:bg-gic-blue transition-colors"
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[7px] font-black text-slate-400 uppercase tracking-tighter">
                <span>Total Data Density</span>
                <span className="text-slate-900">{total} NODE BASE</span>
            </div>
        </div>
    );
}
