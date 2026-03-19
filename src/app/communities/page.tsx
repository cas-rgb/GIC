"use client";

import React, { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import KPIRibbon from "@/components/ui/KPIRibbon";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Globe,
  ShieldAlert,
  LayoutGrid,
  List,
  Filter,
  AlertCircle,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CommunityIntelligenceCard } from "@/components/ui/CommunityIntelligenceCard";
import { useEffect, useMemo } from "react";
import { getCommunityIntelligence } from "@/app/intel-actions";

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [communities, setCommunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCommunities() {
      setIsLoading(true);
      const res = await getCommunityIntelligence();
      if (res.success) setCommunities(res.communities || []);
      setIsLoading(false);
    }
    loadCommunities();
  }, []);

  const filteredCommunities = useMemo(() => {
    return communities.filter((comm) => {
      const matchesSearch =
        comm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (comm.municipality?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false);
      const matchesRegion =
        regionFilter === "All Regions" || comm.province === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [communities, searchQuery, regionFilter]);

  const regions = useMemo(
    () => ["All Regions", ...new Set(communities.map((c) => c.province))],
    [communities],
  );

  const getSentimentIcon = (icon: string) => {
    switch (icon) {
      case "very_satisfied":
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case "satisfied":
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case "dissatisfied":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "neutral":
        return <Activity className="w-4 h-4 text-slate-400 opacity-50" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="pb-24">
      <PageHeader
        title="Community Intelligence"
        subtitle="National Prioritisation • Public Sentiment Analysis • Strategic Infrastructure Mapping"
        guidingQuestion="Which communities are at the highest risk of service delivery failure?"
        headerImage="/projects/Breipaal-17-1024x683.webp"
        actions={
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <LayoutGrid
                className={`w-4 h-4 ${viewMode === "grid" ? "text-primary" : "text-white/40"}`}
                onClick={() => setViewMode("grid")}
              />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <List
                className={`w-4 h-4 ${viewMode === "list" ? "text-primary" : "text-white/40"}`}
                onClick={() => setViewMode("list")}
              />
            </button>
            <button className="flex items-center gap-3 px-6 py-2 bg-primary hover:bg-primary-light text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/25 transition-all">
              <ShieldCheck className="w-4 h-4" />
              Strategic Engagement Request
            </button>
          </div>
        }
      />

      <div className="px-8 md:px-12 space-y-8">
        <KPIRibbon
          kpis={[
            {
              label: "Active Communities",
              value: communities.length.toLocaleString(),
              color: "slate",
            },
            {
              label: "Avg Sentiment",
              value: `${(communities.reduce((acc, c) => acc + (c.infrastructureScore || 50), 0) / (communities.length || 1)).toFixed(1)}%`,
              trend: "Synced",
              trajectory: "up",
              color: "blue",
            },
            {
              label: "Critical High Risk",
              value: communities
                .filter(
                  (c) =>
                    c.riskScore > 80 || c.priorityStatus === "Urgent Action",
                )
                .length.toString(),
              color: "rose",
            },
            {
              label: "Infrastructure Health",
              value: `${(communities.reduce((acc, c) => acc + (c.infrastructureScore || 60), 0) / (communities.length || 1)).toFixed(0)}%`,
              trend: "Real-Time",
              trajectory: "neutral",
              color: "blue",
            },
          ]}
        />

        {/* Stitch-Style Filter Bar */}
        <div className="sticky top-4 z-30 flex flex-col md:flex-row items-center gap-4 p-4 bg-[#0B0F17]/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search communities, municipalities, or signals..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <select
                className="bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-8 text-sm text-white/90 focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                {regions.map((region) => (
                  <option key={region} value={region} className="bg-[#0B0F17]">
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/70 transition-all">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-bold text-white">
              Community Priority Grid
            </h2>
            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {filteredCommunities.length} RESULTS
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>Sort by:</span>
            <button className="text-white hover:text-primary font-bold">
              Priority Score
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredCommunities.map((comm) => (
              <CommunityIntelligenceCard
                key={comm.id}
                id={comm.id}
                name={comm.name}
                location={`${comm.province}, ${comm.country}`}
                municipality={comm.municipality || "DLO Core"}
                population={comm.population.toLocaleString()}
                priorityScore={comm.priorityStatus || "Moderate"}
                infrastructureScore={comm.infrastructureScore || 50}
                sentiment={{
                  value: "74%",
                  icon: "satisfied",
                  trend: comm.riskScore > 70 ? "-8%" : "+12%",
                }}
                image={comm.image}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredCommunities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 font-medium">
              No communities match your current filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setRegionFilter("All Regions");
              }}
              className="text-primary hover:text-primary-light font-bold text-xs uppercase tracking-widest"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
