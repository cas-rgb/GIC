"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { BrainCircuit, Search, MapPin } from "lucide-react";
import JitSocialTrendsView, { JitSocialPayload } from "./JitSocialTrendsView";

const MUNICIPALITIES: Record<string, string[]> = {
  "Gauteng": ["City of Johannesburg", "City of Tshwane", "Ekurhuleni", "Sedibeng", "West Rand"],
  "Western Cape": ["City of Cape Town", "Cape Winelands", "Garden Route", "Overberg", "West Coast"],
  "KwaZulu-Natal": ["eThekwini", "uMgungundlovu", "King Cetshwayo", "iLembe", "Ugu"],
  "Eastern Cape": ["Nelson Mandela Bay", "Buffalo City", "OR Tambo", "Sarah Baartman", "Alfred Nzo"],
  "Limpopo": ["Polokwane", "Thulamela", "Makhado", "Greater Tzaneen", "Capricorn"],
  "Mpumalanga": ["Mbombela", "eMalahleni", "Steve Tshwete", "Govan Mbeki", "Ehlanzeni"],
  "North West": ["Rustenburg", "Mahikeng", "City of Matlosana", "JB Marks", "Bojanala Platinum"],
  "Free State": ["Mangaung", "Matjhabeng", "Metsimaholo", "Dihlabeng", "Lejweleputswa"],
  "Northern Cape": ["Sol Plaatje", "Dawid Kruiper", "Nama Khoi", "Pixley ka Seme", "ZF Mgcawu"]
};

function PremiumLoadingState() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  
  const stages = [
    "Initializing Live Intelligence Arrays...",
    "Scanning Social Media Firehose...",
    "Assessing Historic Infrastructure Drag...",
    "Compiling Intelligence Matrix...",
    "Compiling Temporal Output..."
  ];

  useEffect(() => {
    const pTimer = setInterval(() => {
      setProgress(p => (p + (Math.random() * 3) > 99 ? 99 : p + (Math.random() * 3)));
    }, 250);

    const sTimer = setInterval(() => {
      setStage(s => (s < stages.length - 1 ? s + 1 : s));
    }, 3000);

    return () => { clearInterval(pTimer); clearInterval(sTimer); };
  }, []);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-16 flex flex-col items-center justify-center min-h-[400px] shadow-2xl relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <BrainCircuit className="w-16 h-16 text-emerald-500 animate-pulse mb-8 relative z-10" />
      
      <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-widest mb-10 relative z-10 text-center animate-pulse">
        {stages[stage]}
      </h3>
      
      <div className="w-full max-w-xl relative z-10">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Intelligence Briefing</span>
          <span className="text-xl font-display font-black text-emerald-500">{Math.floor(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-emerald-900 to-emerald-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function SocialTrendsDashboardClient() {
  const [province, setProvince] = useState<string>("All Provinces");
  const [municipality, setMunicipality] = useState<string>("All Municipalities");
  const [timeframe, setTimeframe] = useState<string>("7"); // Default 7 Days
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<JitSocialPayload | null>(null);

  // Reset municipality when province changes, unless it stays "All Provinces"
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setProvince(val);
    setMunicipality("All Municipalities");
  };

  const handleLaunch = async () => {
    setLoading(true);
    setData(null);

    try {
      const res = await fetch('/api/analytics/investigate-social', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province, municipality, timeframe })
      });
      const payload = await res.json();
      setData(payload);
    } catch (err) {
      console.error("Failed to fetch intelligence", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">


      <div className="rounded-[2rem] border border-blue-900/40 bg-slate-950 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
           <div className="md:col-span-3 space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1 flex items-center gap-2">
               Target Province
             </label>
             <select 
               value={province}
               onChange={handleProvinceChange}
               className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white font-medium focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none outline-none text-sm"
             >
               <option value="All Provinces">National Overview</option>
               <option value="Gauteng">Gauteng</option>
               <option value="Western Cape">Western Cape</option>
               <option value="KwaZulu-Natal">KwaZulu-Natal</option>
               <option value="Eastern Cape">Eastern Cape</option>
               <option value="Limpopo">Limpopo</option>
               <option value="Mpumalanga">Mpumalanga</option>
               <option value="North West">North West</option>
               <option value="Free State">Free State</option>
               <option value="Northern Cape">Northern Cape</option>
             </select>
           </div>

           <div className="md:col-span-3 space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1 flex items-center gap-2">
               <MapPin className="w-3 h-3 text-blue-400" /> Target Municipality
             </label>
             <select 
               value={municipality}
               onChange={(e) => setMunicipality(e.target.value)}
               disabled={province === "All Provinces"}
               className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white font-medium focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
             >
               <option value="All Municipalities">All Municipalities</option>
               {MUNICIPALITIES[province]?.map(mun => (
                 <option key={mun} value={mun}>{mun}</option>
               ))}
             </select>
           </div>

           <div className="md:col-span-3 space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1 flex items-center gap-2">
               Time Travel Filter
             </label>
             <select 
               value={timeframe}
               onChange={(e) => setTimeframe(e.target.value)}
               className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-emerald-400 font-medium focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none outline-none text-sm"
             >
               <option value="1">Last 24 Hours</option>
               <option value="3">Last 3 Days</option>
               <option value="7">Last 7 Days</option>
               <option value="30">Last 30 Days</option>
               <option value="all">General Trends (All Time)</option>
             </select>
           </div>

           <div className="md:col-span-3">
             <button 
               onClick={handleLaunch}
               disabled={loading}
               className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-4 py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xl shadow-blue-900/20"
             >
                {loading ? "SCANNING..." : (
                  <>
                    <Search className="w-4 h-4" />
                    LAUNCH SCRAMBLER
                  </>
                )}
             </button>
           </div>
        </div>
      </div>

      <div className="mt-8">
        {loading && <PremiumLoadingState />}
        {!loading && data && <JitSocialTrendsView data={data} timeframe={timeframe} />}
        {!loading && !data && (
           <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center text-slate-500 min-h-[400px]">
             <BrainCircuit className="w-12 h-12 mb-4 opacity-50" />
             <p className="font-medium text-lg text-slate-400">Awaiting Target Designation</p>
             <p className="text-sm mt-2 max-w-md mx-auto">Select a regional mandate above to deploy the intelligence arrays and compile the narrative dossier.</p>
           </div>
        )}
      </div>

    </div>
  );
}
