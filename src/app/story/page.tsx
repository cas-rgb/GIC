"use client";

import { motion } from "framer-motion";
import { Play, Pause, ChevronLeft, ChevronRight, Globe, MessageSquare, ShieldAlert, Target, Zap, Map, Calendar } from "lucide-react";
import GICMap from "@/components/ui/GICMap";
import PageHeader from "@/components/ui/PageHeader";
import StrategicFilterBar from "@/components/ui/StrategicFilterBar";

import { useState, useEffect } from "react";
import { discoverRealSignals, getRegionalMetadata } from "@/app/intel-actions";
import { CommunitySignal } from "@/types/database";

export default function MapStoryMode() {
    const [activeStory, setActiveStory] = useState<CommunitySignal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hotspots, setHotspots] = useState<any[]>([]);

    // Filter State
    const [hotspotFilter, setHotspotFilter] = useState("all");
    const [timelineFilter, setTimelineFilter] = useState("live");

    useEffect(() => {
        async function loadStory() {
            setIsLoading(true);
            const [sigRes, metaRes] = await Promise.all([
                discoverRealSignals("South Africa Infrastructure Protest Risk"),
                getRegionalMetadata()
            ]);

            if (sigRes.success && sigRes.signals && sigRes.signals.length > 0) {
                const sorted = [...sigRes.signals].sort((a: any, b: any) => (b.urgencyValue || b.urgency || 0.5) - (a.urgencyValue || a.urgency || 0.5));
                setActiveStory(sorted[0]);
            }

            if (metaRes.success && metaRes.municipalities) {
                setHotspots(metaRes.municipalities.slice(0, 5).map((m: string) => ({ label: m, value: m.toLowerCase() })));
            }
            setIsLoading(false);
        }
        loadStory();
    }, []);

    const displayStory = activeStory || {
        text: "Analyzing regional telemetry for critical events...",
        eventTrigger: "Event Scan in Progress",
        layers: ["issue"],
        sentiment: "neutral",
        momentum: 0.5,
        source: "GIC System",
        province: "Regional",
        municipality: "Core Hub",
        urgency: 0.4
    };

    return (
        <div className="pb-20">
            <PageHeader
                title="Institutional Narrative Engine"
                subtitle="Chronological Signal Analysis • Sentiment Trajectory • Regional Hotspot Evolution"
                guidingQuestion="How has the infrastructure narrative evolved over time in specific hotspots?"
                headerImage="/projects/MAJWEMASWEU-X5-1039-1024x683.webp"
                breadcrumb={[{ name: "Story Mode" }]}
            />

            <div className="px-8 md:px-12 space-y-8">
                <StrategicFilterBar
                    filters={[
                        {
                            label: "Hotspot Node",
                            icon: <Map />,
                            options: [
                                { label: "All Hotspots", value: "all" },
                                ...hotspots
                            ],
                            currentValue: hotspotFilter,
                            onChange: setHotspotFilter
                        },
                        {
                            label: "Timeline Scope",
                            icon: <Calendar />,
                            options: [
                                { label: "Live Telemetry", value: "live" },
                                { label: "Last 24 Hours", value: "24h" },
                                { label: "Last 7 Days", value: "7d" },
                                { label: "Strategic Quarter", value: "qtr" }
                            ],
                            currentValue: timelineFilter,
                            onChange: setTimelineFilter
                        }
                    ]}
                />
                
                <div className="relative w-full h-[85vh] bg-slate-950 overflow-hidden rounded-[3rem] border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.5)] group">
                    {/* The Intelligence Layer */}
                    <div className="absolute inset-0 z-0">
                        <GICMap />
                    </div>

                    {/* Telemetry Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10 opacity-20">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    </div>

                    {/* Dynamic Scanline */}
                    <motion.div 
                        initial={{ top: "-10%" }}
                        animate={{ top: "110%" }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[2px] bg-gic-blue/20 blur-sm z-10 pointer-events-none"
                    />

                    {/* Narrative Overlay */}
                    <div className="absolute top-12 left-12 right-12 flex justify-between items-start pointer-events-none z-20">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] max-w-sm pointer-events-auto shadow-2xl relative overflow-hidden group/card"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gic-blue/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                            
                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute inset-0 opacity-50" />
                                    <div className="w-2 h-2 rounded-full bg-rose-500 relative shadow-[0_0_12px_rgba(244,63,94,0.5)]" />
                                </div>
                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">
                                    {isLoading ? "Scanning Telemetry..." : `Event Alert: ${displayStory.eventTrigger || 'Strategic Signal'}`}
                                </span>
                            </div>

                            <h2 className="text-3xl font-display font-bold text-white leading-[1.1] mb-5 tracking-tight">
                                {isLoading ? "System Discovery Active" : (displayStory.text.length > 50 ? displayStory.text.substring(0, 50) + "..." : displayStory.text)}
                            </h2>
                            
                            <div className="w-12 h-1 bg-gic-blue/30 rounded-full mb-6" />

                            <p className="text-[12px] text-slate-400 font-medium leading-relaxed mb-10 opacity-80">
                                {isLoading ? "Synthesizing clinical signals from global internet telemetry and regional sensors..." : displayStory.text}
                            </p>
                            
                            <div className="flex flex-col gap-4">
                                <Indicator label="01 Issue" value={displayStory.layers?.includes('issue') ? "Clinical Alert" : "Nominal"} color="text-rose-400" icon={<ShieldAlert className="w-3.5 h-3.5" />} />
                                <Indicator label="03 Momentum" value={`Velocity [${displayStory.momentum?.toFixed(2) || '0.00'}]`} color="text-emerald-400" icon={<Zap className="w-3.5 h-3.5" />} />
                                <Indicator label="07 Event" value={displayStory.eventTrigger || "None"} color="text-rose-500" icon={<Globe className="w-3.5 h-3.5" />} />
                                <Indicator label="11 Evidence" value={displayStory.source} color="text-gic-blue" icon={<Target className="w-3.5 h-3.5" />} />
                            </div>
                        </motion.div>

                        {/* Playback Controls & Status Hub */}
                        <div className="flex flex-col gap-6 items-end pointer-events-auto">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-20 h-20 bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-gic-blue transition-colors group/play"
                            >
                                <Play className="w-8 h-8 text-slate-900 fill-slate-900 ml-1 group-hover/play:scale-110 transition-transform" />
                            </motion.button>
                            
                            <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-5 rounded-[2rem] flex flex-col gap-5 items-center">
                                <div className="flex gap-3">
                                    <button className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-white">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-white">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="h-px w-full bg-white/5" />
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Live Epoch</span>
                                    <span className="text-[11px] font-mono font-bold text-gic-blue">ST-0922-X</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Insight Ribbon */}
                    <div className="absolute bottom-12 left-12 right-12 z-20 pointer-events-none">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] pointer-events-auto overflow-hidden relative shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-gic-blue/10 via-transparent to-transparent" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex gap-16 items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                                            <Map className="w-6 h-6 text-gic-blue" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Impact Radius</p>
                                            <p className="text-base font-bold text-white tracking-tight">{displayStory.momentum ? (displayStory.momentum * 12).toFixed(1) : "4.2"}km Tactical Zone</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-10 bg-white/5" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Geospatial Fix</p>
                                        <p className="text-base font-bold text-white tracking-tight">{displayStory.province}, {displayStory.municipality || "Core Grid"}</p>
                                    </div>
                                    <div className="w-px h-10 bg-white/5" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Fiscal Exposure Index</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-bold text-rose-400">R{(displayStory.urgency ? displayStory.urgency * 25 : 120).toFixed(0)}M</span>
                                            <span className="text-[10px] font-bold text-rose-500/50 uppercase tracking-tighter">at Risk</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button className="h-16 px-10 bg-gic-blue text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-gic-neon hover:scale-105 active:scale-95 transition-all">
                                    Extract Strategic Narrative
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Indicator({ label, value, color, icon }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/[0.05] border border-white/10 rounded-2xl group/indicator hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500 shadow-lg">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-950 rounded-xl group-hover/indicator:scale-110 group-hover/indicator:text-white transition-all duration-500 border border-white/5 shadow-inner">
                    <div className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100">{icon}</div>
                </div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] group-hover:text-slate-200 transition-colors">{label}</span>
            </div>
            <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-black/20 rounded-lg border border-white/5 ${color}`}>{value}</span>
        </div>
    );
}
