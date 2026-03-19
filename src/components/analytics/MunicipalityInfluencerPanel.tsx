"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Activity, Target, ShieldAlert, Cpu } from "lucide-react";

type Influencer = {
  name: string;
  platform: string;
  focus: string;
  impact: number;
  why: string;
};

export default function MunicipalityInfluencerPanel({
  province,
  municipality,
}: {
  province: string;
  municipality?: string | null;
}) {
  const [data, setData] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInfluencers() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ province });
        if (municipality && municipality !== "All Municipalities") {
          params.set("municipality", municipality);
        }
        
        const res = await fetch(`/api/analytics/municipality-influencers?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.influencers || []);
        }
      } catch (error) {
        console.error("Failed to load influencer map", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInfluencers();
  }, [province, municipality]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-lg animate-pulse min-h-[300px]">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">
            Compiling Local Power Brokers & Field Targets...
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative font-sans">
      <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-800/50">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-3">
             Public Influencer Matrix
             <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Generative Synthesis of {municipality && municipality !== "All Municipalities" ? municipality : province} Power Brokers
          </p>
        </div>
        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item, i) => (
          <motion.div
            key={item.name + i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 bg-slate-800/80 border border-slate-700 rounded-xl flex flex-col justify-between shadow-sm relative group hover:border-blue-500/50 transition-colors"
          >
            <div>
              <div className="flex justify-between items-start mb-4 border-b border-slate-700/50 pb-3">
                <div className="flex items-center gap-3 pr-2">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 text-blue-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-white leading-tight">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                      {item.platform}
                    </span>
                  </div>
                </div>
                <div className="px-2 py-1 bg-slate-900 text-red-400 text-[10px] font-black rounded border border-red-500/30 uppercase shrink-0">
                  Leverage: {item.impact}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3 text-amber-500" />
                  Strategic Role: <span className="text-slate-300">{item.focus}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-slate-600 pl-3">
                  "{item.why}"
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
         <Cpu className="w-4 h-4 text-blue-500" />
         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Real-time web indexing • Processed via GIC Institutional Matrix
         </p>
      </div>
    </div>
  );
}
