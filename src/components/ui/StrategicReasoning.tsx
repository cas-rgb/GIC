import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Fingerprint,
  Database,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Activity,
  Loader2,
} from "lucide-react";
import { getLiveStrategicReasoning } from "@/app/intel-actions";
import { StrategicReasoning as StrategicReasoningType } from "@/types";

export default function StrategicReasoning() {
  const [reasoning, setReasoning] = useState<StrategicReasoningType | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchReasoning = async () => {
    setIsLoading(true);
    try {
      const res = await getLiveStrategicReasoning();
      if (res.success && res.reasoning) {
        setReasoning(res.reasoning);
      }
    } catch (error) {
      console.error("Failed to fetch strategic reasoning:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReasoning();
  }, []);

  if (isLoading || !reasoning) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/5 rounded-[2.5rem] border border-slate-100">
        <Loader2 className="w-10 h-10 text-gic-blue animate-spin mb-6" />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] animate-pulse">
          Compiling Cross-Sector Intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gic-blue/10 flex items-center justify-center border border-gic-blue/20">
            <BrainCircuit className="w-5 h-5 text-gic-blue" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-none">
              AI Strategic Synthesis
            </h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
              Focus: {reasoning.primaryNode}
            </p>
          </div>
        </div>
        <button
          onClick={fetchReasoning}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors group"
        >
          <Fingerprint className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
            Re-Verify Signals
          </span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {reasoning.groundingData.map((data, i) => (
          <div
            key={i}
            className="p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <Database className="w-10 h-10" />
            </div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
              {data.label}
            </p>
            <p className="text-xl font-display font-bold text-slate-900">
              {data.value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
          AI Reasoning Steps
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={reasoning.primaryNode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {reasoning.reasoningSteps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="relative pl-8 pb-6 last:pb-0"
              >
                {i !== reasoning.reasoningSteps.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-100" />
                )}

                <div className="absolute left-0 top-1 w-[24px] h-[24px] rounded-full bg-white border-2 border-slate-200 flex items-center justify-center z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-gic-blue" />
                </div>

                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 hover:border-gic-blue/30 transition-all hover:shadow-md group">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold text-slate-900">
                      {step.title}
                    </h5>
                    <span className="text-[8px] font-black text-gic-blue uppercase tracking-widest px-2 py-0.5 bg-gic-blue/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {step.impact}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 p-6 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Cpu className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-gic-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gic-blue">
              Synthesis Result
            </span>
          </div>
          <h4 className="text-lg font-bold mb-2">
            Confidence Alignment: {Math.round(reasoning.logicStrength * 100)}%
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-6 max-w-sm">
            This reasoning is grounded in {reasoning.groundingData.length} live
            signals across the National Corridor. Cross-sector impact verified
            via GIC Institutional Engine.
          </p>
          <button className="flex items-center gap-2 px-6 py-3 bg-gic-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-gic-neon hover:scale-105 transition-transform">
            <span>Deploy Strategy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
