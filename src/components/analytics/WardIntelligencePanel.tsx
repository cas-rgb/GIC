"use client";

import { useEffect, useState } from "react";
import { Users2, ThermometerSun, ShieldAlert, BarChart3, Landmark, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WardIntelligencePanel({ municipality }: { municipality: string }) {
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWardIndex, setActiveWardIndex] = useState(0);

  useEffect(() => {
    async function fetchWards() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/ward-intelligence?municipality=${encodeURIComponent(municipality)}`);
        if (res.ok) {
          const data = await res.json();
          setWards(data.wards || []);
          setActiveWardIndex(0);
        }
      } catch (e) {
        console.error("Ward Mapping Error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchWards();
  }, [municipality]);

  if (loading) {
    return (
      <div className="w-full flex-col h-[400px] flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-3xl animate-pulse">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-xs font-black text-blue-500 tracking-widest uppercase">Decoupling Spatial Data...</p>
      </div>
    );
  }

  if (wards.length === 0) {
      return (
        <div className="w-full h-[200px] flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-500">
          <p className="text-sm font-bold uppercase tracking-widest">No Deep Intelligence Seeded</p>
        </div>
      );
  }

  const activeWard = wards[activeWardIndex];

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col">
      {/* Tab Header Navigation */}
      <div className="border-b border-zinc-800 bg-zinc-950 p-4 overflow-x-auto whitespace-nowrap flex gap-2">
        {wards.map((ward, idx) => (
          <button
            key={idx}
            onClick={() => setActiveWardIndex(idx)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${idx === activeWardIndex ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            Ward {ward.wardNumber}
          </button>
        ))}
      </div>

      {/* Ward Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-8 border-b border-zinc-800 pb-6">
           <div>
             <h3 className="text-3xl font-black text-white leading-none tracking-tight mb-2">{activeWard.wardName}</h3>
             <p className="text-xs font-bold text-zinc-400 tracking-widest uppercase flex items-center gap-2">
                <Landmark className="w-3.5 h-3.5 text-blue-500" /> Ward {activeWard.wardNumber} | {municipality} Grid
             </p>
           </div>
           <div className="text-right">
             <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 block mb-1">Grid Anchor</span>
             <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20 block">
               {activeWard.mapParameters?.centerLat.toFixed(4)}, {activeWard.mapParameters?.centerLng.toFixed(4)}
             </span>
           </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeWardIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            
            {/* Demographics & Culture */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-5 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Users2 className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Demographics & Culture</h4>
              </div>
              <ul className="space-y-3">
                <li>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-0.5">Primary Language & Density</span>
                  <span className="text-xs font-bold text-zinc-300">{activeWard.demographics?.primaryLanguage} | {activeWard.demographics?.populationDensity} Density</span>
                </li>
                <li>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-0.5">Heritage Profile</span>
                  <span className="text-[11px] font-medium leading-relaxed text-zinc-400 block">{activeWard.culture?.heritageProfile}</span>
                </li>
                <li>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-0.5">Community Structures</span>
                  <span className="text-[11px] font-medium text-emerald-400">{activeWard.culture?.communityStructures}</span>
                </li>
              </ul>
            </div>

            {/* Voting & Economy */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Electoral & Economy</h4>
              </div>
              <ul className="space-y-3">
                <li>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-0.5">Dominant Party Matrix</span>
                  <span className="text-xs font-bold text-zinc-300">{activeWard.voting?.dominantParty} ({activeWard.voting?.politicalVolatility})</span>
                </li>
                <li>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-0.5">Voter Turnout</span>
                  <span className="text-sm font-mono text-emerald-400 font-bold">{activeWard.voting?.voterTurnoutPercent}%</span>
                </li>
                <li>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-0.5">Socio-Economic Engine</span>
                  <span className="text-[11px] font-medium text-zinc-400 block">{activeWard.socioEconomicStats?.primaryEconomicDriver} ({activeWard.socioEconomicStats?.medianIncomeBracket})</span>
                </li>
                <li>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-0.5">Unemployment Density</span>
                  <span className="text-sm font-mono text-rose-400 font-bold">{activeWard.socioEconomicStats?.unemploymentPercent}%</span>
                </li>
              </ul>
            </div>

            {/* Weather & Crime */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-5 hover:border-rose-500/30 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Security & Climate Base</h4>
              </div>
              <ul className="space-y-3">
                <li>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-0.5">Safety Index Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono text-white font-bold">{activeWard.crime?.safetyIndex}</span><span className="text-[10px] text-zinc-500 font-bold">/100</span>
                  </div>
                </li>
                <li>
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-500/80 block mb-0.5">Primary Threat Vector</span>
                  <span className="text-[11px] font-bold text-rose-400 leading-snug block">{activeWard.crime?.primarySyndicateOrThreat}</span>
                </li>
                <div className="border-t border-zinc-700 my-3 pt-3" />
                <li>
                  <div className="flex items-center gap-1 mb-1">
                    <ThermometerSun className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Climate Profile</span>
                  </div>
                  <span className="text-xs font-medium text-zinc-300 block">{activeWard.weather?.climateBaseline}</span>
                  <span className="text-[10px] font-bold text-amber-500/80 block mt-1">Risk: {activeWard.weather?.primaryClimateRisk}</span>
                </li>
              </ul>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
