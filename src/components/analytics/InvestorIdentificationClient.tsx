"use client";

import { useState, useEffect } from "react";
import { 
  Search, Building2, MapPin, Briefcase, BookmarkPlus, BookmarkCheck, 
  RefreshCw, AlertTriangle, X, Globe, ExternalLink, Calendar, Users, 
  FileText, Lightbulb, TrendingUp, Cpu, Phone, Mail, BrainCircuit
} from "lucide-react";
import GICCard from "@/components/ui/GICCard";
import InvestorDeepProfile from "./InvestorDeepProfile";
import ExportEmailButton from "@/components/ui/ExportEmailButton";


interface DeepProfile {
  website?: string;
  linkedin?: string;
  established?: string;
  updated?: string;
  teamSize?: string;
  ticketSize?: string;
  narrativeSummary?: string;
  investmentPhilosophy?: string;
  investmentStages?: string[];
  industryFocus?: string[];
  portfolioExamples?: string[];
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  investmentFocus?: {
    sweetSpot?: string;
  };
  keyPersonnel?: {
    initial: string;
    name: string;
    role: string;
  }[];
}

interface Investor {
  id: string;
  name: string;
  focus: string;
  description: string;
  assets: string;
  hq: string;
  sector: string;
  region: string;
  deepProfile?: DeepProfile;
}

