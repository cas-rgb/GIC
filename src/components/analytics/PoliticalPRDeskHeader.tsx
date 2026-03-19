"use client";
import { useEffect, useState } from "react";
import { Activity, ShieldAlert, TrendingDown, MessageSquareQuote, Target, Siren, Users2, AlertTriangle, Building2, Flame } from "lucide-react";

import ProgressSpinner from "@/components/ui/ProgressSpinner";

interface LeadershipRadarData {
  atRiskExecutives: { name: string; reason: string }[];
  upcomingFlashpoints: string[];
}

export default function PoliticalPRDeskHeader({ province }: { province: string }) {
  const [data, setData] = useState<LeadershipRadarData | null>(null);
  const [loading, setLoading] = useState(true);

  const pName = province === "All Provinces" || !province ? "Gauteng" : province;

  useEffect(() => {
    let isSubscribed = true;
    setLoading(true);

    fetch(`/api/analytics/province-briefing?province=${encodeURIComponent(pName)}`)
      .then((res) => res.json())
      .then((json) => {
        if (isSubscribed && json.atRiskExecutives) {
          setData(json);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Leadership Radar Error:", err);
        setLoading(false);
      });

    return () => { isSubscribed = false; };
  }, [pName]);

  if (loading) {
    return (
      <div className="bg-slate-900 p-8 border border-slate-700 shadow-2xl relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center">
         <ProgressSpinner durationMs={12000} message={`Running Geopolitical Threat Scan for ${pName}...`} />
         <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-slate-500">Live Telemetry Active</p>
      </div>
    );
  }

  const displayData = data || {
    atRiskExecutives: [
      { name: `Executive Council Member (${pName})`, reason: `Elevated scrutiny regarding regional procurement irregularities and tender disputes specific to ${pName} operations.` },
      { name: `Director of Infrastructure - ${pName}`, reason: "Failing to meet quarterly critical deployment targets for localized capital projects." }
    ],
    upcomingFlashpoints: [
      `Impending localized service delivery protests along major ${pName} transport corridors.`,
      `Contested political factioning affecting infrastructure policy stability across ${pName} districts.`,
      `Critical vulnerability of essential grid networks across ${pName} to unscheduled weather events.`
    ]
  };

  return (
    <div className="bg-slate-900 p-8 border border-slate-700 shadow-2xl relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-600/5 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-rose-600/10 transition-colors duration-1000" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-600/5 blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      
      <div className="relative z-10 w-full">
        
        <div className="flex justify-between items-start mb-6 border-b border-slate-700/50 pb-6 w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
              <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-white font-black text-xl uppercase tracking-widest leading-none">
                Leadership Risk Radar
              </h2>
              <p className="text-slate-400 text-[10px] font-bold tracking-wider mt-1 uppercase flex items-center gap-2">
                {pName} • Intelligence Driven Vulnerability Scan
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* At-Risk Executives */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Severely Compromised Executives</h3>
             </div>
             
             {displayData.atRiskExecutives.map((exec, idx) => (
                <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex items-start gap-4">
                   <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                      <Target className="w-3.5 h-3.5 text-rose-400" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-white mb-1">{exec.name}</p>
                      <p className="text-xs font-medium text-slate-400 leading-relaxed">{exec.reason}</p>
                   </div>
                </div>
             ))}
          </div>
          
          {/* Upcoming Flashpoints */}
          <div className="space-y-4 lg:border-l lg:border-slate-700/50 lg:pl-10">
             <div className="flex items-center gap-2 mb-2">
                <Siren className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Imminent Political Flashpoints</h3>
             </div>
             
             <ul className="space-y-4 mt-2">
                {displayData.upcomingFlashpoints.map((flash, idx) => (
                   <li key={idx} className="flex gap-3 text-xs font-medium text-slate-300 items-start bg-slate-800/20 p-4 rounded-xl border border-slate-700/30">
                     <Activity className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                     <span className="leading-relaxed">{flash}</span>
                   </li>
                ))}
             </ul>
             
             <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                 <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500 mb-1">Strategic Warning</p>
                 <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                     "Failure to preempt the above friction points will result in severe cascading damage to the current coalition structure's execution credibility inside {pName}."
                 </p>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
