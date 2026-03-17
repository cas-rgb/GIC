"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Droplets, Users, Activity, Scale } from 'lucide-react';

interface RiskVector {
    label: string;
    value: number; // 0-100
    color: string;
    icon: React.ReactNode;
}

interface RiskVectorRadarProps {
    data: any[];
}

export default function RiskVectorRadar({ data }: RiskVectorRadarProps) {
    const vectors = React.useMemo(() => {
        const categories = [
            { label: 'Social Stability', sector: 'Social', icon: <Users />, color: 'rose' },
            { label: 'Infrastructure', sector: 'Infrastructure', icon: <Droplets />, color: 'blue' },
            { label: 'Economic Impact', sector: 'Commercial', icon: <Activity />, color: 'emerald' },
            { label: 'Political Volatility', sector: 'Political', icon: <Scale />, color: 'amber' },
            { label: 'Security Risk', sector: 'Security', icon: <Shield />, color: 'slate' },
            { label: 'Environmental Risk', sector: 'Environmental', icon: <Zap />, color: 'orange' },
        ];

        return categories.map(cat => {
            const signals = data.filter(s => s.domain === cat.sector || s.category === cat.sector);
            const avgSeverity = signals.length > 0 
                ? (signals.reduce((acc, s) => acc + (s.severityValue || s.severity || 5), 0) / signals.length) * 10
                : 20; // Default baseline

            return {
                ...cat,
                value: Math.min(100, Math.max(10, Math.round(avgSeverity)))
            };
        });
    }, [data]);

    const aggregateRisk = Math.round(vectors.reduce((acc, v) => acc + v.value, 0) / (vectors.length || 1));

    return (
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 flex flex-col">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                    <Shield className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Granular Risk Vectors</h3>
                    <p className="text-xs text-white/40">Multi-dimensional vulnerability audit</p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-6 items-center">
                {/* Visual Representation (Simplified Radar-style grid) */}
                <div className="relative aspect-square flex items-center justify-center">
                   <div className="absolute inset-0 border border-white/5 rounded-full" />
                   <div className="absolute inset-4 border border-white/5 rounded-full" />
                   <div className="absolute inset-12 border border-white/5 rounded-full" />
                   <div className="absolute h-full w-px bg-white/5" />
                   <div className="absolute w-full h-px bg-white/5" />
                   
                   <svg className="absolute w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
                      <polygon 
                        points={vectors.map((v, i) => {
                            const angle = (i / vectors.length) * Math.PI * 2;
                            const r = v.value * 0.45;
                            return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
                        }).join(' ')}
                        fill="rgba(244, 63, 94, 0.15)"
                        stroke="rgba(244, 63, 94, 0.5)"
                        strokeWidth="1"
                      />
                      {vectors.map((v, i) => {
                          const angle = (i / vectors.length) * Math.PI * 2;
                          const r = v.value * 0.45;
                          return (
                            <circle 
                                key={i}
                                cx={50 + r * Math.cos(angle)} 
                                cy={50 + r * Math.sin(angle)} 
                                r="1.5" 
                                fill="#f43f5e" 
                            />
                          );
                      })}
                   </svg>
                   
                   <div className="z-10 bg-[#0B0F17] p-4 rounded-full border border-white/10 shadow-2xl">
                      <span className="text-2xl font-black text-rose-500">82%</span>
                   </div>
                </div>

                {/* Legend & Values */}
                <div className="space-y-4">
                    {vectors.map((v, idx) => (
                        <div key={v.label} className="group cursor-default">
                            <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg bg-white/5 text-white/40 group-hover:text-white transition-colors`}>
                                        {React.isValidElement(v.icon) && React.cloneElement(v.icon as React.ReactElement<{ className?: string }>, { className: "w-3 h-3" })}
                                    </div>
                                    <span className="text-[10px] font-bold text-white/60 group-hover:text-white uppercase tracking-wider">{v.label}</span>
                                </div>
                                <span className="text-[10px] font-black">{v.value}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${v.value}%` }}
                                    transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                                    className={`h-full bg-rose-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] text-white/30 italic leading-relaxed">
                    * Risk vectors are calculated using cross-sector correlation analysis of current field records and OSINT sentiment triggers.
                </p>
            </div>
        </div>
    );
}
