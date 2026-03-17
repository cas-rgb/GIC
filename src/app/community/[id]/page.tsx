"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SAMap from "@/components/maps/SAMap";
import SentimentChart from "@/components/dashboard/SentimentChart";
import PageHeader from "@/components/ui/PageHeader";
import { generateDeepAuditDossier } from "@/services/audits";
import { DeepDossier } from "@/types";
import { pullRealTimeSignals } from "@/app/intel-actions";
import { CommunitySignal } from "@/types/database";
import { RefreshCw } from "lucide-react";
import {
    ArrowLeft,
    MapPin,
    Users,
    MessageSquare,
    Settings,
    ExternalLink,
    ShieldCheck,
    Zap,
    Clock,
    Info,
    FileSearch,
    TrendingUp,
    ShieldAlert,
    ChevronRight,
    Activity,
    Target,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function CommunityProfile({ params }: { params: { id: string } }) {
    const [activeTab, setActiveTab] = useState('intelligence');
    const [community, setCommunity] = useState<any>(null);
    const [dossier, setDossier] = useState<DeepDossier | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [realSignals, setRealSignals] = useState<CommunitySignal[]>([]);
    const [isPullingSignals, setIsPullingSignals] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            const res = await (await import("@/app/intel-actions")).getCommunityIntelligence();
            if (res.success && res.communities) {
                const found = res.communities.find((c: any) => c.id === params.id) || res.communities[0];
                setCommunity(found);
            }
        }
        loadProfile();
    }, [params.id]);

    useEffect(() => {
        if (community) {
            fetchSignals();
        }
    }, [community]); // Re-fetch signals when community data is loaded

    const communityName = community?.name || "Loading Node...";

    const fetchSignals = async () => {
        if (!community) return; // Ensure community data is loaded before fetching signals
        setIsPullingSignals(true);
        try {
            const res = await pullRealTimeSignals({
                community_name: communityName,
                municipality: community.municipality || "",
                province: community.province || "",
                time_window: '7d'
            });
            if (res.success && 'signals' in res) {
                setRealSignals(res.signals);
                console.log(`Ingested ${res.signalCount} signals`);
            }
        } catch (error) {
            console.error("Failed to pull signals:", error);
        } finally {
            setIsPullingSignals(false);
        }
    };

    useEffect(() => {
        fetchSignals();
    }, [params.id]);

    const handleGenerateAudit = async () => {
        setIsGenerating(true);
        try {
            const result = await generateDeepAuditDossier("Soweto");
            setDossier(result);
            setActiveTab('audit');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="pb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <PageHeader
                title="Regional Biopsy"
                subtitle={`Sector Briefing • Node: ${params.id || 'Soweto'}`}
                guidingQuestion="What is the current fragility and momentum of this specific regional node?"
                headerImage="/projects/INTABAZWE-X2-9906-1024x683.webp"
                breadcrumb={[{ name: "Community Hub", href: "/community" }, { name: communityName }]}
                actions={
                    <div className="flex gap-4">
                        <button
                            onClick={handleGenerateAudit}
                            disabled={isGenerating}
                            className="h-12 px-6 bg-slate-900/5 hover:bg-slate-900/10 rounded-xl border border-slate-900/10 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            <FileSearch className={`w-4 h-4 text-gic-blue ${isGenerating ? 'animate-pulse' : ''}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                {isGenerating ? 'Auditing...' : 'Strategic Audit'}
                            </span>
                        </button>
                        <button className="h-12 px-8 bg-gic-blue text-slate-900 rounded-xl shadow-gic-neon hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-bold">
                            <Zap className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-widest">Deploy response</span>
                        </button>
                    </div>
                }
            />

            <div className="px-8 md:px-12 space-y-16">
                {/* Modular Briefing Grid */}
            <div className="grid grid-cols-12 gap-16">
                {/* Tactical Metrics Column */}
                <div className="col-span-4 space-y-12">
                    <motion.div
                        whileHover={{ y: -6 }}
                        className="gic-glass-apex p-10 rounded-[3.5rem] border border-white/[0.06] relative overflow-hidden group shadow-4xl"
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2">Regional Fragility</p>
                                    <h3 className="text-5xl font-display font-bold text-white tracking-tighter">92.4</h3>
                                </div>
                                <div className="w-16 h-16 bg-blue-500/10 rounded-[2rem] flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                                    <ShieldAlert className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Signal Saturation</span>
                                    <span className="text-blue-500">88.2%</span>
                                </div>
                                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "88.2%" }}
                                        transition={{ duration: 2, ease: "circOut" }}
                                        className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.7)]"
                                    ></motion.div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-blue-500/5 blur-[80px] rounded-full group-hover:bg-blue-500/15 transition-all duration-[2000ms]"></div>
                    </motion.div>

                    <SentimentChart positive={620} neutral={145} negative={483} />

                    <div className="gic-glass-apex p-10 rounded-[3.5rem] border border-white/[0.06] shadow-3xl">
                        <div className="flex items-center justify-between mb-10 px-2">
                            <h3 className="font-display font-bold text-white flex items-center gap-4 text-xl uppercase tracking-tight">
                                <MessageSquare className="w-6 h-6 text-blue-500" />
                                Media Signals
                            </h3>
                            <button 
                                onClick={fetchSignals}
                                disabled={isPullingSignals}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                            >
                                <RefreshCw className={`w-4 h-4 text-slate-500 group-hover:text-blue-400 ${isPullingSignals ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                            {realSignals.length > 0 ? (
                                realSignals.map((signal, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ x: 6 }}
                                        className="p-6 bg-white/[0.02] border-l-2 border-blue-500 rounded-r-[2rem] transition-all duration-[800ms] group cursor-pointer hover:bg-white/[0.04] hover:border-blue-400"
                                    >
                                        <p className="text-[15px] font-bold text-white group-hover:text-blue-400 transition-colors leading-tight tracking-tight">{signal.text}</p>
                                        <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-600 font-black uppercase tracking-tighter">
                                            <span className="text-blue-500">{signal.source}</span>
                                            <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Just now</span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                [
                                    { title: `Water Supply Disruptions in ${communityName}`, source: "EWN News", time: "2h ago" },
                                    { title: `Residents Demand Road Maintenance in ${community.municipality}`, source: "Local Gazette", time: "5h ago" },
                                    { title: "Infrastructure Audit Underway", source: "GIC Tracker", time: "1d ago" }
                                ].map((signal, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 6 }}
                                        className="p-6 bg-white/[0.02] border-l-2 border-blue-500 rounded-r-[2rem] transition-all duration-[800ms] group cursor-pointer hover:bg-white/[0.04] hover:border-blue-400 opacity-60"
                                    >
                                        <p className="text-[15px] font-bold text-white group-hover:text-blue-400 transition-colors leading-tight tracking-tight">{signal.title}</p>
                                        <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-600 font-black uppercase tracking-tighter">
                                            <span className="text-blue-500">{signal.source}</span>
                                            <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {signal.time}</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Geospatial & Intelligence Grid */}
                <div className="col-span-8 flex flex-col gap-12 min-h-0">
                    <div className="h-[500px] gic-glass-apex rounded-[4rem] border border-white/[0.08] overflow-hidden relative p-1 group shadow-4xl">
                        <div className="w-full h-full rounded-[3.8rem] overflow-hidden grayscale-[0.8] contrast-[1.2] group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-[2500ms] border border-white/[0.05]">
                            <SAMap activeLayers={['signals']} />
                        </div>
                        <div className="absolute top-12 left-12 p-6 gic-glass-apex bg-gic-navy/40 rounded-3xl border border-white/10 pointer-events-none group-hover:scale-105 transition-transform duration-1000">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-blue-500" />
                                <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Geospatial Node: {params.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 gic-glass-apex rounded-[4rem] border border-white/[0.08] flex flex-col overflow-hidden shadow-4xl bg-white/[0.01]">
                        <div className="px-12 py-8 border-b border-white/[0.04] flex gap-16 bg-white/[0.02]">
                            {['intelligence', 'influencers', 'audit', 'risk'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`text-[12px] font-black uppercase tracking-[0.4em] pb-8 -mb-8 transition-all duration-[800ms] relative ${activeTab === tab ? 'text-white gic-text-glow' : 'text-slate-600 hover:text-slate-400'}`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="tabPillApex"
                                            className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.9)]"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-12 flex-1 overflow-y-auto scrollbar-hide">
                            <AnimatePresence mode="wait">
                                {activeTab === 'audit' && dossier ? (
                                    <motion.div
                                        key="audit"
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -30 }}
                                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                        className="space-y-16"
                                    >
                                        <div className="gic-glass-apex bg-blue-500/[0.02] p-12 rounded-[3.5rem] border border-blue-500/10 relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-4 mb-8">
                                                    <TrendingUp className="w-6 h-6 text-blue-400" />
                                                    <h3 className="text-2xl font-display font-bold uppercase tracking-widest text-white">36-Month Strategic Briefing</h3>
                                                </div>
                                                <p className="text-[17px] leading-relaxed text-slate-400 italic font-medium tracking-tight">
                                                    "{dossier.forecast36m}"
                                                </p>
                                            </div>
                                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] group-hover:bg-blue-500/10 transition-all duration-[3000ms]"></div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-16">
                                            <div className="space-y-10">
                                                <h4 className="flex items-center gap-4 text-[12px] font-black text-slate-600 uppercase tracking-[0.4em]">
                                                    <ShieldAlert className="w-5 h-5 text-blue-500" /> Tactical Inhibitors
                                                </h4>
                                                <div className="space-y-6">
                                                    {dossier.strategicRisks.map((risk: string, i: number) => (
                                                        <div key={i} className="p-8 bg-white/[0.01] border border-white/[0.05] rounded-[2rem] text-[14px] font-bold text-slate-500 flex gap-6 hover:border-blue-500/30 transition-all duration-1000 group/item">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.7)] group-hover/item:scale-125 transition-transform"></div>
                                                            <span className="leading-snug">{risk}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-10">
                                                <h4 className="flex items-center gap-4 text-[12px] font-black text-slate-600 uppercase tracking-[0.4em]">
                                                    <Activity className="w-5 h-5 text-blue-400" /> Growth Vectors
                                                </h4>
                                                <div className="space-y-6">
                                                    {dossier.growthOpportunities.map((opp: string, i: number) => (
                                                        <div key={i} className="p-8 bg-white/[0.01] border border-white/[0.05] rounded-[2rem] text-[14px] font-bold text-slate-500 flex gap-6 hover:border-blue-500/30 transition-all duration-1000 group/item">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mt-2 shrink-0 shadow-[0_0_15px_rgba(96,165,250,0.7)] group-hover/item:scale-125 transition-transform"></div>
                                                            <span className="leading-snug">{opp}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : activeTab === 'influencers' ? (
                                    <motion.div
                                        key="influencers"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 1 }}
                                        className="space-y-10"
                                    >
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[11px] font-black text-slate-700 uppercase tracking-[0.4em]">
                                                    <th className="pb-10 pl-6">Node Proxy</th>
                                                    <th className="pb-10">Sector Specialisation</th>
                                                    <th className="pb-10 text-center">Reach Rank</th>
                                                    <th className="pb-10 text-center">Integrity Vector</th>
                                                    <th className="pb-10 pr-6 text-right">Briefing</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[15px] font-bold text-slate-400">
                                                {[
                                                    { name: "Sizwe Mdluli", topic: "Water Rights Corridors", reach: "12,400", score: 94 },
                                                    { name: "Soweto Civic Organisation", topic: "Structural Maintenance", reach: "45,201", score: 88 },
                                                    { name: "Global Health NGO", topic: "Medical Infrastructure", reach: "8,912", score: 72 }
                                                ].map((inf, i) => (
                                                    <motion.tr
                                                        key={i}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1, duration: 0.8 }}
                                                        className="group hover:bg-white/[0.03] transition-all duration-[800ms] border-b border-white/[0.03]"
                                                    >
                                                        <td className="py-8 pl-6 font-black transition-all text-white group-hover:text-blue-400 group-hover:translate-x-2">{inf.name}</td>
                                                        <td className="py-8 text-slate-600 italic font-medium">{inf.topic}</td>
                                                        <td className="py-8 text-center text-slate-500 font-black tracking-widest">{inf.reach}</td>
                                                        <td className="py-8 text-center">
                                                            <span className="bg-blue-500/10 text-blue-500 px-4 py-1.5 rounded-xl border border-blue-500/20 font-black tracking-[0.2em] text-[10px]">{inf.score} / 100</span>
                                                        </td>
                                                        <td className="py-8 pr-6 text-right">
                                                            <button className="text-slate-700 hover:text-white transition-all transform hover:scale-125 duration-500">
                                                                <ArrowUpRight className="w-6 h-6" />
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="placeholder"
                                        className="flex flex-col items-center justify-center py-32 text-center opacity-30"
                                    >
                                        <Activity className="w-20 h-20 mb-12 text-slate-800" />
                                        <p className="font-black uppercase text-[12px] tracking-[0.5em] mb-4 text-white">Synthesizing Regional Data Streams</p>
                                        <p className="text-sm text-slate-600 max-w-[340px] leading-relaxed font-medium">Processing multi-channel telemetry and community signals for high-fidelity regional biopsy.</p>
                                        {!dossier && (
                                            <button
                                                onClick={handleGenerateAudit}
                                                className="mt-12 h-14 px-10 bg-white/[0.03] border border-white/[0.1] rounded-2xl text-[11px] font-black uppercase text-blue-500 tracking-[0.3em] hover:bg-white/[0.08] hover:border-blue-500/50 transition-all duration-1000 group flex items-center gap-4"
                                            >
                                                Initiate Deep Audit <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
