// src/components/dashboard/PressureCaseFeed.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  Link,
  MapPin,
  TrendingDown,
  TrendingUp,
  Minus,
  Activity,
  Zap,
  Droplets,
  Truck,
  ShieldAlert,
  Clock,
  ExternalLink,
} from "lucide-react";
import { ServicePressureCase } from "@/types/dashboard2";

interface PressureCaseFeedProps {
  signals: ServicePressureCase[];
  loading?: boolean;
}

const DomainIcon = ({ domain }: { domain: string }) => {
  const lowDomain = domain?.toLowerCase() || "";
  if (lowDomain.includes("water") || lowDomain.includes("sanitation"))
    return <Droplets className="w-4 h-4 text-sky-500" />;
  if (lowDomain.includes("electri") || lowDomain.includes("power"))
    return <Zap className="w-4 h-4 text-amber-500" />;
  if (lowDomain.includes("road") || lowDomain.includes("transport"))
    return <Truck className="w-4 h-4 text-indigo-500" />;
  if (lowDomain.includes("safety") || lowDomain.includes("protest"))
    return <ShieldAlert className="w-4 h-4 text-rose-500" />;
  return <Activity className="w-4 h-4 text-slate-400" />;
};

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors = {
    High: "bg-rose-50 text-rose-700 border-rose-100",
    Medium: "bg-amber-50 text-amber-700 border-amber-100",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };
  const style =
    colors[severity as keyof typeof colors] ||
    "bg-slate-50 text-slate-700 border-slate-100";

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${style}`}
    >
      {severity} Severity
    </span>
  );
};

export default function PressureCaseFeed({
  signals,
  loading,
}: PressureCaseFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-slate-100 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!signals || signals.length === 0) {
    return (
      <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          No Operational Pressure Cases Detected
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(signals || []).map((signal, idx) => (
        <motion.div
          key={signal.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group border-l-4 border-l-rose-500"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                <DomainIcon domain={signal.serviceDomain} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">
                    {signal.serviceDomain} friction Detected
                  </h4>
                  {signal.protestIndicator && (
                    <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                      Protest
                    </span>
                  )}
                  {signal.responseIndicator && (
                    <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                      Response
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={signal.severity} />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{" "}
                    {signal.municipality || "Regional"} •{" "}
                    <Clock className="w-3 h-3" />{" "}
                    {signal.publishedDate?.split("T")[0] || "Recently"}
                  </span>
                </div>
              </div>
            </div>
            <a
              href={signal.sourceId}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
            {signal.issueCategory ||
              "Persistent service delivery failure identified via multi-domain signal correlation."}
          </p>

          <div className="flex items-center gap-4 py-3 bg-slate-50/50 rounded-xl px-4">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${signal.serviceFailureIndicator ? "bg-rose-500" : "bg-slate-300"}`}
              />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                Infrastructure Failure
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${signal.citizenPressureIndicator ? "bg-rose-500" : "bg-slate-300"}`}
              />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                Citizen Friction
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${signal.recurrenceIndicator ? "bg-rose-500" : "bg-slate-300"}`}
              />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                Recurrent Issue
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>
                Operational Warning Console | Confidence:{" "}
                {(signal.classificationConfidence * 100).toFixed(0)}%
              </span>
            </div>
            <span>UID: {signal.id.substring(0, 8)}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
