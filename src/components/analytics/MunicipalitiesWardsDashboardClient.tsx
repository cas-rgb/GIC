"use client";

import { useState } from "react";
import { Search, MapPin, AlertTriangle, Printer, Zap, RefreshCw, BarChart, FileText, CheckCircle2, History, Map as MapIcon, Users, Building, ShieldAlert, CloudRain, Newspaper, Target, Heart, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateCommunityDossier } from "@/app/actions";

const TOP_NEGLECTED_WARDS = [
  { name: "Xolobeni", municipality: "Winnie Madikizela-Mandela", province: "Eastern Cape" },
  { name: "Lusikisiki", municipality: "Ingquza Hill", province: "Eastern Cape" },
  { name: "Ntabankulu", municipality: "Ntabankulu", province: "Eastern Cape" },
  { name: "Matatiele", municipality: "Matatiele", province: "Eastern Cape" },
  { name: "Mount Ayliff", municipality: "Umzimvubu", province: "Eastern Cape" },
  { name: "Qumbu", municipality: "Mhlontlo", province: "Eastern Cape" },
  { name: "Flagstaff", municipality: "Ingquza Hill", province: "Eastern Cape" },
  { name: "Mbizana", municipality: "Winnie Madikizela-Mandela", province: "Eastern Cape" },
  { name: "Sterkspruit", municipality: "Senqu", province: "Eastern Cape" },
  { name: "Vuwani", municipality: "Makhado", province: "Limpopo" },
  { name: "Malamulele", municipality: "Collins Chabane", province: "Limpopo" },
  { name: "Giyani (Rural)", municipality: "Greater Giyani", province: "Limpopo" },
  { name: "Mapela", municipality: "Mogalakwena", province: "Limpopo" },
  { name: "Msinga", municipality: "Msinga", province: "KwaZulu-Natal" },
  { name: "Nqutu", municipality: "Nquthu", province: "KwaZulu-Natal" },
  { name: "Jozini", municipality: "Jozini", province: "KwaZulu-Natal" },
  { name: "Umhlabuyalingana", municipality: "Umhlabuyalingana", province: "KwaZulu-Natal" },
  { name: "Nkandla (Villages)", municipality: "Nkandla", province: "KwaZulu-Natal" },
  { name: "Nongoma", municipality: "Nongoma", province: "KwaZulu-Natal" },
  { name: "Taung", municipality: "Greater Taung", province: "North West" },
  { name: "Ganyesa", municipality: "Kagisano-Molopo", province: "North West" },
  { name: "Zeerust (Villages)", municipality: "Ramotshere Moiloa", province: "North West" },
  { name: "Bushbuckridge", municipality: "Bushbuckridge", province: "Mpumalanga" },
  { name: "Nkomazi", municipality: "Nkomazi", province: "Mpumalanga" },
  { name: "QwaQwa", municipality: "Maluti-a-Phofung", province: "Free State" },
  { name: "Diyatalawa", municipality: "Maluti-a-Phofung", province: "Free State" },
  { name: "Thaba Nchu", municipality: "Mangaung", province: "Free State" },
  { name: "Makwane", municipality: "Maluti-a-Phofung", province: "Free State" },
  { name: "Kuruman (Deep Rural)", municipality: "Ga-Segonyana", province: "Northern Cape" },
  { name: "Pampierstad", municipality: "Phokwane", province: "Northern Cape" }
];

