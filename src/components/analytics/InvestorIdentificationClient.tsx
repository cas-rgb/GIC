"use client";

import { useState, useEffect } from "react";
import { 
  Search, Building2, MapPin, Briefcase, BookmarkPlus, BookmarkCheck, 
  RefreshCw, AlertTriangle, X, Globe, ExternalLink, Calendar, Users, 
  FileText, Lightbulb, TrendingUp, Cpu, Phone, Mail 
} from "lucide-react";
import GICCard from "@/components/ui/GICCard";

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

  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);

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

  return (
    <div className="space-y-6">
      <GICCard className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search investors by name, mandate, or thesis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 transition-colors focus:border-gic-gold focus:outline-none focus:ring-1 focus:ring-gic-gold"
            />
          </div>
          <select 
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full md:w-auto rounded-2xl border border-white/10 bg-slate-900/50 px-6 py-4 text-sm font-bold text-white outline-none focus:border-gic-gold appearance-none"
          >
            <option value="all">Any Sector Focus</option>
            <option value="civil">Civil Infrastructure</option>
            <option value="green">Industrial Tech & Innovation</option>
            <option value="property">Commercial Property</option>
          </select>
          <select 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full md:w-auto rounded-2xl border border-white/10 bg-slate-900/50 px-6 py-4 text-sm font-bold text-white outline-none focus:border-gic-gold appearance-none"
          >
            <option value="all">Any Region</option>
            <option value="global">Global Funds</option>
            <option value="za">South African Based</option>
            <option value="ss">Sub-Saharan</option>
          </select>
        </div>
      </GICCard>

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
              onClick={() => setSelectedInvestor(investor)}
              className="cursor-pointer group"
            >
              <GICCard className="p-0 overflow-hidden flex flex-col h-full hover:border-gic-gold/30 hover:shadow-[0_0_30px_rgba(255,215,0,0.05)] transition-all duration-300">
                <div className="p-6 border-b border-white/5 bg-white/5 relative">
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={(e) => toggleSave(investor.id, e)}
                      className={`p-2 rounded-xl border transition-all ${
                        savedInvestors.includes(investor.id)
                          ? "border-gic-gold bg-gic-gold/20 text-gic-gold shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                          : "border-white/10 bg-slate-900 text-slate-400 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {savedInvestors.includes(investor.id) ? (
                        <BookmarkCheck className="h-5 w-5" />
                      ) : (
                        <BookmarkPlus className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 border border-blue-500/30 flex items-center justify-center shadow-lg group-hover:border-gic-gold/50 transition-colors">
                      <Building2 className="h-6 w-6 text-blue-400 group-hover:text-gic-gold transition-colors" />
                    </div>
                    <div className="pr-10">
                      <h3 className="text-lg font-display font-bold text-white tracking-tight leading-tight">
                        {investor.name}
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mt-1">
                        {investor.focus}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-slate-400 line-clamp-3">
                    {investor.description}
                  </p>
                </div>
                
                <div className="p-6 bg-slate-900/50 flex-1 flex flex-col justify-end space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5 mb-1.5">
                        <Briefcase className="h-3 w-3" />
                        Assets Under Mgt
                      </p>
                      <p className="text-sm font-bold text-white">{investor.assets}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5 mb-1.5">
                        <MapPin className="h-3 w-3" />
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
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-black uppercase tracking-[0.15em] text-blue-400">
                    <span>{selectedInvestor.focus}</span>
                    <span className="w-1 h-1 rounded-full bg-blue-400/50" />
                    <span>{selectedInvestor.hq}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => toggleSave(selectedInvestor.id, e)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    savedInvestors.includes(selectedInvestor.id)
                      ? "border-gic-gold bg-gic-gold/20 text-gic-gold shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                      : "border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {savedInvestors.includes(selectedInvestor.id) ? (
                    <><BookmarkCheck className="h-4 w-4" /> Saved to Pipeline</>
                  ) : (
                    <><BookmarkPlus className="h-4 w-4" /> Target Investor</>
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
            <div className="p-8 space-y-10">
              
              {/* Snapshot Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Assets Under Mgt</p>
                  <p className="text-lg font-bold text-white tracking-tight">{selectedInvestor.assets}</p>
                </div>
                {selectedInvestor.deepProfile?.teamSize && (
                  <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Team Size</p>
                    <p className="text-lg font-bold text-white tracking-tight">{selectedInvestor.deepProfile.teamSize}</p>
                  </div>
                )}
                {selectedInvestor.deepProfile?.ticketSize && (
                  <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Ticket Size</p>
                    <p className="text-lg font-bold text-white tracking-tight">{selectedInvestor.deepProfile.ticketSize}</p>
                  </div>
                )}
                <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Headquarters</p>
                  <p className="text-lg font-bold text-white tracking-tight">{selectedInvestor.hq}</p>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content (Left) */}
                <div className="lg:col-span-2 space-y-10">
                  
                  {/* Narrative Summary */}
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gic-gold" /> Narrative Summary
                    </h4>
                    <p className="text-slate-300 font-medium leading-relaxed text-[15px]">
                      {selectedInvestor.deepProfile?.narrativeSummary || selectedInvestor.description}
                    </p>
                  </div>

                  {/* Investment Philosophy */}
                  {selectedInvestor.deepProfile?.investmentPhilosophy && (
                    <div className="bg-blue-950/30 border border-blue-900/50 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400 mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> Investment Philosophy
                      </h4>
                      <p className="text-white/90 italic font-medium leading-relaxed">
                        "{selectedInvestor.deepProfile.investmentPhilosophy}"
                      </p>
                    </div>
                  )}

                  {/* Stages & Industry Focus */}
                  {(selectedInvestor.deepProfile?.investmentStages || selectedInvestor.deepProfile?.industryFocus) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {selectedInvestor.deepProfile?.investmentStages && (
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" /> Investment Stages
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedInvestor.deepProfile.investmentStages.map(stage => (
                              <span key={stage} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                                {stage}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedInvestor.deepProfile?.industryFocus && (
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50 mb-4 flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-purple-400" /> Industry Focus
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedInvestor.deepProfile.industryFocus.map(ind => (
                              <span key={ind} className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold">
                                {ind}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                </div>

                {/* Sidebar (Right) */}
                <div className="space-y-8">
                  
                  {/* Digital Footprint */}
                  <div className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-5">Digital & Contact</h4>
                    <div className="space-y-4">
                      {selectedInvestor.deepProfile?.website && (
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                          <Globe className="w-4 h-4 text-slate-500" />
                          <a href="#" className="hover:text-gic-gold transition-colors flex items-center gap-1.5">
                            {selectedInvestor.deepProfile.website} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {selectedInvestor.deepProfile?.contact?.email && (
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <a href={`mailto:${selectedInvestor.deepProfile.contact.email}`} className="hover:text-gic-gold transition-colors">
                            {selectedInvestor.deepProfile.contact.email}
                          </a>
                        </div>
                      )}
                      {selectedInvestor.deepProfile?.contact?.phone && (
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <span>{selectedInvestor.deepProfile.contact.phone}</span>
                        </div>
                      )}
                      {selectedInvestor.deepProfile?.established && (
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span>Est. {selectedInvestor.deepProfile.established}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Personnel */}
                  {selectedInvestor.deepProfile?.keyPersonnel && (
                    <div className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-5 flex items-center gap-2">
                        <Users className="w-3 h-3" /> Key Personnel
                      </h4>
                      <div className="space-y-4">
                        {selectedInvestor.deepProfile.keyPersonnel.map(person => (
                          <div key={person.name} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-sm font-black text-white">
                              {person.initial}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white leading-tight">{person.name}</p>
                              <p className="text-xs text-slate-400">{person.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Portfolio Examples */}
                  {selectedInvestor.deepProfile?.portfolioExamples && (
                    <div className="bg-slate-800/30 rounded-2xl p-6 border border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-5">Portfolio Examples</h4>
                      <div className="flex flex-col gap-2">
                        {selectedInvestor.deepProfile.portfolioExamples.map(port => (
                          <div key={port} className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> {port}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
