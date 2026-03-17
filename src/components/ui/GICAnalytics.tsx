"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface GICAnalyticsProps {
    type: 'wave' | 'pulse' | 'logic';
    data: number[];
    labels?: string[];
    color?: 'blue' | 'gold' | 'emerald' | 'rose';
    height?: number;
    className?: string;
}

export default function GICAnalytics({ type, data, labels, color = 'blue', height = 200, className = "" }: GICAnalyticsProps) {
    const colorClasses = {
        blue: { stroke: "#00d1ff", fill: "rgba(0, 209, 255, 0.1)", shadow: "0 0 20px rgba(0, 209, 255, 0.5)" },
        gold: { stroke: "#fbb600", fill: "rgba(251, 182, 0, 0.1)", shadow: "0 0 20px rgba(251, 182, 0, 0.5)" },
        emerald: { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.1)", shadow: "0 0 20px rgba(16, 185, 129, 0.5)" },
        rose: { stroke: "#f43f5e", fill: "rgba(244, 63, 94, 0.1)", shadow: "0 0 20px rgba(244, 63, 94, 0.5)" }
    };

    const activeColor = colorClasses[color];

    const generatePath = useMemo(() => {
        if (!data.length) return "";
        const width = 1000;
        const step = width / (data.length - 1);
        const max = Math.max(...data, 100);
        
        return data.reduce((path, val, i) => {
            const x = i * step;
            const y = height - (val / max) * height;
            return i === 0 ? `M ${x},${y}` : `${path} L ${x},${y}`;
        }, "");
    }, [data, height]);

    const renderVisual = () => {
        switch (type) {
            case 'wave':
                return (
                    <svg viewBox={`0 0 1000 ${height}`} className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={activeColor.stroke} stopOpacity="0.4" />
                                <stop offset="100%" stopColor={activeColor.stroke} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <motion.path
                            d={generatePath}
                            fill="none"
                            stroke={activeColor.stroke}
                            strokeWidth="3"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            style={{ filter: `drop-shadow(${activeColor.shadow})` }}
                        />
                        <motion.path
                            d={`${generatePath} L 1000,${height} L 0,${height} Z`}
                            fill={`url(#grad-${color})`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 2, delay: 0.5 }}
                        />
                        {data.map((val, i) => {
                            const width = 1000;
                            const step = width / (data.length - 1);
                            const max = Math.max(...data, 100);
                            const x = i * step;
                            const y = height - (val / max) * height;
                            
                            return (
                                <motion.circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="white"
                                    stroke={activeColor.stroke}
                                    strokeWidth="2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 1.5 + (i * 0.1) }}
                                >
                                    <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" begin={`${i * 0.2}s`} />
                                </motion.circle>
                            );
                        })}
                    </svg>
                );
            case 'pulse':
                return (
                    <div className="flex items-end justify-between h-full gap-2 px-2">
                        {data.map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group relative">
                                <motion.div 
                                    className="w-full rounded-t-lg relative overflow-hidden"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    transition={{ duration: 1, delay: i * 0.05 }}
                                    style={{ 
                                        background: `linear-gradient(to top, ${activeColor.stroke}, transparent)`,
                                        boxShadow: `0 0 15px ${activeColor.stroke}33`
                                    }}
                                >
                                    <motion.div 
                                        className="absolute top-0 left-0 w-full h-1 bg-white"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                    />
                                </motion.div>
                                {labels && labels[i] && (
                                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {labels[i]}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`gic-analytics-container relative ${className}`} style={{ height }}>
            {renderVisual()}
            <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" />
        </div>
    );
}
