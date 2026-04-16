"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Cpu, TerminalSquare, Activity, ChevronRight, PlayCircle, Search } from "lucide-react";
import ProgressSpinner from "@/components/ui/ProgressSpinner";

interface SimulationData {
  executiveSummary: string;
  evidence: {
    title: string;
    content: string;
    url: string;
  }[];
  timeline: {
    horizon: string;
    eventPrediction: string;
    sentimentScore: number;
  }[];
  macroMetrics: {
    label: string;
    projectedValue: string;
  }[];
}

const TOP_30_PROJECTS = [
  { type: "Integrated Core Housing Development", location: "Ekurhuleni, Gauteng" },
  { type: "Smart Public Clinic Refurbishment", location: "Johannesburg, Gauteng" },
  { type: "Bulk Water Pipeline Augmentation", location: "Tshwane, Gauteng" },
  { type: "District Sewage Reticulation Upgrade", location: "Sedibeng, Gauteng" },
  { type: "Secondary Public School Construction", location: "Mamelodi, Gauteng" },
  { type: "Rapid Transport Road Network Upgrade", location: "Soweto, Gauteng" },
  { type: "Rural Clinic Solarization Program", location: "Modimolle, Limpopo" },
  { type: "Affordable Gap Housing Estate", location: "Polokwane, Limpopo" },
  { type: "Municipal Water Treatment Plant", location: "Rustenburg, North West" },
  { type: "Primary Healthcare Center Expansion", location: "Klerksdorp, North West" },
  { type: "Township Road Paving Initiative", location: "Mahikeng, North West" },
  { type: "High-Density Social Housing Complex", location: "eThekwini, KZN" },
  { type: "Off-Grid School Infrastructure Rollout", location: "Umlazi, KZN" },
  { type: "Peri-urban Sanitation System Upgrade", location: "Msunduzi, KZN" },
  { type: "Provincial Hospital Maternity Wing Addition", location: "Richards Bay, KZN" },
  { type: "Community Water Tap Node Network", location: "King Cetshwayo District, KZN" },
  { type: "Subsidized Student Accommodation", location: "Bloemfontein, Free State" },
  { type: "Municipal Reservoir Rehabilitation", location: "Mangaung, Free State" },
  { type: "Arterial Road & Stormwater Upgrade", location: "Welkom, Free State" },
  { type: "Mixed-Use Affordable Social Housing", location: "Kimberley, Northern Cape" },
  { type: "Rural School Tech & Wifi Integration", location: "Upington, Northern Cape" },
  { type: "Emergency Water Reticulation Pipeline", location: "Nelson Mandela Bay, Eastern Cape" },
  { type: "District Public Clinic Construction", location: "East London, Eastern Cape" },
  { type: "FLISP Subsidized Housing Infrastructure", location: "Mthatha, Eastern Cape" },
  { type: "Informal Settlement Sewage Eradication", location: "Buffalo City, Eastern Cape" },
  { type: "Urban Transport Commuter Hub Upgrade", location: "Cape Town Metro, Western Cape" },
  { type: "Social Housing Precinct Development", location: "Khayelitsha, Western Cape" },
  { type: "Regional General Hospital Modernization", location: "George, Western Cape" },
  { type: "Drought-Resilient Pipeline Expansion", location: "Beaufort West, Western Cape" },
  { type: "Early Childhood Development (ECD) Nodes", location: "Mitchells Plain, Western Cape" }
];

