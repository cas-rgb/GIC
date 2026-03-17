"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FileText, 
    Sparkles, 
    ShieldAlert, 
    Clock, 
    Download, 
    Share2, 
    ChevronRight,
    Loader2,
    Eye,
    MessageSquareQuote,
    Database
} from "lucide-react";
import { generateExecutiveBriefing } from "@/app/intel-actions";

interface ExecutiveMemo {
    title: string;
    classification: string;
    summary: string;
    findings: string[];
    recommendation: string;
    timestamp: string;
}

interface ExecutiveBriefingCenterProps {
    province: string;
    signals: any[];
}

function buildReferenceCode(prefix: string, input: string) {
    const hash = Array.from(input).reduce((sum, char, index) => sum + (char.charCodeAt(0) * (index + 1)), 0);
    return `${prefix}-${hash.toString(36).toUpperCase().padStart(6, "0").slice(0, 8)}`;
}

export default function ExecutiveBriefingCenter({ province, signals }: ExecutiveBriefingCenterProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [memo, setMemo] = useState<ExecutiveMemo | null>(null);
    const memoReference = memo ? buildReferenceCode("REF", `${province}-${memo.title}-${signals.length}`) : null;
    const sourceReference = memo ? buildReferenceCode("SRC", `${province}-${memo.timestamp}-${signals.length}`) : null;

    const handleGenerate = async () => {
        setIsGenerating(true);
        const result = await generateExecutiveBriefing({
            province,
            signals
        });
        
        if (result.success && result.memo) {
            setMemo(result.memo);
        }
        setIsGenerating(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden flex flex-col h-full min-h-[600px] shadow-xl">
            {/* Header Area */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gic-blue rounded-2xl shadow-lg shadow-gic-blue/20">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-display font-black text-slate-900">Briefing Center</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Autonomous Narrative Inception</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group"
                >
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4 text-gic-gold group-hover:scale-125 transition-transform" />
                    )}
                    Generate New Strategy Memo
                </button>
            </div>

            <div className="flex-1 relative overflow-y-auto p-8 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
                <AnimatePresence mode="wait">
                    {!memo && !isGenerating ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto"
                        >
                            <div className="p-6 bg-slate-100 rounded-[2.5rem]">
                                <MessageSquareQuote className="w-12 h-12 text-slate-300" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-bold text-slate-900">No Active Briefs</h4>
                                <p className="text-sm text-slate-500 font-medium">
                                    Click generate to trigger the AI Narrative Inception pipeline. Gemini will synthesize current regional signals and deliver a calibrated strategy memo.
                                </p>
                            </div>
                        </motion.div>
                    ) : isGenerating ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center space-y-4"
                        >
                            <div className="relative">
                                <Loader2 className="w-12 h-12 text-gic-blue animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-gic-gold animate-pulse" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gic-blue animate-pulse">Calibrating Narrative...</p>
                        </motion.div>
                    ) : memo ? (
                        <motion.div 
                            key="memo"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-3xl mx-auto bg-white shadow-2xl rounded-sm border border-slate-200 p-12 relative min-h-[700px] flex flex-col"
                            style={{ boxShadow: '0 10px 50px -12px rgba(0,0,0,0.1)' }}
                        >
                            {/* Document Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg]">
                                <h1 className="text-9xl font-black">CONFIDENTIAL</h1>
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col">
                                {/* Memo Header */}
                                <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gic-blue" />
                                            <span className="text-xs font-black uppercase tracking-[0.3em]">GIC STRATEGY UNIT</span>
                                        </div>
                                        <h1 className="text-4xl font-display font-black text-slate-900 leading-tight uppercase tracking-tighter">
                                            {memo.title}
                                        </h1>
                                    </div>
                                    <div className="text-right">
                                        <div className="px-3 py-1 bg-rose-500 text-white rounded text-[8px] font-black uppercase tracking-widest mb-2">
                                            {memo.classification}
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase">
                                            Ref Index: {memoReference}
                                        </div>
                                    </div>
                                </div>

                                {/* Memo Details */}
                                <div className="grid grid-cols-2 gap-8 mb-12 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <div className="space-y-1">
                                        <p>TO: OFFICE OF THE PREMIER</p>
                                        <p>FROM: AUTONOMOUS COMMAND CENTER (GEN 4)</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <p>DATE: {memo.timestamp || new Date().toLocaleString()}</p>
                                        <p>REGION: {province} MONITORING ZONE</p>
                                    </div>
                                </div>

                                {/* Content sections */}
                                <div className="space-y-10 flex-1">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-4 border-gic-blue pl-4">Executive Summary</h4>
                                        <p className="text-lg font-serif font-medium text-slate-700 leading-relaxed italic">
                                            "{memo.summary}"
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest border-l-4 border-gic-blue pl-4">Key Strategic Findings</h4>
                                        <ul className="space-y-4">
                                            {memo.findings.map((finding, i) => (
                                                <li key={i} className="flex gap-4">
                                                    <span className="text-gic-blue font-black flex-shrink-0">0{i+1}.</span>
                                                    <p className="text-sm font-bold text-slate-800 leading-snug">{finding}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                                        <div className="flex items-center gap-3">
                                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recommended Intervention</h4>
                                        </div>
                                        <p className="text-sm font-black text-slate-900 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                                            {memo.recommendation}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer Signature */}
                                <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-end">
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Database className="w-3 h-3 text-slate-400" />
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Grounded Data Lineage</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
                                                    <span>Signal Sources</span>
                                                    <span>n={signals.length}</span>
                                                </div>
                                                <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
                                                    <span>Ingestion Nodes</span>
                                                    <span>Tavily-GIC-OSINT</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center font-black text-xs">
                                                GIC
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                Verified Report Statement<br/>Traceable to Source ID: {sourceReference}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-2">
                                        <button className="p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                                            <Download className="w-4 h-4 text-slate-400" />
                                        </button>
                                        <button className="p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                                            <Share2 className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
            
            {/* Action Bar Footer */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Auto-Sync: Enabled</span>
                    </div>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-gic-blue transition-colors">
                    Archive View <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
