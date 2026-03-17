"use client";

import { motion } from 'framer-motion';
import { Network, ArrowRight } from 'lucide-react';

export default function DependencyLinks({ data }: { data: any[] }) {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-5 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <Network className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inter-Sector Dependencies</span>
            </div>
            <div className="flex-1 flex flex-col gap-3">
                {data.map((item, i) => (
                    <div key={i} className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl flex items-center justify-between group">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-slate-900 uppercase">Impacts {item.affects}</span>
                                <span className="text-[8px] font-bold text-indigo-500 bg-white px-1.5 py-0.5 rounded border border-indigo-100">{Math.round(item.coefficient * 100)}%</span>
                            </div>
                            <span className="text-[8px] text-slate-500 font-medium leading-tight">{item.reason}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-indigo-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </div>
                ))}
            </div>
        </div>
    );
}
