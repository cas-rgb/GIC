"use client";

import { motion } from 'framer-motion';

export default function ReliabilityGauge({ data }: { data: any }) {
    const score = data.osint_density || 85;

    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-5 h-full flex flex-col items-center justify-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 w-full text-left">Data Confidence Gauge</span>
            <div className="relative w-32 h-24 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
                    <motion.path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#0a84ff"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="125.66"
                        initial={{ strokeDashoffset: 125.66 }}
                        animate={{ strokeDashoffset: 125.66 - (score / 100) * 125.66 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute bottom-0 flex flex-col items-center">
                    <span className="text-2xl font-display font-black text-slate-900">{Math.round(score)}%</span>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Reliability Index</span>
                </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 w-full">
                <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-500">
                    <span>Benchmark Alignment</span>
                    <span className="text-slate-900">{Math.round(data.benchmark_alignment)}%</span>
                </div>
                <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-500">
                    <span>GroundTruth Volume</span>
                    <span className="text-slate-900">{data.groundTruth_hits} HITS</span>
                </div>
            </div>
        </div>
    );
}