export default function InvestorIdentificationClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [region, setRegion] = useState("all");
  
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [savedInvestors, setSavedInvestors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedInvestor, setSelectedInvestor] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/investors/save")
      .then(res => res.json())
      .then(data => setSavedInvestors(data.saved || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (sector !== "all") params.set("sector", sector);
      if (region !== "all") params.set("region", region);

      fetch(`/api/investors/search?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          setInvestors(data.investors || []);
          setIsLoading(false);
        })
        .catch(err => {
          setError("Failed to query investor registry.");
          setIsLoading(false);
        });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, sector, region]);

  const toggleSave = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // prevent modal opening

    const isSaved = savedInvestors.includes(id);
    const action = isSaved ? "unsave" : "save";
    
    setSavedInvestors((prev) =>
      isSaved ? prev.filter((i) => i !== id) : [...prev, id]
    );

    try {
      await fetch("/api/investors/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
    } catch (err) {
      console.error("Failed to persist save status");
    }
  };

  const investigate = async (investor: any) => {
    setSelectedInvestor(investor);
  };

  return (
    <div className="space-y-6">
      <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/40 backdrop-blur-md p-6 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 to-gic-gold/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 group-focus-within:text-gic-gold transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search strategic investors by name, mandate, or specific operational thesis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 transition-all duration-300 hover:border-white/20 hover:bg-slate-900/70 focus:border-gic-gold focus:bg-slate-900/80 focus:outline-none focus:ring-1 focus:ring-gic-gold/50 shadow-inner"
            />
          </div>
          <div className="flex w-full md:w-auto gap-4">
            <select 
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="flex-1 md:flex-none rounded-2xl border border-white/10 bg-slate-900/50 px-6 py-4 text-sm font-bold text-slate-200 outline-none transition-all duration-300 hover:border-white/20 hover:bg-slate-900/70 focus:border-gic-gold appearance-none cursor-pointer"
            >
              <option className="bg-slate-900 text-white" value="all">Any Sector Focus</option>
              <option className="bg-slate-900 text-white" value="civil">Civil Infrastructure</option>
              <option className="bg-slate-900 text-white" value="green">Industrial Tech & Innovation</option>
              <option className="bg-slate-900 text-white" value="property">Commercial Property</option>
            </select>
            <select 
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="flex-1 md:flex-none rounded-2xl border border-white/10 bg-slate-900/50 px-6 py-4 text-sm font-bold text-slate-200 outline-none transition-all duration-300 hover:border-white/20 hover:bg-slate-900/70 focus:border-gic-gold appearance-none cursor-pointer"
            >
              <option className="bg-slate-900 text-white" value="all">Any Region</option>
              <option className="bg-slate-900 text-white" value="global">Global Funds</option>
              <option className="bg-slate-900 text-white" value="za">South African Based</option>
              <option className="bg-slate-900 text-white" value="ss">Sub-Saharan</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-sm font-bold text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-gic-gold" />
            <p className="uppercase tracking-widest text-[10px]">Scanning Global Registry...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex min-h-[400px] items-center justify-center text-center">
          <div>
            <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
            <p className="mt-3 text-sm font-bold text-rose-400">{error}</p>
          </div>
        </div>
      ) : investors.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center text-center border border-dashed border-white/10 rounded-[2.5rem]">
          <div className="max-w-md">
            <Building2 className="mx-auto h-8 w-8 text-slate-600 mb-4" />
            <p className="text-sm font-bold text-white tracking-widest uppercase mb-2">No Verified Investors Found</p>
            <p className="text-xs text-slate-400 leading-relaxed">Adjust your search parameters. Our database screens multiple strategic capital bases.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investors.map((investor) => (
            <div 
              key={investor.id} 
              onClick={() => investigate(investor)}
              className="cursor-pointer group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-blue-600/0 to-gic-gold/0 group-hover:from-blue-600/10 group-hover:to-gic-gold/10 rounded-3xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              <GICCard className="relative p-0 overflow-hidden flex flex-col h-full hover:border-gic-gold/40 hover:shadow-[0_0_40px_rgba(255,215,0,0.1)] bg-slate-900/60 backdrop-blur-md transition-all duration-500 transform group-hover:-translate-y-1 group-hover:bg-slate-900/80">
                <div className="p-6 border-b border-white/10 relative z-10 bg-gradient-to-b from-white/5 to-transparent">
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={(e) => toggleSave(investor.id, e)}
                      className={`p-2 rounded-xl border transition-all duration-300 hover:scale-105 ${
                        savedInvestors.includes(investor.id)
                          ? "border-gic-gold bg-gic-gold/20 text-gic-gold shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                          : "border-white/10 bg-slate-950/50 text-slate-400 hover:border-white/30 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {savedInvestors.includes(investor.id) ? (
                        <BookmarkCheck className="h-5 w-5" />
                      ) : (
                        <BookmarkPlus className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="mt-1 h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center shadow-xl group-hover:border-gic-gold/50 group-hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-all duration-500">
                      <Building2 className="h-6 w-6 text-slate-400 group-hover:text-gic-gold transition-colors duration-500" />
                    </div>
                    <div className="pr-12">
                      <h3 className="text-xl font-display font-black text-emerald-400 drop-shadow-md tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
                        {investor.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-400">
                           {investor.focus}
                         </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-slate-400 line-clamp-3 group-hover:text-slate-300 transition-colors duration-300">
                    {investor.description}
                  </p>
                </div>
                
                <div className="p-6 bg-slate-900/50 flex-1 flex flex-col justify-end space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5 mb-1.5">
                        <Briefcase className="h-4 w-4" />
                        Assets Under Mgt
                      </p>
                      <p className="text-sm font-bold text-white">{investor.assets}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5 mb-1.5">
                        <MapPin className="h-4 w-4" />
                        HQ
                      </p>
                      <p className="text-sm font-bold text-white">{investor.hq}</p>
                    </div>
                  </div>
                </div>
              </GICCard>
            </div>
          ))}
        </div>
      )}

      {/* Deep Profile Modal Overlay */}
      {selectedInvestor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <div 
            className="absolute inset-0 z-0" 
            onClick={() => setSelectedInvestor(null)}
          />
          <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-lg border-b border-white/10 p-6 flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 border border-blue-500/30 flex shadow-[0_0_30px_rgba(59,130,246,0.15)] items-center justify-center shrink-0">
                  <Building2 className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-black text-white tracking-tight">
                    {selectedInvestor.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-3 text-xs font-black uppercase tracking-widest text-blue-400">
                    <span>{selectedInvestor.focus}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />
                    <span>{selectedInvestor.hq}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ExportEmailButton 
                  investorId={selectedInvestor.id} 
                  investorName={selectedInvestor.name} 
                />
                <button
                  onClick={(e) => toggleSave(selectedInvestor.id, e)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${
                    savedInvestors.includes(selectedInvestor.id)
                      ? "border-gic-gold bg-gic-gold/20 text-gic-gold shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                      : "border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-white/30"
                  }`}
                >
                  {savedInvestors.includes(selectedInvestor.id) ? (
                    <><BookmarkCheck className="h-4 w-4" /> Saved</>
                  ) : (
                    <><BookmarkPlus className="h-4 w-4" /> Target</>
                  )}
                </button>
                <button 
                  onClick={() => setSelectedInvestor(null)}
                  className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <InvestorDeepProfile investor={selectedInvestor} />
          </div>
        </div>
      )}
    </div>
  );
}
