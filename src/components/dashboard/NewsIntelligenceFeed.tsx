"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, TrendingUp, MessageSquare, Globe, Building2, MapPin } from 'lucide-react';
import { SA_REGIONAL_REGISTRY } from '@/data/regional-registry';

interface NewsIntelligenceFeedProps {
    news: any[];
}

const NEWS_SECTORS = [
    { label: 'All Sectors', value: 'all' },
    { label: 'Economic', value: 'Economic' },
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Transport', value: 'Transport' },
    { label: 'Infrastructure', value: 'Infrastructure' }
];

export default function NewsIntelligenceFeed({ news }: NewsIntelligenceFeedProps) {
    const [activeSector, setActiveSector] = React.useState('all');
    const [activeMunicipality, setActiveMunicipality] = React.useState('all');
    const [activeWard, setActiveWard] = React.useState('all');

    // Get Gauteng Registry Data
    const gautengData = SA_REGIONAL_REGISTRY.provinces.find(p => p.name === 'Gauteng');
    const municipalities = gautengData?.municipalities || [];
    const currentMuni = municipalities.find(m => m.name === activeMunicipality);
    const wards = currentMuni?.wards || [];

    const displayNews = news
        .filter(article => 
            (activeSector === 'all' || 
            article.category?.toLowerCase() === activeSector.toLowerCase() ||
            article.sector?.toLowerCase() === activeSector.toLowerCase()) &&
            (activeMunicipality === 'all' || article.municipality === activeMunicipality) &&
            (activeWard === 'all' || article.ward === activeWard)
        )
        .slice(0, 10);

    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-8 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gic-blue/10 blur-[80px] -ml-32 -mt-32" />
            
                <div className="flex flex-wrap items-center gap-3 relative z-20">
                    {/* Municipality Cascader */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <select 
                            value={activeMunicipality}
                            onChange={(e) => {
                                setActiveMunicipality(e.target.value);
                                setActiveWard('all');
                            }}
                            className="bg-transparent border-none text-white text-[9px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer outline-none"
                        >
                            <option value="all" className="bg-slate-900">All Municipalities</option>
                            {municipalities.map(m => (
                                <option key={m.name} value={m.name} className="bg-slate-900">{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Ward Cascader */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <select 
                            value={activeWard}
                            onChange={(e) => setActiveWard(e.target.value)}
                            disabled={activeMunicipality === 'all'}
                            className="bg-transparent border-none text-white text-[9px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <option value="all" className="bg-slate-900">All Wards</option>
                            {wards.map(w => (
                                <option key={w} value={w} className="bg-slate-900">{w}</option>
                            ))}
                        </select>
                    </div>

                    <select 
                        value={activeSector}
                        onChange={(e) => setActiveSector(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white text-[9px] font-black rounded-xl px-3 py-1.5 uppercase tracking-widest focus:ring-1 focus:ring-gic-blue outline-none"
                    >
                        {NEWS_SECTORS.map(s => (
                            <option key={s.value} value={s.value} className="bg-slate-900">{s.label}</option>
                        ))}
                    </select>
                </div>

            <div className="space-y-4 relative z-10 min-h-[300px]">
                {displayNews.length > 0 ? (
                    displayNews.map((article, index) => (
                        <motion.div 
                            key={article.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-5 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 rounded-2xl transition-all cursor-pointer group/item"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-widest ${
                                            article.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 
                                            article.sentiment === 'negative' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'
                                        }`}>
                                            {article.category || 'Focus'}
                                        </span>
                                        <span className="text-[9px] font-bold text-white/30">• {article.publishedAt || 'Recent'}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white group-hover/item:text-gic-blue transition-colors leading-snug">
                                        {article.title}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-1">
                                            <Globe className="w-3 h-3 text-slate-500" />
                                            <span className="text-[10px] font-bold text-slate-400">{article.sourceName || 'OSINT'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3 text-slate-500" />
                                            <span className="text-[10px] font-bold text-slate-400">Verified Signal</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/item:bg-gic-blue/20 transition-all">
                                    <ExternalLink className="w-4 h-4 text-white/40 group-hover/item:text-gic-blue" />
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                            <Newspaper className="w-8 h-8 text-white/20" />
                        </div>
                        <h4 className="text-white font-bold mb-1">No News Signals Found</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Scanning SADC media nodes...</p>
                    </div>
                )}
            </div>

            <button className="mt-6 w-full py-3 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                Full Intelligence Archive
            </button>
        </div>
    );
}
