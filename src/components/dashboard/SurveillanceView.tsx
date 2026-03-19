"use client";

import { useState } from "react";
import SurveillanceMap from "@/components/maps/SurveillanceMap";
import GICCard from "@/components/ui/GICCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint,
  Activity,
  Database,
  ShieldAlert,
  Cpu,
  BarChart3,
  Layers,
  MapPin,
  ArrowUpRight,
  Target,
} from "lucide-react";

export default function SurveillanceView() {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[800px]">
      {/* Left Pane: Surveillance Map */}
      <div className="lg:col-span-8 h-full bg-slate-950 rounded-[3rem] border border-white/5 relative group overflow-hidden shadow-gic-neon">
        <SurveillanceMap onNodeSelect={setSelectedNode} />
      </div>

      {/* Right Pane: Dataset Intelligence Sidebar */}
      <div className="lg:col-span-4 h-full flex flex-col gap-6">
        <GICCard
          premium
          title="Node Intelligence"
          subtitle="Strategic Dataset Response"
          icon={<Fingerprint className="w-5 h-5" />}
          className="flex-1 overflow-auto"
        >
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Selected Node Identifying Information */}
                <div className="p-6 bg-slate-900 border border-white/10 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl -mr-12 -mt-12" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-2 block">
                    {selectedNode.category || "Dataset Entry"}
                  </span>
                  <h4 className="text-2xl font-black text-white leading-tight mb-4">
                    {selectedNode.projectName ||
                      selectedNode.name ||
                      "Strategic Data Node"}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black text-slate-400 uppercase">
                      {selectedNode.municipality}
                    </div>
                    {selectedNode.ward && (
                      <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black text-slate-400 uppercase">
                        Ward {selectedNode.ward}
                      </div>
                    )}
                  </div>
                </div>

                {/* Raw Metadata Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                      Risk Index
                    </p>
                    <p className="text-xl font-black text-slate-900">
                      {selectedNode.riskLevel || "74.2"}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                      Confidence
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-black text-slate-900">0.92</p>
                      <Activity className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Attribute Feed */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    Comprehensive Attributes
                  </h5>
                  <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-6">
                    {Object.entries(selectedNode)
                      .filter(
                        ([k]) =>
                          !["id", "lat", "lng", "projectName", "name"].includes(
                            k,
                          ),
                      )
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                        >
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="text-[11px] font-bold text-slate-700 text-right max-w-[150px] break-words">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Action HUD */}
                <div className="grid grid-cols-1 gap-4">
                  <button className="gic-btn gic-btn-primary py-4 w-full flex items-center justify-center gap-3">
                    <Cpu className="w-4 h-4" />
                    Trigger Strategic Synthesis
                  </button>
                  <button className="py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                    Link to Regional Portfolio
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center mb-6">
                  <Target className="w-10 h-10 text-slate-300 animate-pulse" />
                </div>
                <h4 className="text-slate-900 font-black mb-2">
                  Awaiting Node Selection
                </h4>
                <p className="text-xs text-slate-400 max-w-[200px] font-medium leading-relaxed">
                  Select an active surveillance point on the map to extract
                  high-fidelity intelligence.
                </p>
              </div>
            )}
          </AnimatePresence>
        </GICCard>

        {/* System Stats HUD */}
        <div className="p-8 bg-slate-950 rounded-[2.5rem] border border-white/5 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Active Monitoring
              </p>
              <p className="text-lg font-black tracking-tight">
                Real-Time Context
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[8px] font-black text-blue-400 uppercase">
              Polling
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
