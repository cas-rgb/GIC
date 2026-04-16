"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Target, Maximize2, MapPin, BarChart3, TrendingUp, AlertOctagon, Search } from "lucide-react";
import ProgressSpinner from "@/components/ui/ProgressSpinner";

interface MatrixData {
  quadrantAnalysis: string;
  matrixNodes: {
    zoneName: string;
    socialNeedScore: number;
    economicRoiScore: number;
    strategicProfile: string;
    unlockedBy: string;
  }[];
}

export default function OpportunityMatrixClient() {
  const searchParams = useSearchParams();
  const province = searchParams.get("province") || "Gauteng";
  const municipality = searchParams.get("municipality") || "";
  const serviceDomain = searchParams.get("serviceDomain") || "";

  const [ward, setWard] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  
  const [data, setData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMatrixData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/opportunity-matrix', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province, municipality, serviceDomain, ward, projectType })
      });
      const payload = await res.json();
      setData(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
       <div className="bg-slate-900 border border-slate-700 rounded-[2rem] p-16 flex flex-col items-center justify-center min-h-[600px] shadow-2xl relative overflow-hidden h-full mt-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[100px] rounded-full pointer-events-none" />
          <ProgressSpinner durationMs={15000} message="Plotting Geometric ROI and Impact Quadrants..." />
          <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-slate-500">Executing Deep Geospatial Mapping</p>
       </div>
     );
  }

  return (
    <div className="space-y-8 pb-16">
       
       {/* Search Input */}
       <div className="relative mb-8">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400/50" />
          <input 
            type="text" 
            placeholder="Search spatial nodes, opportunity quadrants, or specific risk factors..." 
            className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 shadow-inner"
          />
       </div>

       {/* Target Deal Desk Configurator */}
       <div className="rounded-[2rem] border border-sky-900/40 bg-slate-900 p-8 shadow-2xl relative overflow-hidden print:hidden flex flex-col gap-6">
         <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[100px] rounded-full pointer-events-none" />
         
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
              Opportunity Topology Scope
            </p>
            <p className="mt-2 text-lg font-medium text-slate-300">
              Analyzing Geospatial Nodes Across: <span className="font-bold text-white uppercase tracking-widest break-words space-x-2">
                 <span className="bg-slate-800 px-2 py-1 rounded">[{province}]</span>
                 {municipality && <span className="bg-slate-800 px-2 py-1 rounded">[{municipality}]</span>}
                 {serviceDomain && <span className="bg-slate-800 px-2 py-1 rounded">[{serviceDomain}]</span>}
              </span>
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Hyper-Local Ward Focus (Optional)</label>
               <input 
                 type="text" 
                 value={ward}
                 onChange={(e) => setWard(e.target.value)}
                 placeholder="e.g. Ward 65 or Sandton Central" 
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:border-sky-500/50 shadow-inner"
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Infrastructure Project Type (Optional)</label>
               <input 
                 type="text" 
                 value={projectType}
                 onChange={(e) => setProjectType(e.target.value)}
                 placeholder="e.g. Bulk Water, Smart Clinic, Social Housing" 
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm font-medium placeholder-slate-600 focus:outline-none focus:border-sky-500/50 shadow-inner"
               />
            </div>
         </div>
         
         <div className="flex justify-end mt-2 relative z-10">
            <button 
              onClick={fetchMatrixData}
              className="px-8 py-3 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white rounded-xl text-sm font-black uppercase tracking-[0.15em] shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all flex items-center gap-2"
            >
               Map Growth Corridors <Target className="w-4 h-4" />
            </button>
         </div>
       </div>

       {data && (
       <>
       <div className="bg-slate-950/60 border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
          <h3 className="text-xl font-display font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-sky-400" /> Quadrant Topology Analysis
          </h3>
          <p className="text-lg text-slate-300 font-inter leading-relaxed whitespace-pre-wrap">{data.quadrantAnalysis}</p>
       </div>

       {/* The CSS Grid Matrix Simulation */}
       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-10 relative overflow-hidden h-[600px] flex flex-col shadow-inner">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />
             
             {/* Crosshairs */}
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-sky-500/30" />
             <div className="absolute top-0 left-1/2 w-[1px] h-full bg-sky-500/30" />
             
             {/* Labels */}
             <span className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-black uppercase tracking-widest text-slate-500">High Social Impact Risk</span>
             <span className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-black uppercase tracking-widest text-slate-500">Low Social Risk</span>
             <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-slate-500">High Economic ROI</span>
             
             <div className="relative z-10 w-full h-full">
                {data.matrixNodes?.map((node, i) => {
                   // Calculate grid position logic
                   // Social Need: 0 = Bottom (Low Need), 100 = Top (High Need)
                   // Econ ROI: 0 = Left (Low ROI), 100 = Right (High ROI)
                   return (
                      <motion.div 
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                        className="absolute w-8 h-8 rounded-full bg-gic-gold flex items-center justify-center border-4 border-slate-900 shadow-[0_0_20px_rgba(255,215,0,0.5)] z-20 cursor-pointer group hover:z-50"
                        style={{ 
                          left: `calc(${node.economicRoiScore}% - 16px)`, 
                          bottom: `calc(${node.socialNeedScore}% - 16px)` 
                        }}
                      >
                         <span className="text-[10px] font-black">{i + 1}</span>
                         {/* Hover Tooltip */}
                         <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 bg-slate-800 border border-slate-700 text-white p-4 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <h4 className="font-bold text-sm mb-1">{node.zoneName}</h4>
                            <div className="flex justify-between text-[9px] tracking-widest uppercase text-slate-400 font-bold mb-3 border-b border-slate-700 pb-2">
                               <span>ROI: {node.economicRoiScore}%</span>
                               <span>NEED: {node.socialNeedScore}%</span>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-300">{node.strategicProfile}</p>
                         </div>
                      </motion.div>
                   )
                })}
             </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 shadow-2xl overflow-y-auto h-[600px] fancy-scrollbar">
             <div className="flex items-center gap-3 mb-6 sticky top-0 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl z-20 border border-slate-800/50">
                <BarChart3 className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Indexed Investment Targets</h3>
             </div>

             <div className="space-y-6">
               {data.matrixNodes?.map((node, i) => (
                  <div key={i} className="bg-slate-950/80 border border-slate-800/50 p-6 rounded-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4">
                        <span className="w-8 h-8 rounded-full bg-gic-gold/10 text-gic-gold border border-gic-gold/20 flex items-center justify-center font-black text-sm">
                           {i + 1}
                        </span>
                     </div>
                     <h4 className="text-xl font-bold text-white pr-12">{node.zoneName}</h4>
                     
                     <div className="flex gap-4 mt-3 mb-4">
                        <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Socioeconomic Need</span>
                           <span className="text-lg font-black text-rose-500">{node.socialNeedScore}</span>
                        </div>
                        <div className="px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg">
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Economic Viability</span>
                           <span className="text-lg font-black text-sky-500">{node.economicRoiScore}</span>
                        </div>
                     </div>

                     <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        {node.strategicProfile}
                     </p>

                     <div className="mt-4 pt-4 border-t border-slate-800 flex items-start gap-2">
                        <AlertOctagon className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-400 font-bold leading-relaxed">
                           <span className="uppercase tracking-widest text-emerald-500 block text-[9px] mb-1">Key Unlock Requirement</span>
                           {node.unlockedBy}
                        </p>
                     </div>
                  </div>
               ))}
             </div>
          </div>
       </div>
       </>
       )}
    </div>
  );
}
