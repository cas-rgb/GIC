"use client";

import { motion } from "framer-motion";
import { Settings2, Sliders, Zap, ShieldCheck, Info, Save } from "lucide-react";
import GICCard from "@/components/ui/GICCard";
import PageHeader from "@/components/ui/PageHeader";

export default function ScoringConfig() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      <PageHeader
        title="System Scoring Configuration"
        subtitle="Calibrate Signal Weights • Strategic Prioritisation logic"
        actions={
          <button className="gic-btn gic-btn-primary flex items-center gap-3">
            <Save className="w-4 h-4 text-gic-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Commit Weights
            </span>
          </button>
        }
      />

      <div className="grid grid-cols-12 gap-8">
        {/* Current Algorithm Summary */}
        <div className="col-span-12">
          <GICCard
            premium
            title="Active Logic Paradigm"
            subtitle="Five-Layer Signal weighting as per 2024 Strategy"
            icon={<Zap className="w-5 h-5" />}
          >
            <div className="p-8 flex items-center justify-between">
              <div className="flex gap-20">
                <LogicPulse label="Core Issues" value="40%" />
                <LogicPulse label="Sentiment Drift" value="15%" />
                <LogicPulse label="Risk Velocity" value="25%" />
                <LogicPulse label="Influence" value="20%" />
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">
                    Integrity Check
                  </p>
                  <p className="text-xs font-bold text-emerald-700">
                    Weights sum to 100% (Nominal)
                  </p>
                </div>
              </div>
            </div>
          </GICCard>
        </div>

        {/* Source Credibility Weights */}
        <div className="col-span-4">
          <GICCard
            title="Source Integrity"
            subtitle="Trust Hierarchy calibration"
            icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
          >
            <div className="p-8 space-y-6">
              <SmallWeight label="Local News" value={1.0} />
              <SmallWeight label="Journalists" value={0.8} />
              <SmallWeight label="NGO/Internal" value={0.6} />
              <SmallWeight label="Social Media" value={0.3} />
            </div>
          </GICCard>
        </div>

        {/* Weight Configuration Sidebar */}
        <div className="col-span-8">
          <GICCard
            title="Weight Calibration"
            subtitle="Adjust real-time influence of signal layers"
            icon={<Sliders className="w-5 h-5" />}
          >
            <div className="p-8 space-y-12">
              <WeightSlider
                label="Issue Intensity"
                description="Historical infrastructure failure data and maintenance logs"
                value={40}
              />
              <WeightSlider
                label="Sentiment Decay"
                description="Public anger and social mobilization signals"
                value={15}
              />
              <WeightSlider
                label="Momentum Acceleration"
                description="How fast a crisis is expanding across districts"
                value={25}
              />
              <WeightSlider
                label="Influencer Footprint"
                description="Narrative shaping by recognized community voices"
                value={20}
              />
            </div>
          </GICCard>
        </div>

        {/* Logic Intelligence Information */}
        <div className="col-span-4 space-y-8">
          <GICCard
            title="Scoring Methodology"
            icon={<Info className="w-5 h-5" />}
          >
            <div className="p-8 space-y-6">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Our prioritisation engine uses a weighted sum of normalized
                signal vectors (0-1).
              </p>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Calculation Formula
                </h4>
                <div className="p-4 bg-slate-50 rounded-2xl font-mono text-[10px] text-gic-blue">
                  Priority = Σ(Signal_i * Weight_i)
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  * Adjusted weights apply to all Community Risk Scores
                  globally.
                </p>
              </div>
            </div>
          </GICCard>

          <div className="p-8 bg-gic-blue rounded-[2rem] text-slate-900">
            <Zap className="w-8 h-8 mb-6" />
            <h3 className="text-xl font-display font-black leading-tight mb-4">
              Recursive AI Balancing
            </h3>
            <p className="text-[11px] font-bold leading-relaxed opacity-80 mb-8">
              Senthinel-AI can auto-suggest weight adjustments based on 36-month
              backtesting vs actual project outcomes.
            </p>
            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">
              Enable Auto-Leveling
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogicPulse({ label, value }: any) {
  return (
    <div className="text-center">
      <p className="text-4xl font-display font-black text-slate-900 tracking-tighter mb-1">
        {value}
      </p>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
        {label}
      </p>
    </div>
  );
}

function WeightSlider({ label, description, value }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="max-w-md">
          <h3 className="text-sm font-black text-slate-900 mb-1">{label}</h3>
          <p className="text-[11px] text-slate-400 font-medium leading-none">
            {description}
          </p>
        </div>
        <span className="text-2xl font-display font-black text-gic-blue tracking-tighter">
          {value}%
        </span>
      </div>
      <div className="h-4 bg-slate-100 rounded-full relative overflow-hidden group">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-gic-blue to-blue-400 transition-all group-hover:from-gic-blue group-hover:to-gic-blue"
          style={{ width: `${value}%` }}
        />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-6 h-6 bg-white border-4 border-gic-blue rounded-full shadow-lg transform -translate-x-1/2" />
      </div>
    </div>
  );
}

function SmallWeight({ label, value }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gic-blue"
            style={{ width: `${value * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-900 w-8 text-right">
          {(value * 10).toFixed(1)}
        </span>
      </div>
    </div>
  );
}
