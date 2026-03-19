"use client";

import { motion } from "framer-motion";
import {
  Zap,
  BarChart3,
  ArrowUpRight,
  AlertCircle,
  Target,
  Users,
} from "lucide-react";

import { StrategicInsights } from "@/types";

interface DecisionHubProps {
  serviceId: string;
  strategicInsights: StrategicInsights | null;
  isLoading: boolean;
}

export default function DecisionHub({
  serviceId,
  strategicInsights,
  isLoading,
}: DecisionHubProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-8">
        <div className="h-40 bg-gray-50 rounded-2xl border border-gray-100" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-gray-50 rounded-2xl border border-gray-100" />
          <div className="h-64 bg-gray-50 rounded-2xl border border-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-8 overflow-y-auto scrollbar-hide font-sans">
      {/* Critical Sector Status Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap className="w-32 h-32 text-blue-500" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
              Sector Report Hub
            </span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase mb-4 leading-none">
            {strategicInsights?.serviceName || "Strategic Intelligence"} Report
          </h2>
          <p className="text-gray-500 text-xs max-w-xl font-bold italic">
            Situational awareness grounded in{" "}
            {strategicInsights?.totalDatabaseStrength || 0} regional signals
            signatures.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Similarity Matrix */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50/50 p-8 rounded-2xl border border-gray-200 flex flex-col shadow-sm"
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Similarity Matrix
              </h3>
              <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight mt-1">
                Proven Blueprints
              </p>
            </div>
            <Target className="w-5 h-5 text-blue-500" />
          </div>

          <div className="space-y-4 flex-1">
            {strategicInsights?.lookalikes?.map((l: any, i: number) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-blue-400 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      {l.target} Case
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
                        Matches {l.matchTo}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-blue-600">
                      {l.score}%
                    </p>
                    <div className="w-12 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${l.score}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed font-bold italic mb-4">
                  "{l.reason}"
                </p>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Zap className="w-2.5 h-2.5 text-blue-500" />
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                    Protocol: {l.respondsTo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Silent Demand zones */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50/50 p-8 rounded-2xl border border-gray-200 flex flex-col shadow-sm"
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Silent Demand
              </h3>
              <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight mt-1">
                Expansion Risk Map
              </p>
            </div>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>

          <div className="space-y-3 flex-1">
            {strategicInsights?.silentDemand?.map((d: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 transition-all"
              >
                <div>
                  <p className="text-xs font-black text-gray-900 uppercase tracking-tight mb-1">
                    {d.name}
                  </p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    {d.totalSignals} Signals
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-red-600 uppercase tracking-tighter mb-1">
                    {d.riskLevel}% Pressure
                  </p>
                  <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${d.riskLevel}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
