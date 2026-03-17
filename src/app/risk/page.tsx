"use client";

import { motion } from "framer-motion";
import SAMap from "@/components/maps/SAMap";
import {
    ShieldAlert,
    Map as MapIcon,
    AlertTriangle,
    Activity,
    ChevronRight,
    ShieldCheck,
    Zap,
    Globe,
    Cpu
} from "lucide-react";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 1.2, ease: "easeOut" as const }
    }
};

const SITE_FIDELITY_LEVELS = {
    Structural: 92,
    Civil: 84,
    Roads: 76,
    Health: 88,
} as const;

export default function RiskMonitor() {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6 pb-4"
        >
            {/* Elite Risk Header */}
            <motion.div variants={itemVariants} className="flex items-end justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-5 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] rounded-full"></div>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Live Environment / Risk Vectors</span>
                    </div>
                    <h1 className="text-5xl font-display font-bold text-white tracking-tighter uppercase leading-none">Operational Risk</h1>
                </div>

                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] mb-1">Integrity Status</p>
                        <div className="flex items-center gap-4 justify-end">
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-gic-glow animate-pulse" />
                            <span className="text-2xl font-display font-bold text-white tracking-tight uppercase">Nominal</span>
                        </div>
                    </div>
                    <div className="h-16 w-[1px] bg-white/[0.08]" />
                    <div className="w-12 h-12 gic-glass-premium rounded-xl flex items-center justify-center border border-white/10 shadow-gic-neon">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                    </div>
                </div>
            </motion.div>

            {/* Tactical Grid */}
            <div className="grid grid-cols-12 gap-8">
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8">
                    <div className="gic-glass-premium h-[500px] rounded-[3rem] overflow-hidden relative group border border-white/[0.08] shadow-gic-neon p-1">
                        <div className="w-full h-full rounded-[2.8rem] overflow-hidden grayscale contrast-[1.2] brightness-[0.6] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-[5000ms] border border-white/5 shadow-inner">
                            <SAMap activeLayers={['signals', 'projects']} />
                        </div>
                        <div className="relative z-10 text-center">
                            <MapIcon className="w-24 h-24 text-blue-500/20 mb-8 mx-auto" />
                            <h3 className="text-3xl font-display font-bold text-white/40 uppercase tracking-[0.4em]">Tactical Overlay Active</h3>
                            <div className="mt-8 flex gap-4 justify-center">
                                <span className="px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest">Gauteng North</span>
                                <span className="px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-black text-red-500 uppercase tracking-widest">2 Alert Zones</span>
                            </div>
                        </div>

                        {/* Elite HUD elements */}
                        <div className="absolute top-12 left-12 p-8 gic-glass-premium rounded-[3rem] border border-white/10 min-w-[300px] bg-gic-navy/60">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Node HPQ-9</span>
                                <Globe className="w-4 h-4 text-slate-700" />
                            </div>
                            <div className="space-y-4">
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[84%]" />
                                </div>
                                <p className="text-[11px] font-medium text-slate-400">Integrity: 84.2%</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 flex flex-col gap-12">
                    <div className="gic-glass-premium p-12 rounded-[4rem] border border-white/[0.06] bg-red-500/[0.02]">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-5">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                Critical Alerts
                            </h3>
                            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-ping" />
                        </div>
                        <div className="space-y-8">
                            {[
                                { title: "Structural Instability - Sector 4", level: "Critical", time: "4m ago" },
                                { title: "Encroachment Detected - Zone B", level: "High", time: "18m ago" }
                            ].map((alert, i) => (
                                <div key={i} className="p-8 bg-red-500/[0.03] border border-red-500/10 rounded-[2.5rem] hover:bg-red-500/10 transition-all duration-700 border-l-2 border-l-red-500">
                                    <p className="text-[15px] font-bold text-white mb-4 tracking-tight leading-snug">{alert.title}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{alert.level}</span>
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{alert.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="gic-glass-premium p-12 rounded-[4rem] border border-white/[0.06] flex-1">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-5">
                                <Activity className="w-6 h-6 text-blue-500" />
                                Site Fidelity
                            </h3>
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Network Wide</span>
                        </div>
                        <div className="space-y-10">
                            {(['Structural', 'Civil', 'Roads', 'Health'] as const).map((sector) => (
                                <div key={sector} className="space-y-4">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                        <span className="text-white">{sector}</span>
                                        <span className="text-blue-500">Normal</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${SITE_FIDELITY_LEVELS[sector]}%` }}
                                            transition={{ duration: 2, ease: "circOut" }}
                                            className="h-full bg-blue-500/60 shadow-gic-glow"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
