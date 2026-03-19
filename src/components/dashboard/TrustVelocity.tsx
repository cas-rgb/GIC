"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, Globe } from "lucide-react";

interface TrustVelocityProps {
  velocity?: number; // Rate of change
  currentTrust?: number;
  history?: number[];
}

export default function TrustVelocity({
  velocity = 12.4, // Positive velocity
  currentTrust = 72,
  history = [65, 68, 66, 70, 72, 71, 72],
}: TrustVelocityProps) {
  const isPositive = velocity > 0;

  return (
    <div className="p-8 bg-slate-900 text-white rounded-[3rem] border border-white/10 h-full flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div
        className={`absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-20 ${isPositive ? "bg-emerald-500" : "bg-rose-500"}`}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Capital Sentiment
            </p>
            <h3 className="text-2xl font-display font-black">
              Trust Velocity™
            </h3>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? "+" : ""}
            {velocity}% Momentum
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-8">
          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-display font-black tracking-tighter">
              {currentTrust}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Aggregate
              </span>
              <span className="text-sm font-bold text-white/50 italic">
                Public Confidence Level
              </span>
            </div>
          </div>

          {/* Simple Sparkline */}
          <div className="h-24 flex items-end gap-1 px-2">
            {history.map((val, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(val / 100) * 100}%` }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className={`flex-1 rounded-t-lg ${i === history.length - 1 ? (isPositive ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-rose-500") : "bg-white/10"}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
              Source: verified News
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
              Network reach: 1.2M
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
