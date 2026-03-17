"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Zap, 
    Hammer, 
    Activity, 
    ShieldCheck, 
    Users, 
    TrendingUp, 
    ArrowRight, 
    ChevronRight,
    RefreshCw,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";

interface SectorBudget {
    id: string;
    label: string;
    icon: any;
    color: string;
    value: number; // 0-100 relative allocation
}

export default function WhatIfSimulator() {
    const [budgets, setBudgets] = useState<SectorBudget[]>([
        { id: "water", label: "Water & Sanitation", icon: Zap, color: "text-blue-500", value: 30 },
        { id: "health", label: "Public Health", icon: Activity, color: "text-emerald-500", value: 25 },
        { id: "roads", label: "Roads & Transit", icon: Hammer, color: "text-amber-500", value: 25 },
        { id: "safety", label: "Public Safety", icon: ShieldCheck, color: "text-rose-500", value: 20 },
    ]);

    const [isSimulating, setIsSimulating] = useState(false);

    // Mock predictive logic: Weighted calculation of SDI and Sentiment
    const prediction = useMemo(() => {
        // Base values
        let sdi = 75;
        let sentiment = 68;

        // Weights: Water is high impact for SDI, Safety is high impact for Sentiment
        const waterVal = budgets.find(b => b.id === "water")?.value || 0;
        const healthVal = budgets.find(b => b.id === "health")?.value || 0;
        const roadsVal = budgets.find(b => b.id === "roads")?.value || 0;
        const safetyVal = budgets.find(b => b.id === "safety")?.value || 0;

        // Simple linear model for prototype
        sdi = 40 + (waterVal * 0.4) + (healthVal * 0.3) + (roadsVal * 0.2) + (safetyVal * 0.1);
        sentiment = 30 + (safetyVal * 0.5) + (healthVal * 0.3) + (waterVal * 0.1) + (roadsVal * 0.1);

        // Normalize or add "Realistic" variance
        return {
            sdi: Math.min(Math.round(sdi), 100),
            sentiment: Math.min(Math.round(sentiment), 100),
            delta: Math.round((sdi - 75) * 1.5) // Change from current
        };
    }, [budgets]);

    const handleBudgetChange = (id: string, newVal: number) => {
        setIsSimulating(true);
        setBudgets(prev => prev.map(b => b.id === id ? { ...b, value: newVal } : b));
        
        // Reset simulation animation after a short delay
        setTimeout(() => setIsSimulating(false), 800);
    };

    const totalPoints = budgets.reduce((acc, b) => acc + b.value, 0);
    const isOverBudget = totalPoints > 100;

    return (
        <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
            {/* Holographic Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gic-blue/10 blur-[130px] -mr-48 -mt-48 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gic-gold/5 blur-[100px] -ml-32 -mb-32" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gic-blue/20 rounded-xl border border-gic-blue/30">
                                <Zap className="w-5 h-5 text-gic-blue animate-pulse" />
                            </div>
                            <span className="text-[10px] font-black text-gic-blue uppercase tracking-[0.5em]">Generation 4 Vision</span>
                        </div>
                        <h2 className="text-4xl font-display font-black tracking-tight">Strategy Simulation Engine</h2>
                        <p className="text-slate-400 font-medium max-w-xl text-lg">
                            Manipulate resource allocation vectors to predict the trajectory of provincial stability and public sentiment.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-xl">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Resource Allocation</p>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-2xl font-black ${isOverBudget ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {totalPoints}
                                </span>
                                <span className="text-slate-500 font-bold">/ 100 Shares</span>
                            </div>
                        </div>
                        {isOverBudget ? (
                            <AlertTriangle className="w-8 h-8 text-rose-500" />
                        ) : (
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Panel: Sliders */}
                    <div className="lg:col-span-7 space-y-10">
                        {budgets.map((sector) => (
                            <div key={sector.id} className="group">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/20 transition-all`}>
                                            <sector.icon className={`w-4 h-4 ${sector.color}`} />
                                        </div>
                                        <span className="text-sm font-black uppercase tracking-widest text-slate-300">{sector.label}</span>
                                    </div>
                                    <span className={`text-lg font-black ${sector.color}`}>{sector.value}%</span>
                                </div>
                                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden group-hover:bg-white/10 transition-all">
                                    <motion.div 
                                        className={`absolute top-0 left-0 h-full ${sector.color.replace('text', 'bg')} opacity-40`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${sector.value}%` }}
                                    />
                                    <input 
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={sector.value}
                                        onChange={(e) => handleBudgetChange(sector.id, parseInt(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer accent-white"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="pt-6 border-t border-white/10">
                            <div className="flex items-center gap-4 text-slate-500">
                                <TrendingUp className="w-5 h-5" />
                                <p className="text-xs font-bold uppercase tracking-widest">Modeling: Weighted Impact Probability Engine V4.2</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Predictions */}
                    <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-[3rem] p-10 relative group hover:bg-white/10 transition-all overflow-hidden">
                        <AnimatePresence>
                            {isSimulating && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-gic-blue/10 backdrop-blur-[2px] z-20 flex items-center justify-center"
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        <RefreshCw className="w-10 h-10 text-gic-blue animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gic-blue">Recalculating Impact...</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-12 h-full flex flex-col justify-center">
                            <div className="text-center space-y-6">
                                <div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-2">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Predicted Strategy Impact</span>
                                </div>
                                
                                <div className="relative inline-block">
                                    <svg className="w-56 h-56 transform -rotate-90">
                                        <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                        <motion.circle 
                                            cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="628" 
                                            strokeDashoffset={628 - (628 * prediction.sdi) / 100}
                                            strokeLinecap="round"
                                            className="text-gic-blue shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                            animate={{ strokeDashoffset: 628 - (628 * prediction.sdi) / 100 }}
                                            transition={{ type: "spring", stiffness: 60 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-6xl font-display font-black tracking-tight">{prediction.sdi}%</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Forecast SDI</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Public Sentiment</p>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-gic-gold" />
                                        <span className="text-2xl font-black text-white">{prediction.sentiment}%</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-gic-gold" 
                                            animate={{ width: `${prediction.sentiment}%` }} 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Strategy Shift</p>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1 rounded-lg ${prediction.delta >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                                            <TrendingUp className={`w-5 h-5 ${prediction.delta >= 0 ? 'text-emerald-500' : 'text-rose-500 transform rotate-180'}`} />
                                        </div>
                                        <span className={`text-2xl font-black ${prediction.delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {prediction.delta > 0 ? '+' : ''}{prediction.delta}%
                                        </span>
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase leading-tight italic">Net Stability Delta</p>
                                </div>
                            </div>

                            <button className="w-full py-5 bg-gic-blue hover:bg-blue-600 border border-white/10 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-gic-blue/20">
                                Apply to Provincial Strategy <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
