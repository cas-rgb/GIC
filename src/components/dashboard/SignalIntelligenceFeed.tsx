"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle2, Link, MapPin, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { CommunityIssue } from '@/types/dashboard-one';

interface SignalIntelligenceFeedProps {
    signals: CommunityIssue[];
    loading?: boolean;
}

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
    switch (sentiment?.toLowerCase()) {
        case 'negative': return <TrendingDown className="w-3 h-3 text-rose-500" />;
        case 'positive': return <TrendingUp className="w-3 h-3 text-emerald-500" />;
        default: return <Minus className="w-3 h-3 text-slate-400" />;
    }
};

const UrgencyBadge = ({ urgency }: { urgency: string }) => {
    const colors = {
        high: 'bg-rose-50 text-rose-700 border-rose-100',
        medium: 'bg-amber-50 text-amber-700 border-amber-100',
        low: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    };
    const style = colors[urgency?.toLowerCase() as keyof typeof colors] || 'bg-slate-50 text-slate-700 border-slate-100';
    
    return (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${style}`}>
            {urgency || 'Normal'}
        </span>
    );
};

export default function SignalIntelligenceFeed({ signals, loading }: SignalIntelligenceFeedProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!signals || signals.length === 0) {
        return (
            <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Recent Signals Detected</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {signals.map((signal, idx) => (
                <motion.div 
                    key={signal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${signal.sentiment?.toLowerCase() === 'negative' ? 'bg-rose-50' : 'bg-slate-50'}`}>
                                <SentimentIcon sentiment={signal.sentiment} />
                            </div>
                            <div>
                                <h4 className="text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight line-clamp-1">
                                    {signal.source_title || signal.primary_topic}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <UrgencyBadge urgency={signal.urgency} />
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        {signal.primary_topic} / {signal.municipality || 'Regional View'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <a 
                            href={signal.tavily_result_id} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <Link className="w-3 h-3" />
                        </a>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium mb-2">
                        {signal.evidence_snippet}
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>AI Verified Intelligence Card</span>
                        </div>
                        <span>UID: {signal.id.substring(0, 8)}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
