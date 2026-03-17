"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPI {
    label: string;
    value: string;
    trend?: string;
    trajectory?: "up" | "down" | "neutral";
    color?: "blue" | "gold" | "slate" | "rose" | "emerald";
}

export default function KPIRibbon({ kpis }: { kpis: KPI[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {kpis.map((kpi, i) => {
                const accentClass = 
                    kpi.color === 'blue' ? 'gic-card-blue' : 
                    kpi.color === 'gold' ? 'gic-card-gold' : 
                    kpi.color === 'rose' ? 'border-rose-100 bg-rose-50/10' :
                    kpi.color === 'emerald' ? 'border-emerald-100 bg-emerald-50/10' :
                    'gic-card';
                
                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className={`${accentClass} group relative flex flex-col justify-between h-44`}
                    >
                        {/* Status Glow */}
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-[45px] opacity-10 group-hover:opacity-20 transition-opacity ${
                            kpi.color === 'blue' ? 'bg-gic-blue' : 
                            kpi.color === 'gold' ? 'bg-gic-gold' : 
                            kpi.color === 'rose' ? 'bg-rose-500' :
                            kpi.color === 'emerald' ? 'bg-emerald-500' :
                            'bg-slate-400'
                        }`} />
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-auto">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{kpi.label}</span>
                                {kpi.trend && (
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                        kpi.trajectory === 'up' ? 'text-emerald-500' :
                                        kpi.trajectory === 'down' ? 'text-rose-500' :
                                        'text-slate-400'
                                    }`}>
                                        {kpi.trajectory === 'up' ? <TrendingUp className="w-3 h-3" /> :
                                         kpi.trajectory === 'down' ? <TrendingDown className="w-3 h-3" /> :
                                         <Minus className="w-3 h-3" />}
                                        {kpi.trend}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-end justify-between mt-auto">
                                <h4 className="text-4xl font-display font-bold text-slate-900 tracking-tight">{kpi.value}</h4>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
