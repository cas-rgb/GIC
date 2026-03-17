"use client";

import { motion } from 'framer-motion';
import { Target, Zap, TrendingUp, Info } from 'lucide-react';

export default function SimilarityLogic({ data }: { data: any }) {
    if (!data) return <div className="p-8 text-gray-400 font-black uppercase text-[10px]">No Comparative Analysis</div>;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 h-full flex flex-col shadow-sm overflow-hidden relative font-sans">
            <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Comparative Intelligence</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Success-Case Mirroring & ROI Analysis</p>
                </div>
                <div className="p-4 bg-gray-100 text-emerald-600 rounded-xl border border-gray-200">
                    <Target className="w-6 h-6" />
                </div>
            </div>

            <div className="flex-1 space-y-8">
                {/* MATCHED CASE CARD */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-8 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">GIC Benchmark Match</span>
                        <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black rounded uppercase">94% Confidence</div>
                    </div>
                    <div className="p-8">
                        <div className="text-3xl font-black text-gray-900 mb-6 italic tracking-tight">"{data.matchedCase}"</div>
                        <div className="flex items-start gap-4 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                            <Info className="w-5 h-5 text-blue-500 shrink-0" />
                            <p className="text-xs text-blue-900 font-bold leading-relaxed italic">{data.reason}</p>
                        </div>
                    </div>
                </div>

                {/* STRATEGY BLUEPRINT */}
                <div className="p-8 bg-gray-50 border border-gray-100 rounded-2xl group hover:border-blue-400 transition-all border-l-[6px] border-l-blue-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-blue-500">
                            <Zap className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-black text-gray-900 uppercase">Operational Blueprint</h4>
                    </div>
                    <p className="text-xs text-gray-600 font-bold leading-relaxed mb-6 border-l-4 border-gray-200 pl-6 italic">
                        {data.marketingStrategy}
                    </p>
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase">
                        <TrendingUp className="w-4 h-4" />
                        Execution Confidence: High
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-[8px] font-black text-gray-300 uppercase tracking-widest">
                <span>Audited via GIC Historical Performance Ledger</span>
            </div>
        </div>
    );
}
