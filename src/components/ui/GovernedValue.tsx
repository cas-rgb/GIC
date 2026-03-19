"use client";

import React from "react";
import { GovernedMetric } from "@/lib/reporting-schema";
import {
  Info,
  Database,
  AlertCircle,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sparkline from "@/components/analytics/Sparkline";

interface GovernedValueProps {
  metric: GovernedMetric<any>;
  className?: string;
  valueClassName?: string;
  showTrace?: boolean;
  sparklineData?: number[];
  trend?: "up" | "down" | "stable";
}

export default function GovernedValue({
  metric,
  className = "",
  valueClassName = "",
  showTrace = false,
  sparklineData,
  trend,
}: GovernedValueProps) {
  if (!metric) {
    return (
      <div className={`flex flex-col gap-2 ${className} animate-pulse`}>
        <div className="h-3 w-24 bg-slate-100 rounded" />
        <div className="h-6 w-32 bg-slate-200 rounded" />
      </div>
    );
  }

  const isInsufficient =
    metric.rating === "INSUFFICIENT" || metric.value === null;

  const ratingColors = {
    HIGH: "text-emerald-500",
    PARTIAL: "text-amber-500",
    LOW: "text-rose-500",
    INSUFFICIENT: "text-slate-400",
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
          {metric.label}
          {metric.rating === "HIGH" && (
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
          )}
        </label>

        <div
          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${ratingColors[metric.rating]} border-current opacity-70`}
        >
          {metric.rating === "INSUFFICIENT"
            ? "Awaiting Data"
            : `${metric.rating} CONFIDENCE`}
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        {isInsufficient ? (
          <span
            className={`text-slate-400 italic text-sm font-medium ${valueClassName}`}
          >
            {metric.governanceNote || "Insufficient data"}
          </span>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span
                className={`text-slate-900 font-black tracking-tighter ${valueClassName}`}
              >
                {typeof metric.value === "number"
                  ? metric.value.toLocaleString()
                  : metric.value}
              </span>
              {metric.unit && (
                <span className="text-xs font-bold text-slate-400">
                  {metric.unit}
                </span>
              )}
            </div>

            {trend && (
              <div
                className={`p-1 rounded-full ${
                  trend === "up"
                    ? "bg-rose-50 text-rose-500"
                    : trend === "down"
                      ? "bg-emerald-50 text-emerald-500"
                      : "bg-slate-50 text-slate-400"
                }`}
              >
                {trend === "up" ? (
                  <ChevronUp className="w-3 h-3" />
                ) : trend === "down" ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {!isInsufficient && sparklineData && sparklineData.length > 1 && (
        <div className="mt-3">
          <Sparkline
            data={sparklineData}
            color={
              metric.rating === "HIGH"
                ? "#10b981"
                : metric.rating === "PARTIAL"
                  ? "#f59e0b"
                  : "#D0A700"
            }
          />
        </div>
      )}

      {showTrace && (metric.trace || []).length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 space-y-2">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Database className="w-3 h-3" /> Data Lineage
          </p>
          <div className="space-y-1">
            {(metric.trace || []).map((t, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-[9px] font-medium text-slate-500"
              >
                <span>{t.table}</span>
                <span className="text-slate-300">n={t.sourceCount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {metric.governanceNote && (
        <p className="text-[9px] text-slate-400 italic mt-1">
          Note: {metric.governanceNote}
        </p>
      )}
    </div>
  );
}
