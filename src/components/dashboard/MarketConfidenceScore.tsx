"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Briefcase, Zap } from 'lucide-react';

interface MarketConfidenceScoreProps {
    score?: number;
    trend?: string;
    sectors?: Array<{ name: string; conf: number }>;
}

export default function MarketConfidenceScore({
    score = 82,
    trend = "+2.4%",
    sectors = [
        { name: "Logistics", conf: 88 },
        { name: "Energy", conf: 64 },
        { name: "Manufacturing", conf: 75 }
    ]
}: MarketConfidenceScoreProps) {
    return (
        <div className="p-10 bg-slate-900 border border-white/10 rounded-[3rem] h-full flex flex-col relative overflow-hidden text-white">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gic-blue/10 blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gic-gold/5 blur-[100px] -ml-32 -mb-32" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Economic Intelligence</p>
                        <h3 className="text-3xl font-display font-black">Market Confidence</h3>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 mb-2">
                            <Zap className="w-5 h-5 text-gic-gold" />
                        </div>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{trend} Surge</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-7xl font-display font-black tracking-tighter">{score}</span>
                            <span className="text-xl font-black text-slate-500">/100</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Executive Benchmark</p>
                        
                        <div className="space-y-6">
                            {sectors.map((s, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <span>{s.name}</span>
                                        <span>{s.conf}%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${s.conf}%` }}
                                            className="h-full bg-white/40 group-hover:bg-white transition-colors"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <Award className="w-4 h-4 text-gic-gold" />
                                <span className="text-[10px] font-black text-gic-gold uppercase tracking-widest">Sector Peak</span>
                            </div>
                            <p className="text-sm font-bold leading-relaxed">
                                Logistics Hub confidence is at a 5-year high due to corridor upgrades.
                            </p>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <Briefcase className="w-4 h-4 text-gic-blue" />
                                <span className="text-[10px] font-black text-gic-blue uppercase tracking-widest">FDI Readiness</span>
                            </div>
                            <p className="text-sm font-bold leading-relaxed">
                                PPP pipeline in Energy sector showing R4.2B in potential commitments.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
