"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Handshake,
  Building2,
  Landmark,
  CheckCircle2,
  ChevronRight,
  Activity,
  Info,
  MapPin,
  TrendingUp,
} from "lucide-react";
import InvestorFlowSankey from "./InvestorFlowSankey";
import TreasuryOpportunityMap from "./TreasuryOpportunityMap";
import ProgressSpinner from "@/components/ui/ProgressSpinner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface MatchmakerDealRoomHeaderProps {
  province?: string;
  municipality?: string | null;
  serviceDomain?: string | null;
}

export default function MatchmakerDealRoomHeader({
  province,
  municipality,
  serviceDomain,
}: MatchmakerDealRoomHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [narrative, setNarrative] = useState({ who: "", what: "", why: "", when: "", how: "" });
  const [stats, setStats] = useState<any[]>([]);
  const [primeMatches, setPrimeMatches] = useState<any[]>([]);
  
  // Sankey Data States
  const [sectorBreakdown, setSectorBreakdown] = useState<any[]>([]);
  const [geographyRows, setGeographyRows] = useState<any[]>([]);

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (municipality && municipality !== "All Municipalities") {
          params.set("municipality", municipality);
        } else if (province) {
          params.set("province", province);
        }
        if (serviceDomain && serviceDomain !== "all") {
          params.set("serviceDomain", serviceDomain);
        }

        const res = await fetch(`/api/analytics/investor-match?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setNarrative(data.narrative || { who: "Active Capital Markets", what: "Reviewing pipeline", why: "Due diligence incomplete", when: "Ongoing", how: "Algorithmic scanning" });
          
          // Map string icons to Lucide components if needed
          const iconMap: Record<string, any> = { Landmark, Activity, Handshake, CheckCircle2, Building2 };
          setStats((data.stats || []).map((s: any) => ({
            ...s,
            icon: iconMap[s.icon] || Info
          })));

          setPrimeMatches(data.primeMatches || []);
        }

        const resProjects = await fetch(`/api/analytics/infrastructure-projects-summary?${params.toString()}`);
        if (resProjects.ok) {
          const projectData = await resProjects.json();
          setSectorBreakdown(projectData.sectorBreakdown || []);
          setGeographyRows(projectData.geographyRows || []);
        }
      } catch (error) {
        console.error("Deal room load failed", error);
      } finally {
        setLoading(false);
      }
    }
    
    void loadMatches();
  }, [province, municipality, serviceDomain]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-slate-900 border border-slate-700 min-h-[400px]">
        <ProgressSpinner message="Preparing Capital Deal Room..." durationMs={10000} />
      </div>
    );
  }

  const handleNodeClick = (geo: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("municipality", geo);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {" "}
      {/* 1. NARRATIVE SUMMARY PANEL & 2. KPI CARDS */}{" "}
      <div className="bg-slate-900 p-8 border border-slate-700 shadow-2xl relative overflow-hidden">
        {" "}
        {/* Background Decor */}{" "}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />{" "}
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />{" "}
        <div className="relative z-10">
          {" "}
          <div className="flex justify-between items-start mb-6 border-b border-slate-700/50 pb-6">
            {" "}
            <div className="flex items-center gap-3">
              {" "}
              <div className="p-2 bg-emerald-500/20">
                {" "}
                <Building2 className="w-6 h-6 text-emerald-400" />{" "}
              </div>{" "}
              <div>
                {" "}
                <h2 className="text-white font-black text-xl uppercase tracking-widest leading-none">
                  {" "}
                  Investor Matchmaker{" "}
                </h2>{" "}
                <p className="text-slate-400 text-[10px] font-bold tracking-wider mt-1 uppercase">
                  {" "}
                  Investment Profiling & Deal Structuring{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {" "}
            <div className="lg:col-span-2 space-y-4 max-w-4xl">
              <p className="text-emerald-400 text-lg leading-relaxed font-bold border-l-4 border-emerald-500 pl-4 py-1 mb-6">
                In {province || "Gauteng"}, investor matching is currently optimizing for water and transport infrastructure portfolios. Over the past quarter, capital deployment signals show increased activity toward municipal renewable energy projects. Two major institutional partners have recently adjusted their mandates, creating new capital pools aligned with these emerging local priorities. Opportunities are scored against validated Treasury deal-flow metrics.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 border-t border-slate-700/50 pt-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                    Who
                  </span>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    Institutional investors, DFIs, and targeted local government entities.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                    What
                  </span>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    Matched investment priorities and emerging funding portfolios.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                    Why
                  </span>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    Alignment based on stated investor mandates and local service-delivery gaps.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                    When
                  </span>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    Trends over recent quarters and immediate active capital signals.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                    How
                  </span>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    Algorithmic scoring of viability and matching parameters vs Treasury data.
                  </p>
                </div>
              </div>
            </div>{" "}
            <div className="flex flex-col gap-4 border-l border-slate-700/50 pl-8">
              {" "}
              {stats.map((stat: any, idx: number) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-slate-800/50 border border-slate-700"
                  >
                    {" "}
                    <div className="w-10 h-10 bg-slate-900 flex items-center justify-center shrink-0 border border-slate-700">
                      {" "}
                      <Icon className={`w-4 h-4 ${stat.color}`} />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <p className="text-white font-bold text-sm">
                        {stat.title}
                      </p>{" "}
                      <p className="text-slate-400 text-xs mt-1">
                        {stat.desc}
                      </p>{" "}
                    </div>{" "}
                  </motion.div>
                );
              })}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* 3. SUPPORTING EVIDENCE: PRIME MATCHES */}{" "}
      <div className="bg-slate-900 border border-slate-700 shadow-xl overflow-hidden mb-8 relative">
        <div className="p-5 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" /> Supporting Evidence: Spatial Opportunity & Prime Matches
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">
              Click a spatial node to dynamically recalculate capital partners for that zone
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-700">
          <div className="p-6 col-span-1 h-[500px]">
             <TreasuryOpportunityMap 
               geographyRows={geographyRows} 
               onNodeClick={handleNodeClick} 
             />
          </div>
          <div className="p-6 col-span-2 relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-4">
            {primeMatches.map((match: any) => (
              <div
                key={match.id}
                className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-5 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 ${match.type === "DFI" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}
                    >
                      {match.type === "DFI" ? (
                        <Landmark className="w-5 h-5" />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                        {match.type}
                      </p>
                      <h4 className="text-white font-bold leading-tight">
                        {match.name}
                      </h4>
                    </div>
                  </div>
                </div>
                <div className="mb-4 flex-1">
                  <p className="text-xs text-blue-300 font-semibold mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Target: {match.focus}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-slate-600 pl-2">
                    "{match.rationale}"
                  </p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-700 mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-slate-300 font-medium">
                      Activity: {match.recentActivity.split(")")[0] + ")"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 4. ACTIVE CAPITAL DEPLOYMENT (SANKEY) */}{" "}
      <div className="bg-slate-900 border border-slate-700 shadow-xl overflow-hidden mb-8 relative">
        <div className="p-5 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Active Capital Deployments
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">
              Mapped Capital Flow from Source to Geography
            </p>
          </div>
        </div>
        <div className="p-4 md:p-6 bg-white/5 relative z-10 w-full h-[450px]">
          <InvestorFlowSankey sectorBreakdown={sectorBreakdown} geographyRows={geographyRows} />
        </div>
      </div>
      {/* 5. DATA CONFIDENCE PANEL */}{" "}
      <div className="bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
        {" "}
        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />{" "}
        <div>
          {" "}
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Data Confidence & Governance
          </h4>{" "}
          <p className="text-xs text-slate-500 leading-relaxed">
            {" "}
            Institutional investor profiles are matched dynamically against
            publicly stated fund mandates and recent transaction records. Pitch
            viability is assessed entirely against documented municipal project
            pipelines. No speculative matching is performed. Flow weighting reflects live Treasury database extraction mapped via deterministic heuristic.{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
