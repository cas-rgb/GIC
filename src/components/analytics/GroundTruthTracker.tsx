"use client";
import ProgressSpinner from "@/components/ui/ProgressSpinner";
import { motion } from "framer-motion";
import {
  MapPin,
  MessageSquareWarning,
  Camera,
  AlertTriangle,
  Activity,
  Map as MapIcon,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import DeepDiveDrawer from "@/components/ui/DeepDiveDrawer";
import WardTreemapGrid from "./WardTreemapGrid";
import type { ControlledInsightResponse } from "@/lib/analytics/insight-generator";

interface RealityFeedItem {
  id: number;
  type: string;
  issue: string;
  location: string;
  time: string;
  description: string;
  severity: string;
}

interface StatItem {
  icon: string;
  color: string;
  title: string;
  desc: string;
}

interface GroundTruthTrackerProps {
  municipality: string;
  serviceDomain?: string | null;
  ward?: string | null;
}
export default function GroundTruthTracker({
  municipality,
  serviceDomain,
  ward,
}: GroundTruthTrackerProps) {
  const [realityFeed, setRealityFeed] = useState<RealityFeedItem[]>([]);
  const [narrative, setNarrative] = useState<any>({ who: "", what: "", why: "", when: "", how: "" });
  const [stats, setStats] = useState<StatItem[]>([]);
  const [treemapData, setTreemapData] = useState<any[]>([]);
  const [insight, setInsight] = useState<ControlledInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const router = useRouter();

  function handleInvestigateLeader() {
    // Navigate to leadership tab, we can pass the municipality to filter leaders
    router.push(`/executive/leadership?municipality=${encodeURIComponent(municipality)}`);
  }

  useEffect(() => {
    async function fetchData() {
      if (!municipality || municipality === "All Municipalities") {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const domainQuery = serviceDomain && serviceDomain !== "all" ? `&serviceDomain=${encodeURIComponent(serviceDomain)}` : "";
        const wardQuery = ward && ward !== "All Wards" ? `&ward=${encodeURIComponent(ward)}` : "";
        const res = await fetch(`/api/analytics/ground-truth?municipality=${encodeURIComponent(municipality)}${domainQuery}${wardQuery}`);
        const data = await res.json();
        
        if (data.realityFeed) setRealityFeed(data.realityFeed);
        if (data.stats) setStats(data.stats);
        if (data.treemapData) setTreemapData(data.treemapData);
        if (data.insight) setInsight(data.insight);
      } catch (err) {
        console.error("Failed to fetch ground truth data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [municipality, serviceDomain]);

  if (municipality === "All Municipalities" || !municipality) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200">
        <MapIcon className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-black text-slate-700 uppercase tracking-widest text-center">
          Province-Wide Selection
        </h3>
        <p className="text-slate-500 font-medium text-center max-w-lg mt-2">
          The Ground Truth Tracker requires a specific municipality to be selected. Please use the map or the top dropdown to drill down into localized data.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-50 border border-slate-200">
        <ProgressSpinner durationMs={12000} message="Mining Local Intelligence..." />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {" "}
      {/* 1. NARRATIVE SUMMARY PANEL & 2. KPI CARDS */}{" "}
      <div className="bg-slate-900 p-8 border border-slate-700 shadow-2xl relative overflow-hidden">
        {" "}
        {/* Background Decor */}{" "}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />{" "}
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-rose-600/10 blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />{" "}
        <div className="relative z-10">
          {" "}
          <div className="flex justify-between items-start mb-6 border-b border-slate-700/50 pb-6">
            {" "}
            <div className="flex items-center gap-3">
              {" "}
              <div className="p-2 bg-purple-500/20">
                {" "}
                <MapPin className="w-6 h-6 text-purple-400" />{" "}
              </div>{" "}
              <div>
                {" "}
                <h2 className="text-white font-black text-xl uppercase tracking-widest leading-none">
                  {" "}
                  Local Intelligence Brief{" "}
                </h2>{" "}
                <p className="text-slate-400 text-[10px] font-bold tracking-wider mt-1 uppercase">
                  {" "}
                  {ward && ward !== "All Wards" ? `${ward}, ${municipality}` : municipality} • Ground Truth Synthesis{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}

          </div>{" "}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {" "}
            <div className="lg:col-span-2 space-y-4 max-w-4xl">
              {" "}
                {insight ? (
                  <>
                    <div className="flex gap-4 items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 w-24 shrink-0 pt-1">
                        Quantification
                      </span>
                      <p className="text-white text-lg leading-relaxed font-bold">
                        {insight.quantification}
                      </p>
                    </div>

                    <div className="flex gap-4 items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 w-24 shrink-0 pt-1">
                        Means
                      </span>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        {insight.means}
                      </p>
                    </div>

                    <div className="flex gap-4 items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 w-24 shrink-0 pt-1">
                        Opportunity
                      </span>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        {insight.opportunity}
                      </p>
                    </div>

                    <div className="flex gap-4 items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 w-24 shrink-0 pt-1">
                        Trajectory
                      </span>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        {insight.what_if}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm animate-pulse">Awaiting system analysis...</p>
                )}
            </div>{" "}
            <div className="flex flex-col gap-4 border-l border-slate-700/50 pl-8">
              {" "}
              {stats.map((stat, idx) => {
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
                      {stat.icon === "MapIcon" && <MapIcon className={`w-4 h-4 ${stat.color}`} />}
                      {stat.icon === "Activity" && <Activity className={`w-4 h-4 ${stat.color}`} />}
                      {stat.icon === "ShieldCheck" && <ShieldCheck className={`w-4 h-4 ${stat.color}`} />}
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




      <DeepDiveDrawer
        isOpen={!!selectedWard}
        onClose={() => setSelectedWard(null)}
        title={selectedWard || "Ward Intelligence"}
        subtitle={`Tactical operations and accountability trace for ${selectedWard}`}
      >
        {selectedWard && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex items-center justify-between">
               <div>
                 <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5 text-blue-600" />
                   Accountability Trace
                 </h4>
                 <p className="text-sm text-slate-500 mt-1">
                   Identify the political leadership responsible for service delivery in this specific ward.
                 </p>
               </div>
               <button 
                  onClick={handleInvestigateLeader}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded text-sm font-bold shadow-md transition-colors flex items-center gap-2"
               >
                 <MapPin className="w-4 h-4 text-rose-400" />
                 Investigate Leader
               </button>
            </div>
            {/* Skeleton Loaders for Ward Mapping Data */}
            <div className="space-y-4 animate-pulse pt-4">
               <div className="flex gap-4">
                 <div className="h-32 w-full bg-slate-200 rounded-xl border border-slate-100"></div>
                 <div className="h-32 w-1/3 bg-slate-200 rounded-xl border border-slate-100 hidden sm:block"></div>
               </div>
               <div className="h-64 w-full bg-slate-200 rounded-xl border border-slate-100"></div>
               <div className="flex justify-center items-center mt-6">
                 <Activity className="w-5 h-5 text-slate-300 mr-2" />
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processing local telemetry...</span>
               </div>
            </div>
          </div>
        )}
      </DeepDiveDrawer>
    </div>
  );
}