export default function MunicipalitiesWardsDashboardClient() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [dossierReady, setDossierReady] = useState(false);
  const [dossierData, setDossierData] = useState<any>(null);
  const [activeLocation, setActiveLocation] = useState<{name: string, muni: string, prov: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCustomSearch = async () => {
    if (!searchQuery) return;
    triggerExtraction(searchQuery, "Unknown", "South Africa");
  };

  const triggerExtraction = async (ward: string, municipality: string, province: string) => {
    setIsSynthesizing(true);
    setDossierReady(false);
    setError(null);
    setActiveLocation({ name: ward, muni: municipality, prov: province });
    
    try {
      const response = await generateCommunityDossier(province, municipality, ward);
      if (response.success && response.data) {
        setDossierData(response.data);
        setDossierReady(true);
      } else {
        setError(response.error || "Failed to generate report");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Extract a clean list of images, filtering out bad/dead placeholders if possible
  const images = dossierData?.images?.filter((img: any) => img.url).slice(0, 4) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 print:bg-white print:text-black">
      
      {/* 2. THE SEARCH MATRIX (Hidden during print) */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl relative overflow-hidden print:hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gic-blue/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-bold font-display text-slate-900 mb-2 flex items-center gap-3">
              <Search className="w-8 h-8 text-gic-blue" />
              The Outsider's Report
            </h2>
            <p className="text-slate-500 font-medium max-w-2xl text-lg">
              Run an immediate extraction on severely underserved communities. Select a priority node below or manually search.
            </p>
          </div>

          {/* Quick Select Chips */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Top 30 Neglected Nodes (One-Click Extraction)</h3>
            <div className="flex flex-wrap gap-2">
              {TOP_NEGLECTED_WARDS.map((loc, idx) => (
                 <button
                  key={idx}
                  onClick={() => triggerExtraction(loc.name, loc.municipality, loc.province)}
                  disabled={isSynthesizing}
                  className="px-4 py-2 bg-slate-50 hover:bg-gic-blue hover:text-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm flex items-center gap-1.5"
                >
                  <span>{loc.name}</span>
                  <span className="opacity-60 text-[10px] uppercase font-bold tracking-wider">({loc.province})</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom Search */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-2 rounded-[1.5rem] focus-within:border-gic-blue focus-within:ring-2 focus-within:ring-gic-blue/20 transition-all max-w-3xl shadow-inner">
            <div className="flex-1 relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSearch()}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Or custom search: e.g. Ward 15 Ekurhuleni"
                className="w-full bg-transparent pl-14 pr-4 py-4 text-slate-800 text-lg font-bold outline-none"
              />
            </div>
            <button 
              onClick={handleCustomSearch}
              disabled={!searchQuery || isSynthesizing}
              className="bg-gic-blue hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-gic-blue text-white font-bold h-14 rounded-xl flex items-center justify-center gap-3 transition-all hover:shadow-gic-glow shadow-md whitespace-nowrap px-8"
            >
              {isSynthesizing ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Extracting...</>
              ) : (
                <><Zap className="w-5 h-5" /> Synthesis</>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm font-bold">
              Error fetching OSINT intelligence: {error}
            </div>
          )}
        </div>
      </div>

      {/* 3. THE AI DOSSIER RESULTS */}
      <AnimatePresence>
        {dossierReady && dossierData && activeLocation && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {/* Action Bar */}
            <div className="flex justify-end mb-6 print:hidden">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-sm font-bold shadow-xl border border-slate-700 transition hover:scale-105"
              >
                <Printer className="w-5 h-5" /> Print / Export Presentation
              </button>
            </div>

            {/* Dossier Document Structure */}
            <div className="bg-slate-950 border-t-8 border-t-gic-blue border-slate-800 rounded-b-[3rem] p-12 print:p-8 print:border-none print:shadow-none print:bg-white print:text-black relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                 <div className="absolute top-0 right-0 w-2/3 h-[800px] bg-gradient-to-bl from-gic-blue/5 to-transparent pointer-events-none print:hidden"></div>
                 
                 <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-8 border-b border-white/10 print:border-slate-300 gap-6 relative z-10">
                   <div className="max-w-2xl">
                     <p className="text-xs font-black uppercase tracking-[0.4em] text-gic-blue print:text-slate-500 mb-3 ml-1">Targeted Node Intelligence</p>
                     <h2 className="text-5xl lg:text-7xl font-display font-black text-white print:text-black leading-none tracking-tight">{activeLocation.name}</h2>
                     <p className="text-slate-400 print:text-slate-600 mt-4 text-2xl font-serif">{activeLocation.muni !== "Unknown" ? activeLocation.muni + ", " : ""}{activeLocation.prov}</p>
                   </div>
                   <div className="w-24 h-24 rounded-[2rem] bg-slate-900 print:bg-slate-100 border border-slate-800 print:border-slate-200 flex items-center justify-center shadow-xl print:shadow-none shrink-0 transform rotate-3">
                     <Target className="w-12 h-12 text-white print:text-slate-700" />
                   </div>
                 </div>

                 {/* Media Board (Map + Images) */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 relative z-10 print:mt-10">
                    {/* Google Maps iFrame */}
                    <div className="lg:col-span-1 rounded-[2rem] overflow-hidden border border-slate-800 print:border-slate-300 shadow-xl h-[300px] bg-slate-900 group relative">
                       <iframe 
                          width="100%" 
                          height="100%" 
                          frameBorder="0" 
                          scrolling="no" 
                          marginHeight={0} 
                          marginWidth={0} 
                          title="Google Map"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(activeLocation.name + ", " + (activeLocation.muni !== "Unknown" ? activeLocation.muni : activeLocation.prov) + ", South Africa")}&t=k&z=14&ie=UTF8&iwloc=&output=embed`}
                          className="grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 print:grayscale-0 print:opacity-100 transition-all duration-700"
                        />
                        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-2 print:hidden">
                            <MapPin className="w-3 h-3 text-gic-blue" />
                            <span className="text-[10px] uppercase tracking-widest text-white font-bold">Live Satellite</span>
                        </div>
                    </div>

                    {/* OSINT Acquired Images */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4 h-[300px]">
                       {images.length > 0 ? images.slice(0, 2).map((img: any, idx: number) => (
                           <div key={idx} className="rounded-[2rem] overflow-hidden border border-slate-800 print:border-slate-300 relative group bg-slate-900">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={img.url} alt={`OSINT Context ${idx}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 print:opacity-100" />
                             <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent print:hidden">
                                <p className="text-[10px] text-slate-300 truncate font-mono">Source Lens: {img.url.split('/')[2]}</p>
                             </div>
                           </div>
                       )) : (
                          <div className="col-span-2 rounded-[2rem] border border-dashed border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center p-8 text-center h-full">
                              <Camera className="w-8 h-8 text-slate-700 mb-4" />
                              <p className="text-slate-500 font-medium">No verified OSINT imagery available for this extraction run.</p>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Dossier Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 relative z-10">
                   
                   {/* Main Concerns - Highlighted */}
                   <div className="md:col-span-2 bg-red-500/5 print:bg-red-50 border-l-4 border-l-red-500 rounded-r-3xl p-8 mb-4">
                     <h4 className="text-sm font-black uppercase tracking-[0.2em] text-red-500 print:text-red-700 mb-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" /> 
                        Primary Pressure Point & Immediate Worry
                     </h4>
                     <p className="text-2xl text-white print:text-slate-900 leading-relaxed font-serif font-light">
                       {dossierData.mainConcerns}
                     </p>
                   </div>

                   {/* Demographics */}
                   <div>
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 print:text-slate-500 mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-gic-gold" /> Demographics
                     </h4>
                     <p className="text-lg text-slate-300 print:text-slate-700 leading-relaxed font-sans">
                       {dossierData.demographics}
                     </p>
                   </div>

                   {/* Socio-Economics */}
                   <div>
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 print:text-slate-500 mb-4 flex items-center gap-2">
                        <BarChart className="w-4 h-4 text-blue-400" /> Socio-Economic Reality
                     </h4>
                     <p className="text-lg text-slate-300 print:text-slate-700 leading-relaxed font-sans">
                       {dossierData.socioEconomics}
                     </p>
                   </div>

                   {/* Infrastructure */}
                   <div className="md:col-span-2 border-t border-b border-white/5 print:border-slate-200 py-10 my-4">
                     <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-300 print:text-slate-500 mb-4 flex items-center gap-2">
                        <Building className="w-6 h-6 text-emerald-400" /> Infrastructure Deficits & Crises
                     </h4>
                     <p className="text-2xl text-slate-200 print:text-slate-800 leading-relaxed font-serif">
                       {dossierData.infrastructureIssues}
                     </p>
                   </div>

                   {/* Political Landscape */}
                   <div>
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 print:text-slate-500 mb-4 flex items-center gap-2">
                        <MapIcon className="w-4 h-4 text-purple-400" /> Political Landscape & Volatility
                     </h4>
                     <p className="text-lg text-slate-300 print:text-slate-700 leading-relaxed font-sans">
                       {dossierData.politicalLandscape}
                     </p>
                   </div>

                   {/* Crime and Safety */}
                   <div>
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 print:text-slate-500 mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-orange-400" /> Crime & Safety Indicators
                     </h4>
                     <p className="text-lg text-slate-300 print:text-slate-700 leading-relaxed font-sans">
                       {dossierData.crimeAndSafety}
                     </p>
                   </div>

                   {/* Culture & History */}
                   <div>
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 print:text-slate-500 mb-4 flex items-center gap-2">
                        <History className="w-4 h-4 text-cyan-400" /> Culture, Heritage & History
                     </h4>
                     <p className="text-lg text-slate-300 print:text-slate-700 leading-relaxed font-sans">
                       {dossierData.cultureAndHistory}
                     </p>
                   </div>

                   {/* Weather / Natural Disaster */}
                   <div>
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 print:text-slate-500 mb-4 flex items-center gap-2">
                        <CloudRain className="w-4 h-4 text-sky-400" /> Environmental & Disaster Risk
                     </h4>
                     <p className="text-lg text-slate-300 print:text-slate-700 leading-relaxed font-sans">
                       {dossierData.weatherAndEnvironment}
                     </p>
                   </div>

                   {/* Recent Media */}
                   <div className="md:col-span-2">
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 print:text-slate-500 mb-4 flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-pink-400" /> Recent Media Coverage & OSINT
                     </h4>
                     <p className="text-xl text-slate-300 print:text-slate-700 leading-relaxed italic border-l-4 border-slate-700 print:border-slate-300 pl-6 py-2 font-serif font-light">
                       "{dossierData.recentMedia}"
                     </p>
                   </div>

                   {/* Engagement Strategy */}
                   <div className="md:col-span-2 mt-8">
                     <div className="bg-gradient-to-br from-gic-blue/20 to-blue-900/40 print:bg-none print:bg-blue-50 border border-gic-blue/30 print:border-blue-200 rounded-[3rem] p-10 md:p-14 relative overflow-hidden shadow-2xl">
                       <h4 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400 print:text-blue-800 mb-8 relative z-10 flex items-center gap-3">
                          <Heart className="w-6 h-6" /> Strategic Engagement & Intervention Methodology
                       </h4>
                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                         {Array.isArray(dossierData.engagementStrategy) && dossierData.engagementStrategy.map((strategy: any, idx: number) => (
                           <div key={idx} className="bg-slate-950/80 backdrop-blur-md print:bg-white print:border print:border-slate-200 rounded-[2rem] p-8 shadow-sm">
                             <div className="flex items-start gap-4 mb-4">
                               <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white font-display font-black text-sm flex items-center justify-center shadow-lg">{idx + 1}</span>
                               <h5 className="font-display font-bold text-white print:text-slate-900 text-xl leading-snug">{strategy.action}</h5>
                             </div>
                             <p className="text-base text-slate-400 print:text-slate-600 leading-relaxed">
                               {strategy.rationale}
                             </p>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>

                 </div>

                 {/* Print Footer */}
                 <div className="hidden print:block mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-500">
                    Proprietary GIC Intelligence Output. Generated {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()} using Real-Time OSINT Data.
                 </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
