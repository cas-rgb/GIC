import { AlertTriangle, Users2, Target, ShieldAlert, BarChart3, AlertCircle } from "lucide-react";

interface BriefingIntel {
  alignments: string;
  primaryLeader: string;
  blindspots: string[];
  citizenPriorities: string[];
  status: string;
}

export default function ProvinceExecutiveBriefing({ province, data }: { province: string, data?: BriefingIntel | null }) {
  const pName = province === "All Provinces" || !province ? "Gauteng" : province;

  if (!data) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <AlertCircle className="w-12 h-12 text-rose-500/50 mb-4" />
        <p className="text-sm font-bold text-zinc-300">Intelligence Stream Offline</p>
        <p className="mt-2 text-[10px] uppercase font-black tracking-widest text-slate-500 text-center max-w-sm">
           The AI tactical synthesis for {pName} failed to aggregate. Verify OSINT pipeline connectivity.
        </p>
      </div>
    );
  }

  const intel = data;

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
