"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Users2, Target, ShieldAlert, BarChart3 } from "lucide-react";
import ProgressSpinner from "@/components/ui/ProgressSpinner";

interface BriefingIntel {
  alignments: string;
  primaryLeader: string;
  blindspots: string[];
  citizenPriorities: string[];
  status: string;
}

export default function ProvinceExecutiveBriefing({ province }: { province: string }) {
  const [intel, setIntel] = useState<BriefingIntel | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract the exact match
  const pName = province === "All Provinces" || !province ? "Gauteng" : province;

  useEffect(() => {
    let isSubscribed = true;
    setLoading(true);

    fetch(`/api/analytics/province-briefing?province=${encodeURIComponent(pName)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch Province Briefing");
        return res.json();
      })
      .then((data: BriefingIntel) => {
        if (isSubscribed) {
          setIntel(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Strategic Briefing Error:", err);
        if (isSubscribed) {
          // Absolute fallback if Gemini fails
          setIntel({
            alignments: `Provincial Executive Governance in ${pName}`,
            primaryLeader: `Regional Leadership - ${pName}`,
            blindspots: [
              `Unverified infrastructure maintenance backlogs specific to ${pName}`,
              `Vulnerability of ${pName} to extreme cyclical weather events`,
              `Local procurement delays and tender disputes across ${pName}`
            ],
            citizenPriorities: [
              `Consistent utility delivery and billing within ${pName} municipalities`,
              `Local economic opportunities and youth employment programs for ${pName}`,
              `General community policing visibility in high-risk ${pName} domains`
            ],
            status: "Baseline Monitoring"
          });
          setLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [pName]);

  if (loading || !intel) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <ProgressSpinner 
           durationMs={5000} 
           message={`Compiling Real-Time Report for ${pName}...`} 
        />
        <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-slate-500">
           Aggregating Regional Ground-Truth Metrics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 grid grid-cols-1 xl:grid-cols-3 gap-6 h-full items-start">
      
      {/* Political Matrix */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-blue-500/50 transition-colors h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Users2 className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">Political Architecture</h3>
            <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-wider">Leadership Matrix</p>
          </div>
        </div>
        
        <div className="mt-2 space-y-4 flex-1">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Office of the Premier</span>
            <span className="text-sm font-bold text-white block bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50">{intel.primaryLeader}</span>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Coalition / Majority Posture</span>
            <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-widest block bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">{intel.alignments}</span>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-1">State of Governance</span>
            <span className="text-xs font-bold text-zinc-300 block">{intel.status}</span>
          </div>
        </div>
      </div>

      {/* Strategic Awareness (Blindspots) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-rose-500/50 transition-colors h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">Strategic Blindspots</h3>
            <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-wider">What leadership must monitor</p>
          </div>
        </div>
        <ul className="space-y-3 mt-2 flex-1">
          {intel.blindspots.map((b: string, i: number) => (
             <li key={i} className="flex gap-3 text-xs font-medium text-zinc-300 items-start bg-zinc-800/30 p-2.5 rounded-xl border border-zinc-800">
               <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
               <span className="leading-relaxed">{b}</span>
             </li>
          ))}
        </ul>
      </div>

      {/* Citizen Priorities */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-emerald-500/50 transition-colors h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">Citizen Demands</h3>
            <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-wider">Primary electoral grievances</p>
          </div>
        </div>
        <ul className="space-y-3 mt-2 flex-1">
          {intel.citizenPriorities.map((c: string, i: number) => (
             <li key={i} className="flex gap-3 text-xs font-medium text-zinc-300 items-start bg-zinc-800/30 p-2.5 rounded-xl border border-zinc-800">
               <BarChart3 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
               <span className="leading-relaxed">{c}</span>
             </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
