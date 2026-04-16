"use client";
import { AlertTriangle, TrendingUp, TrendingDown, Radio } from "lucide-react";
interface UrgentNarrativeTrackerHeaderProps {
  province: string;
  narratives?: {
    id: string;
    title: string;
    status: string;
    threat: string;
    description: string;
    platform?: string;
  }[];
}

export default function UrgentNarrativeTrackerHeader({
  province,
  narratives = []
}: UrgentNarrativeTrackerHeaderProps) {
  return ( 
    <div className="bg-slate-900 border border-slate-700 p-6 shadow-xl mb-6 relative overflow-hidden"> 
      {/* Decor */} 
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/10 blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" /> 
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-700 pb-6 mb-6"> 
        <div> 
          <h3 className="text-2xl font-black text-white flex items-center gap-2"> 
            <Radio className="w-6 h-6 text-red-500 animate-pulse" /> 
            Urgent Narrative Tracker 
          </h3> 
          <p className="text-sm text-slate-400 font-medium mt-1"> 
            Live digital storylines carrying the highest reputational risk in {province}. 
          </p> 
        </div> 
      </div> 
      
      {narratives.length === 0 ? (
        <div className="relative z-10 flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-lg min-h-[150px]">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">[ AWAITING URGENT NARRATIVE VECTORS ]</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10"> 
          {narratives.map((n, idx) => ( 
            <div key={n.id || idx} className={` p-4 border relative overflow-hidden ${ n.threat === 'Critical' ? 'bg-red-950/20 border-red-500/30' : 'bg-orange-950/20 border-orange-500/30' }`}> 
              <div className={`absolute top-0 left-0 w-1 h-full ${n.threat === 'Critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-orange-500'}`}></div> 
              <div className="flex justify-between items-start mb-2 pl-2"> 
                <h4 className="text-white font-bold text-sm tracking-wide">{n.title}</h4> 
                <div className="flex flex-col items-end gap-1"> 
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${ n.status === 'Trending Up' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20' }`}> 
                    {n.status === 'Trending Up' ? <TrendingUp className="w-3 h-3" /> : (n.status === 'Decreasing' ? <TrendingDown className="w-3 h-3 text-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-orange-400" />)} 
                    {n.status} 
                  </span> 
                  {n.platform && (
                     <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{n.platform}</span>
                  )}
                </div> 
              </div> 
              <p className="text-xs text-slate-400 font-medium leading-relaxed pl-2 mt-2 border-t border-slate-800 pt-2"> 
                {n.description} 
              </p> 
            </div> 
          ))} 
        </div> 
      )}
    </div> 
  );
}
