"use client";

import { motion } from 'framer-motion';

export default function SentimentVelocity({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="p-5 text-[8px] font-black text-slate-300 uppercase">No Trend Data</div>;
    const maxVal = Math.max(...data.map(d => d.score)) || 1;
    const minVal = Math.min(...data.map(d => d.score));
    const range = maxVal - minVal;

    // SVG Polyline points
    const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d.score - minVal) / (range || 1)) * 100}`).join(' ');

    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-5 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sentiment Velocity</span>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Stable Trend</span>
            </div>
            <div className="flex-1 relative mt-4">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <motion.polyline
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        points={points}
                        className="text-slate-900 group-hover:text-gic-blue transition-colors"
                    />
                    {data.map((d, i) => (
                        <circle
                            key={i}
                            cx={(i / (data.length - 1)) * 100}
                            cy={100 - ((d.score - minVal) / (range || 1)) * 100}
                            r="1.5"
                            className="fill-slate-900"
                        />
                    ))}
                </svg>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter">7D Sector Pulse</span>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-black text-slate-900 uppercase">{data[data.length - 1].score}% Positive</span>
                </div>
            </div>
        </div>
    );
}
