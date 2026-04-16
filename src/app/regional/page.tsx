"use client";

import PageHeader from "@/components/ui/PageHeader";
import KPIRibbon from "@/components/ui/KPIRibbon";
import GICCard from "@/components/ui/GICCard";
import GICMap from "@/components/ui/GICMap";
import { EmptyState } from "@/components/ui/FeedbackStates";
import {
  Globe,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  Activity,
  Users,
  Building2,
  ShieldCheck,
  Layers,
  Maximize2,
  TrendingUp,
  SearchCode,
  Database,
  Lightbulb,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useGIC } from "@/context/GICContext";
import { useMemo, useEffect, useState } from "react";
import { getRegionalIntelligence, getProvinceIntelligence } from "@/app/intel-actions";

export default function RegionalIntelligence() {
  const { selectedProvince, selectedMunicipality } = useGIC();
  const [liveData, setLiveData] = useState<any>(null);
  const [provinceData, setProvinceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedProvince) {
      setLiveData(null);
      setProvinceData(null);
      setIsLoading(false);
      return;
    }

    async function loadRegionalData() {
      setIsLoading(true);
      const provName = selectedProvince;
      const [res, provRes] = await Promise.all([
        getRegionalIntelligence({ province: provName }),
        getProvinceIntelligence(provName, true)
      ]);
      if (res.success) setLiveData(res.data);
      if (provRes.success) setProvinceData(provRes);
      setIsLoading(false);
    }
    loadRegionalData();
  }, [selectedProvince]);

  if (!selectedProvince) {
    return (
      <div className="pb-24 px-8 min-h-[80vh] flex items-center justify-center">
        <EmptyState 
          title="Awaiting Geographic Target" 
          subtitle="Select a province from the top omni-filter to generate the command matrix." 
        />
      </div>
    );
  }

  const filteredCommunities = useMemo(() => {
    if (!liveData) return [];
    return (liveData.communities || []).filter((c: any) => {
      const munMatch =
        !selectedMunicipality || c.municipality === selectedMunicipality;
      return munMatch;
    });
  }, [liveData, selectedMunicipality]);

  const filteredProjects = useMemo(() => {
    if (!liveData) return [];
    return (liveData.tenders || []).filter((p: any) => {
      const munMatch =
        !selectedMunicipality || p.municipality === selectedMunicipality;
      return munMatch;
    });
  }, [liveData, selectedMunicipality]);

  const mapMarkers = useMemo(() => {
    const projectMarkers = filteredProjects.map((p: any) => ({
      id: p.id,
      position: { lat: p.latitude || -26, lng: p.longitude || 28 },
      title: p.title,
      subtitle: `${p.sector} • Verified Node`,
      type: "project" as const,
    }));

    const communityMarkers = filteredCommunities.map((c: any) => ({
      id: c.id,
      position: { lat: c.latitude || -26.2041, lng: c.longitude || 28.0473 },
      title: c.name,
      subtitle: `${c.municipality} • Intelligence Source`,
      type: "community" as const,
    }));

    return [...projectMarkers, ...communityMarkers];
  }, [filteredProjects, filteredCommunities]);

  return (
    <div className="pb-24 px-8">
      <div className="flex items-center justify-between mb-12">
        <PageHeader
          title="Provincial Command Matrix"
          subtitle="Geospatial Sentiment Mapping • Regional Demand Corridors"
          guidingQuestion="Which regions require immediate intervention or offer the highest infrastructure delivery confidence?"
          headerImage="/projects/MAJWEMASWEU-X5-1300-1024x683.webp"
        />
      </div>

      <KPIRibbon
        kpis={[
          {
            label: "Strategic Hubs",
            value: filteredCommunities.length.toString(),
            color: "slate",
          },
          {
            label: "Aggregate Demand",
            value: "78%",
            trend: "4.2%",
            trajectory: "up",
            color: "blue",
          },
          {
            label: "Project Nodes",
            value: filteredProjects.length.toString(),
            trend: "Active",
            trajectory: "neutral",
            color: "gold",
          },
          { label: "Network Integrity", value: "99.4%", color: "blue" },
        ]}
      />

      {/* 1. Decision Summary & Recommendations */}
      {provinceData && provinceData.metrics && (
        <section className="mb-12">
          <GICCard
            premium
            title="Strategic Command Abstract"
            subtitle="Deterministic assessment of provincial risk markers"
            icon={<Lightbulb className="w-5 h-5 text-gic-gold" />}
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-gic-hard">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gic-blue blur-[100px] opacity-10" />
                <h4 className="text-xl font-display font-bold text-white mb-4 relative z-10 w-full flex justify-between items-center">
                  <span>Deterministic Recommendation</span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 rounded-full">
                    Zero-Hallucination Framework Active
                  </span>
                </h4>
                <p className="text-sm leading-relaxed opacity-90 mb-6 relative z-10">
                  {provinceData.metrics.volume.value > 100
                    ? `Critical volume of ${provinceData.metrics.volume.value} public signals detected. Core intervention is required in ${provinceData.metrics.topConcern.value} to restore stability.`
                    : `Signal volume is within operational baselines (${provinceData.metrics.volume.value} tracked). The leading edge indicator is currently ${provinceData.metrics.topConcern.value}. Focus on preventative maintenance.`}
                  {provinceData.metrics.alignment.value !== null && provinceData.metrics.alignment.value < 50
                    ? " High misalignment exists between budget allocation and the primary public concern."
                    : " Current budget allocations tentatively align with public pressure domains."}
                </p>
                <div className="space-y-3 relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Provenance</p>
                  <p className="text-xs text-white/70 italic max-w-full">
                    Grounded on actuals derived from ETL telemetry matching region: <b>{selectedProvince || "Gauteng"}</b>. No generative inference applied to strategic facts.
                  </p>
                </div>
              </div>
            </div>
          </GICCard>
        </section>
      )}

      {/* 2. Hotspots & Public Pressure */}
      {provinceData && provinceData.metrics && (
        <section className="grid grid-cols-12 gap-8 mb-12">
          {/* Public Pressure */}
          <div className="col-span-12 lg:col-span-6">
            <GICCard
              title="Public Pressure Topography"
              subtitle="Governed metrics tracking sentiment volume and velocity"
              icon={<MessageSquare className="w-5 h-5 text-gic-blue" />}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Volume</p>
                  <p className="text-4xl font-display font-black text-slate-900">{provinceData.metrics.volume.value}</p>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Velocity Trend</p>
                  <p className="text-4xl font-display font-black text-slate-900">{provinceData.metrics.velocity.value}</p>
                  <p className="text-[10px] font-bold text-amber-500 mt-1 uppercase">multiplier over 7d</p>
                </div>
                <div className="col-span-2 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Leading Concerns</p>
                  <div className="space-y-3">
                    {provinceData.topicBreakdown.slice(0, 3).map((topic: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm font-bold text-slate-700">
                        <span>{topic.topic}</span>
                        <div className="flex items-center gap-3">
                           <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
                             <div className="h-full bg-gic-blue" style={{ width: `${topic.percentage}%` }} />
                           </div>
                           <span className="w-8 text-right">{topic.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GICCard>
          </div>

          {/* Hotspot Municipalities */}
          <div className="col-span-12 lg:col-span-6">
            <GICCard
              title="Hotspot Municipalities"
              subtitle="Highest density of operational signals"
              icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
            >
              <div className="space-y-4">
                {provinceData.municipalityData.slice(0, 5).map((muni: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 font-bold flex items-center justify-center text-xs">
                        #{i + 1}
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{muni.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black uppercase text-slate-400 tracking-widest px-3 py-1 bg-white rounded-full border border-slate-200">
                        {muni.value} Signals
                      </span>
                    </div>
                  </div>
                ))}
                {provinceData.municipalityData.length === 0 && (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No municipality data localized for this region timeline.
                  </div>
                )}
              </div>
            </GICCard>
          </div>
        </section>
      )}

      {/* Interactive Regional Map */}
      <div className="grid grid-cols-12 gap-8 mb-12">
        <div className="col-span-12 lg:col-span-12">
          <GICCard
            premium
            title="Geospatial Surveillance Engine"
            subtitle="Choose a node for deep protocol intelligence and signal streams"
            icon={<Globe className="w-5 h-5" />}
            className="h-[650px]"
          >
            <GICMap
              zoom={selectedMunicipality ? 11 : selectedProvince ? 8 : 6}
              center={
                filteredCommunities[0]
                  ? {
                      lat: filteredCommunities[0].lat || -26.2,
                      lng: filteredCommunities[0].lng || 28.0,
                    }
                  : undefined
              }
              markers={mapMarkers}
            />
          </GICCard>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Regional Scorecards */}
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(filteredCommunities as any[])
              .slice(0, 4)
              .map((reg: any, i: number) => (
                <GICCard
                  key={i}
                  title={reg.name}
                  subtitle={reg.municipality}
                  icon={<Building2 className="w-4 h-4" />}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Pop. Impact
                        </p>
                        <p className="text-xl font-display font-bold text-slate-900">
                          {(reg.population / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Status
                        </p>
                        <span
                          className={`text-[10px] font-black uppercase ${reg.priorityStatus === "High Risk" ? "text-rose-500" : "text-emerald-500"}`}
                        >
                          {reg.priorityStatus}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Governance Lead
                      </p>
                      <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600">
                          Mayor: {reg.governance?.mayor}
                        </span>
                        <span className="text-[9px] font-black text-gic-blue px-2 py-0.5 bg-gic-blue/10 rounded-full">
                          {reg.governance?.governingParty}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <TrendingUp
                          className={`w-3 h-3 ${reg.riskScore < 50 ? "text-emerald-500" : "text-amber-500"}`}
                        />
                        <span className="text-[10px] font-black uppercase text-slate-900">
                          Health Index: {100 - reg.riskScore}%
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </GICCard>
              ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <GICCard
            premium
            title="Node Connectivity"
            subtitle="Inter-Regional Data Sync"
            icon={<Activity className="w-5 h-5" />}
          >
            <div className="space-y-8">
              {(filteredCommunities as any[])
                .slice(0, 4)
                .map((node: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {node.name}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        96% Uplink
                      </span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gic-blue"
                        style={{ width: "96%" }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </GICCard>

          <GICCard
            title="Regional Intel Snapshot"
            icon={<SearchCode className="w-5 h-5" />}
          >
            <div className="space-y-6">
              {(filteredProjects as any[]).slice(0, 3).map((p: any) => (
                <div
                  key={p.id}
                  className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-gic-blue transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                      {p.name}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      Verified Corridor: {p.sector}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GICCard>
        </div>
      </div>
    </div>
  );
}
