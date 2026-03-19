"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Hammer, Users } from "lucide-react";

interface ServiceDeliveryIndexProps {
  score?: number;
  components?: {
    infrastructure: number;
    health: number;
    safety: number;
    social: number;
  };
}

export default function ServiceDeliveryIndex({
  score = 78,
  components = {
    infrastructure: 82,
    health: 74,
    safety: 68,
    social: 88,
  },
}: ServiceDeliveryIndexProps) {
  return (
    <div className="p-8 bg-white border border-slate-200 rounded-[3rem] h-full flex flex-col">
      <div className="flex justify-between items-start mb-10">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Institutional Metric
          </p>
          <h3 className="text-2xl font-display font-black text-slate-900">
            Service Delivery Index (SDI)
          </h3>
        </div>
        <div className="px-4 py-2 bg-gic-blue/10 rounded-2xl">
          <span className="text-xl font-black text-gic-blue">{score}%</span>
        </div>
      </div>

      <div className="flex-1 space-y-8">
        {/* Main Gauge Visual */}
        <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gic-blue shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          />
        </div>

        {/* Sub-Metric Grids */}
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: "Infrastructure",
              val: components.infrastructure,
              icon: Hammer,
              color: "text-blue-500",
              bg: "bg-blue-50",
            },
            {
              label: "Public Health",
              val: components.health,
              icon: Activity,
              color: "text-emerald-500",
              bg: "bg-emerald-50",
            },
            {
              label: "Public Safety",
              val: components.safety,
              icon: ShieldCheck,
              color: "text-rose-500",
              bg: "bg-rose-50",
            },
            {
              label: "Social Cohesion",
              val: components.social,
              icon: Users,
              color: "text-amber-500",
              bg: "bg-amber-50",
            },
          ].map((m, i) => (
            <div
              key={i}
              className="p-5 border border-slate-100 rounded-[2rem] hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 ${m.bg} rounded-xl`}>
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {m.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900">
                  {m.val}%
                </span>
                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.val}%` }}
                    className={`h-full ${m.color.replace("text", "bg")}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[200px]">
          SDI is a synthesized metric reflecting real-time signal density and
          project delivery confidence.
        </p>
        <button className="text-[10px] font-black uppercase tracking-widest text-gic-blue hover:underline">
          View Methodology
        </button>
      </div>
    </div>
  );
}
