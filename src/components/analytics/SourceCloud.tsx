"use client";

import { motion } from 'framer-motion';
import { Twitter, Facebook, Linkedin, Globe, Instagram, MessageSquare } from 'lucide-react';

const ICON_MAP: any = {
    x: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    news: Globe,
    instagram: Instagram,
    threads: MessageSquare
};

const COLOR_MAP: any = {
    x: 'bg-slate-900',
    facebook: 'bg-blue-600',
    linkedin: 'bg-blue-700',
    news: 'bg-emerald-600',
    instagram: 'bg-pink-600',
    threads: 'bg-slate-800'
};

export default function SourceCloud({ data }: { data: any }) {
    const total = Object.values(data).reduce((a: any, b: any) => a + b, 0) as number;
    const sources = Object.keys(data);

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 h-full flex flex-col shadow-gic-professional overflow-hidden relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-display font-black text-slate-900 tracking-tight uppercase">Source Volume</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cross-Platform Distribution</p>
                </div>
                <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-lg font-display font-black text-slate-900">{total}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Total Points</span>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                {sources.map((source, i) => {
                    const Icon = ICON_MAP[source] || Globe;
                    const value = data[source];
                    const percent = Math.round((value / total) * 100);

                    return (
                        <motion.div
                            key={source}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col justify-between group hover:border-gic-blue transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-xl text-white ${COLOR_MAP[source] || 'bg-slate-400'} shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black text-slate-900">{percent}%</span>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{source}</h4>
                                <div className="text-lg font-display font-black text-slate-900">{value}</div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="absolute bottom-0 right-0 p-8 opacity-5 pointer-events-none">
                <Globe className="w-32 h-32 rotate-12" />
            </div>
        </div>
    );
}
