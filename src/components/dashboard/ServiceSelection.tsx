"use client";

import { motion } from "framer-motion";
import {
  Droplets,
  Truck,
  HeartPulse,
  Building2,
  Construction,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Zap,
  Activity,
} from "lucide-react";

interface ServiceArea {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  category: string;
  metrics: {
    risk: number;
    sentiment: number;
    volume: number;
  };
}

// Helper for live-looking random metrics
const dbServiceMetrics: any = {
  water: { risk: 82 },
  roads: { risk: 64 },
  health: { risk: 12 },
};

export const serviceAreas: ServiceArea[] = [
  {
    id: "water",
    title: "Water & Sewerage",
    description: "Critical supply & wastewater integrity.",
    icon: Droplets,
    color: "blue",
    category: "Civil",
    metrics: {
      risk: dbServiceMetrics["water"]?.risk || 42,
      sentiment: 45,
      volume: 1240,
    },
  },
  {
    id: "roads",
    title: "Roads & Works",
    description: "Transport network & logistical flow.",
    icon: Truck,
    color: "emerald",
    category: "Roads",
    metrics: {
      risk: dbServiceMetrics["roads"]?.risk || 68,
      sentiment: 32,
      volume: 842,
    },
  },
  {
    id: "health",
    title: "Health Infrastructure",
    description: "Facility capacity & medical supply chain.",
    icon: HeartPulse,
    color: "rose",
    category: "Health",
    metrics: {
      risk: dbServiceMetrics["health"]?.risk || 15,
      sentiment: 78,
      volume: 210,
    },
  },
  {
    id: "planning",
    title: "Town Planning",
    description: "Urban growth & settlement development.",
    icon: Building2,
    color: "amber",
    category: "Planning",
    metrics: { risk: 28, sentiment: 55, volume: 312 },
  },
  {
    id: "structural",
    title: "Structural Systems",
    description: "Housing safety & structural monitoring.",
    icon: Construction,
    color: "indigo",
    category: "Structural",
    metrics: { risk: 34, sentiment: 62, volume: 145 },
  },
  {
    id: "apex",
    title: "Integrated Strategic Overview",
    description: "Unified command & cross-service risk assessment.",
    icon: ShieldCheck,
    color: "slate",
    category: "Apex",
    metrics: { risk: 55, sentiment: 48, volume: 3283 },
  },
];

interface ServiceSelectionProps {
  onSelect: (service: ServiceArea) => void;
}

export default function ServiceSelection({ onSelect }: ServiceSelectionProps) {
  return (
    <div className="min-h-screen bg-white overflow-y-auto scrollbar-hide pb-20">
      {/* 1. REPORT HUB HEADER */}
      <div className="bg-white border-b border-gray-200 px-20 py-16">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="flex items-center gap-3 text-[10px] font-black text-gic-blue uppercase tracking-[0.4em]">
            <ShieldCheck className="w-4 h-4" />
            <span>Institutional Governance Framework</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">
            National Infrastructure Oversight Report
          </h1>
          <div className="flex items-center gap-8 pt-4">
            <div className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold uppercase tracking-widest text-xs border border-gray-200">
              Sectoral Compliance Hub
            </div>
            <div className="flex items-center gap-3 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Data Systems: Synchronized
            </div>
          </div>
        </div>
      </div>

      {/* 2. OVERVIEW KPI SCORECARDS */}
      <div className="max-w-[1600px] mx-auto px-20 -mt-12 relative z-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            label: "Highest Regional Risk",
            value: "82%",
            target: "Gauteng Water",
            icon: AlertCircle,
            color: "text-red-500",
          },
          {
            label: "Narrative Velocity",
            value: "+14%",
            target: "Roads / Works",
            icon: TrendingUp,
            color: "text-blue-500",
          },
          {
            label: "Audit Coverage",
            value: "98.4%",
            target: "Active Mandate",
            icon: Zap,
            color: "text-gray-400",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-xl bg-gray-50 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                {item.label}
              </span>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">
              {item.value}
            </div>
            <div className="text-sm font-bold text-gray-500 tracking-tight">
              {item.target}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. SECTORAL REPORT CATALOG */}
      <div className="max-w-[1600px] mx-auto p-20 space-y-16">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
            Sectoral Report Hub
          </h2>
          <p className="text-lg font-bold text-gray-400 leading-tight max-w-2xl pt-2">
            Select a specialized infrastructure sector to access deep-dive
            compliance audits and real-time intervention framing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {serviceAreas.map((service, i) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(service)}
              className="bg-white p-10 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all text-left flex flex-col h-full group"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <service.icon className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-black uppercase tracking-widest text-gray-300">
                    Report ID
                  </div>
                  <div className="text-xs font-bold text-gray-500">
                    {service.id.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm font-bold text-gray-400 leading-snug">
                  {service.description}
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Operational Risk
                  </div>
                  <div
                    className={`text-2xl font-black ${service.metrics.risk > 60 ? "text-red-600" : "text-gray-900"}`}
                  >
                    {service.metrics.risk}%
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">
                    Audit Volume
                  </div>
                  <div className="text-2xl font-black text-gray-900">
                    {service.metrics.volume.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-blue-500 transition-all" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 4. INSTITUTIONAL FOOTER */}
      <div className="mx-20 p-20 bg-slate-900 rounded-[4rem] text-center border-[8px] border-slate-100">
        <div className="flex justify-center gap-12 text-white/40 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Search: Grounded
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gic-blue" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Vertex AI: Optimized
            </span>
          </div>
        </div>
        <h2 className="text-display-md text-white mb-6">
          GIC | Community Intelligence Platform
        </h2>
        <p className="text-xl text-white/50 font-medium">
          Strategic Infrastructure Governance for the Gauteng Infrastructure
          Company.
        </p>
      </div>
    </div>
  );
}