export default function ImpactSimulatorClient() {
  const searchParams = useSearchParams();
  const province = searchParams.get("province") || "Gauteng";
  
  const [prompt, setPrompt] = useState("Inject R500M into High-Speed Rail Corridor Link in Johannesburg to Pretoria, Gauteng");
  const [data, setData] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = TOP_30_PROJECTS.filter(p => 
    p.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectSelect = (proj: typeof TOP_30_PROJECTS[0]) => {
    setPrompt(`Inject R500M into ${proj.type} in ${proj.location}`);
    // Optional: auto-simulate on click?
  };

  const handleSimulate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/analytics/impact-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province, simulationPrompt: prompt })
      });
      const payload = await res.json();
      
      if (!res.ok || payload.error) {
         throw new Error(payload.error || `Server responded with status ${res.status}`);
      }
      
      setData(payload);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to execute simulation pipeline. Please check your TAVILY_API_KEY and GEMINI_API_KEY environment variables.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Input */}
      <div className="relative">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500/50" />
         <input 
           type="text" 
           value={searchQuery}
           onChange={e => setSearchQuery(e.target.value)}
           placeholder="Search infrastructure project types to model their impact..." 
           className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 shadow-inner"
         />
      </div>

      {/* Suggested Projects Grid */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-[2rem] p-6 shadow-xl max-h-[300px] overflow-y-auto fancy-scrollbar">
         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-2">Top 30 Suggested Infrastructure Projects</h4>
         <div className="flex flex-wrap gap-3">
           {filteredProjects.map((proj, i) => (
             <button 
               key={i} 
               onClick={() => handleProjectSelect(proj)}
               className="text-left px-4 py-3 bg-slate-800 hover:bg-indigo-600 rounded-xl border border-slate-700 hover:border-indigo-500 transition-colors group flex-1 min-w-[250px]"
             >
                <div className="text-sm font-bold text-white group-hover:text-white">{proj.type}</div>
                <div className="text-[10px] uppercase font-black tracking-widest text-indigo-400 group-hover:text-indigo-200 mt-1">{proj.location}</div>
             </button>
           ))}
           {filteredProjects.length === 0 && (
             <div className="text-sm text-slate-500 italic p-4">No projects match your search...</div>
           )}
         </div>
      </div>

      {/* CLI Input Terminal */}
      <div className="bg-slate-950/80 border border-slate-700 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20 hidden md:block">
           <TerminalSquare className="w-32 h-32 text-indigo-500" />
        </div>
        
        <h3 className="text-xl font-display font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2 relative z-10">
          <Cpu className="w-6 h-6 text-indigo-400" /> Command Line Hypothesis
        </h3>
        
        <div className="relative z-10 max-w-4xl">
           <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. Build 5 Solar Farms in Central Karoo..."
                className="flex-1 bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-sm shadow-inner"
              />
              <button 
                onClick={handleSimulate}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50"
              >
                 {loading ? "Modeling..." : <><PlayCircle className="w-5 h-5"/> Execute</>}
              </button>
           </div>
        </div>
      </div>

      {loading && (
        <div className="bg-slate-900 border border-slate-700 rounded-[2rem] p-16 flex flex-col items-center justify-center min-h-[400px] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
           <ProgressSpinner durationMs={15000} message="Calculating 5-Year Socio-Economic Trajectories..." />
           <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-slate-500">Forecasting Capital Ripples</p>
        </div>
      )}

      {error && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-950/20 border border-red-500/50 p-8 rounded-[2rem] shadow-xl text-center">
           <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
             <Activity className="w-8 h-8 text-red-500" />
           </div>
           <h3 className="text-xl font-display font-black text-white uppercase tracking-wider mb-2">Simulation Failed</h3>
           <p className="text-sm font-medium text-red-300 max-w-xl mx-auto leading-relaxed">{error}</p>
           <p className="text-[10px] uppercase font-black tracking-widest text-red-500/70 mt-6">Pipeline Execution Terminated</p>
        </motion.div>
      )}

      {!loading && !error && data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* Macro Metrics */}
             <div className="lg:col-span-1 space-y-6">
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 p-8 rounded-[2rem] shadow-2xl">
                   <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Hypothesis Outcome</h4>
                   <p className="text-slate-300 font-medium leading-relaxed">{data.executiveSummary}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   {data.macroMetrics?.map((metric, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">{metric.label}</span>
                         <span className="text-2xl font-display font-black text-indigo-400">{metric.projectedValue}</span>
                      </div>
                   ))}
                </div>
             </div>

             {/* Timeline Graphic */}
             <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-800">
                   <Activity className="w-6 h-6 text-indigo-500" />
                   <h3 className="text-xl font-display font-black text-white uppercase tracking-wider">Predictive 5-Year Timeline</h3>
                </div>

                <div className="relative space-y-8 pl-4">
                   <div className="absolute top-2 bottom-0 left-5 w-[2px] bg-indigo-500/20" />
                   
                   {data.timeline?.map((phase, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="relative pl-10"
                      >
                         <div className="absolute top-1.5 left-[-3px] w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                         <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl group hover:border-indigo-500/50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                               <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-md">
                                 {phase.horizon}
                               </span>
                               <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${phase.sentimentScore >= 60 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    Civic Sentiment
                                  </span>
                                  <span className="text-lg font-black text-white">{phase.sentimentScore}%</span>
                               </div>
                            </div>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed">{phase.eventPrediction}</p>
                         </div>
                      </motion.div>
                   ))}
                </div>
             </div>

          </div>

          {/* OSINT Evidence Block */}
          {data.evidence && data.evidence.length > 0 && (
             <div className="bg-slate-900/80 border border-slate-800 p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800">
                   <Search className="w-6 h-6 text-indigo-500" />
                   <h3 className="text-xl font-display font-black text-white uppercase tracking-wider">Real-World OSINT Evidence</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {data.evidence.map((ev, i) => (
                      <a key={i} href={ev.url} target="_blank" rel="noopener noreferrer" className="block bg-slate-950 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-colors group">
                         <h4 className="text-sm font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">{ev.title}</h4>
                         <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{ev.content}</p>
                         <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] uppercase font-black tracking-widest text-indigo-500 flex items-center justify-between">
                           <span>Source Material</span>
                           <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                         </div>
                      </a>
                   ))}
                </div>
             </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
