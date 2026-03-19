"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
} from "lucide-react";

import { RiskIndicator } from "@/types";

export default function RiskMatrix({ risks }: { risks: RiskIndicator[] }) {
  if (!risks || risks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 h-full flex items-center justify-center border border-gray-200 text-gray-400 font-bold uppercase tracking-widest text-xs">
        Predictive Risk Modeling Active...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 h-full border border-gray-200 shadow-sm overflow-hidden flex flex-col font-sans">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
        <div className="p-3 bg-gray-100 text-gray-500 rounded-xl border border-gray-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
            Predictive Risk Matrix
          </h2>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Escalation Probability Audit
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
        {risks.map((risk, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`p-5 rounded-xl border transition-all ${
              risk.escalationProbability > 0.7
                ? "bg-red-50/50 border-red-100"
                : risk.escalationProbability > 0.4
                  ? "bg-amber-50/50 border-amber-100"
                  : "bg-green-50/50 border-green-100"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-black text-gray-900 uppercase tracking-tight text-md leading-none">
                    {risk.issue}
                  </h3>
                  {risk.isEmerging && (
                    <span className="bg-gray-900 text-white text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">
                      Emerging
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {risk.trendTrajectory === "rising" ? (
                    <TrendingUp className="w-3 h-3 text-red-600" />
                  ) : risk.trendTrajectory === "falling" ? (
                    <TrendingDown className="w-3 h-3 text-green-600" />
                  ) : (
                    <Minus className="w-3 h-3 text-gray-400" />
                  )}
                  <span
                    className={`text-[8px] font-black uppercase tracking-widest ${
                      risk.trendTrajectory === "rising"
                        ? "text-red-600"
                        : risk.trendTrajectory === "falling"
                          ? "text-green-600"
                          : "text-gray-400"
                    }`}
                  >
                    {risk.trendTrajectory}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[7px] font-black text-gray-400 uppercase tracking-widest">
                  <span>Escalation</span>
                  <span className="text-gray-900">
                    {Math.round(risk.escalationProbability * 100)}%
                  </span>
                </div>
                <div className="h-1 bg-white rounded-full overflow-hidden border border-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${risk.escalationProbability * 100}%` }}
                    className={`h-full ${
                      risk.escalationProbability > 0.7
                        ? "bg-red-600"
                        : risk.escalationProbability > 0.4
                          ? "bg-amber-500"
                          : "bg-green-600"
                    }`}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[7px] font-black text-gray-400 uppercase tracking-widest">
                  <span>Media Pickup</span>
                  <span className="text-gray-900">
                    {Math.round(risk.mediaPickupLikelihood * 100)}%
                  </span>
                </div>
                <div className="h-1 bg-white rounded-full overflow-hidden border border-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${risk.mediaPickupLikelihood * 100}%` }}
                    className="h-full bg-blue-600"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
