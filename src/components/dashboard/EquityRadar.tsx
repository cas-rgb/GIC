"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface EquityRadarProps {
    data?: {
        water: number;
        roads: number;
        electricity: number;
        housing: number;
        sanitation: number;
    };
}

export default function EquityRadar({
    data = {
        water: 85,
        roads: 45,
        electricity: 72,
        housing: 60,
        sanitation: 88
    }
}: EquityRadarProps) {
    const sectors = Object.keys(data) as Array<keyof typeof data>;
    const maxValue = 100;
    
    // Calculate points for the radar polygon
    const points = sectors.map((sector, i) => {
        const value = data[sector];
        const angle = (Math.PI * 2 * i) / sectors.length - Math.PI / 2;
        const x = 50 + (value / maxValue) * 40 * Math.cos(angle);
        const y = 50 + (value / maxValue) * 40 * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="p-8 bg-white border border-slate-200 rounded-[3rem] h-full flex flex-col items-center">
            <div className="w-full mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Equity Benchmarking</p>
                <h3 className="text-2xl font-display font-black text-slate-900 leading-tight">Delivery Radar</h3>
            </div>

            <div className="relative w-64 h-64 mb-8">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                    {/* Background Grids */}
                    {[20, 40, 60, 80, 100].map((step) => (
                        <circle key={step} cx="50" cy="50" r={step * 0.4} fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
                    ))}
                    
                    {/* Axis Lines */}
                    {sectors.map((_, i) => {
                        const angle = (Math.PI * 2 * i) / sectors.length - Math.PI / 2;
                        return (
                            <line 
                                key={i} 
                                x1="50" y1="50" 
                                x2={50 + 40 * Math.cos(angle)} 
                                y2={50 + 40 * Math.sin(angle)} 
                                stroke="#f1f5f9" strokeWidth="0.5" 
                            />
                        );
                    })}

                    {/* Data Polygon */}
                    <motion.polygon
                        points={points}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.2, scale: 1 }}
                        transition={{ duration: 1.5, ease: "backOut" }}
                        fill="#3b82f6"
                    />
                    <motion.polygon
                        points={points}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "backOut" }}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                    />

                    {/* Labels */}
                    {sectors.map((sector, i) => {
                        const angle = (Math.PI * 2 * i) / sectors.length - Math.PI / 2;
                        const x = 50 + 48 * Math.cos(angle);
                        const y = 50 + 48 * Math.sin(angle);
                        return (
                            <text 
                                key={i} 
                                x={x} y={y} 
                                className="text-[3px] font-black uppercase tracking-widest text-slate-400" 
                                textAnchor="middle"
                            >
                                {sector}
                            </text>
                        );
                    })}
                </svg>
            </div>

            <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Target Balance</span>
                    <span className="text-gic-blue">Optimal</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-200" style={{ width: '85%' }} />
                </div>
                <p className="text-[9px] font-medium text-slate-500 italic text-center">
                    Radar indicates "Roads" as the primary blocker to regional equity.
                </p>
            </div>
        </div>
    );
}
