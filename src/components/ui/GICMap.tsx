"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import { useState, useMemo, useEffect } from "react";
import {
  X,
  ExternalLink,
  Activity,
  Info,
  Gavel,
  Users,
  MessageSquare,
  TrendingUp,
  Award,
  Globe,
  Hammer,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Community } from "@/types/database";
import { getMapIntelligence } from "@/app/intel-actions";

interface GICMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  mapTypeId?: string;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title?: string;
    subtitle?: string;
    type?: "project" | "community";
  }>;
}

export default function GICMap({
  center = { lat: -28.4793, lng: 24.6727 },
  zoom = 5,
  mapTypeId = "hybrid",
  markers: initialMarkers = [],
}: GICMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSurveillance, setShowSurveillance] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);

  useEffect(() => {
    async function loadMapData() {
      const res = await getMapIntelligence();
      if (res.success) {
        setCommunities(res.communities || []);
        setSignals(res.signals || []);
      }
    }
    loadMapData();
  }, []);

  const markers = useMemo(() => {
    const communityMarkers = communities.map((c) => ({
      id: c.id,
      position: { lat: c.latitude || -26.2041, lng: c.longitude || 28.0473 },
      title: c.name,
      type: "community" as const,
    }));
    return [...initialMarkers, ...communityMarkers];
  }, [communities, initialMarkers]);

  // Find community data if the selected marker is a community
  const selectedCommunity = useMemo(() => {
    return communities.find((c) => c.id === selectedId);
  }, [selectedId, communities]);

  const communitySignals = useMemo(() => {
    if (!selectedId) return [];
    const community = communities.find((c) => c.id === selectedId);
    if (!community) return [];
    return signals
      .filter((s) => s.municipality === community.municipality)
      .slice(0, 5);
  }, [selectedId, communities, signals]);

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
    setShowSurveillance(true);
  };

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-slate-950 rounded-[2.5rem] flex items-center justify-center p-12 text-center border border-white/5 shadow-inner">
        <div className="max-w-xs relative">
          <div className="absolute -inset-10 bg-gic-blue/10 blur-[50px] rounded-full translate-y-5" />
          <ShieldAlert className="w-12 h-12 text-rose-500/50 mx-auto mb-6 animate-pulse" />
          <p className="text-base font-display font-black text-white mb-2 uppercase tracking-tight">
            Intelligence Node Offline
          </p>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed">
            Geospatial Uplink Restricted. Verify NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            for real-time regional telemetry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-[2.5rem] overflow-hidden border border-white/5 shadow-gic-premium relative bg-slate-950">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="GIC_COMMAND_MAP"
          mapTypeId={mapTypeId}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          className="w-full h-full"
          onClick={() => setShowSurveillance(false)}
        >
          {markers.map((marker) => (
            <AdvancedMarker
              key={marker.id}
              position={marker.position}
              title={marker.title}
              onClick={() => handleMarkerClick(marker.id)}
            >
              <div className="relative group">
                <div
                  className={`absolute inset-0 -m-3 ${marker.type === "community" ? "bg-amber-500/20" : "bg-gic-blue/20"} rounded-full animate-ping pointer-events-none`}
                />
                <div
                  className={`absolute inset-0 -m-1.5 ${marker.type === "community" ? "bg-amber-500/30" : "bg-gic-blue/30"} rounded-full animate-pulse pointer-events-none`}
                />

                <div
                  className={`relative w-8 h-8 ${marker.type === "community" ? "bg-slate-900 border-amber-500" : "bg-slate-900 border-white"} rounded-full flex items-center justify-center border-2 shadow-xl transition-transform group-hover:scale-110`}
                >
                  {marker.type === "community" ? (
                    <Users className="w-4 h-4 text-amber-500" />
                  ) : (
                    <div className="w-2.5 h-2.5 bg-gic-blue rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  )}
                </div>
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      {/* Surveillance Pane Overlay */}
      <AnimatePresence>
        {showSurveillance && selectedCommunity && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 w-[400px] h-full bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 p-8 overflow-y-auto scrollbar-hide text-white"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                  <Globe className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-xl font-display font-black">
                    {selectedCommunity.name}
                  </h4>
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                    {selectedCommunity.municipality} • Surveillance View
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSurveillance(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wikipedia Brief */}
            <div className="mb-8">
              <p className="text-[11px] leading-relaxed text-slate-400 italic">
                "
                {(selectedCommunity.payload?.wikipediaBrief as string) ||
                  (selectedCommunity.wikipediaBrief as string) ||
                  "Geographic intelligence pending verification. Historical signals suggest strong industrial heritage and evolving administrative boundaries."}
                "
              </p>
            </div>

            {/* Governance Registry */}
            <div className="space-y-4 mb-8">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Political & Governance Stack
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Mayor
                  </p>
                  <p className="text-xs font-bold">
                    {selectedCommunity.governance?.mayor || "Pending"}
                  </p>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Premier
                  </p>
                  <p className="text-xs font-bold">
                    {selectedCommunity.governance?.premier || "Pending"}
                  </p>
                </div>
                <div className="col-span-2 p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Vote Distribution
                  </p>
                  <div className="flex items-center gap-2">
                    {Object.entries(
                      selectedCommunity.governance?.voteSplit || {},
                    ).map(([party, split]: [string, any], idx) => (
                      <div key={idx} className="flex-1">
                        <div className="flex justify-between text-[9px] mb-1">
                          <span>{party}</span>
                          <span>{split}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500"
                            style={{ width: `${split}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cultural Markers */}
            <div className="mb-8">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                Cultural & Social IQ
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCommunity.culture?.primaryLanguages.map(
                  (lang: string) => (
                    <span
                      key={lang}
                      className="px-3 py-1.5 bg-gic-blue/20 border border-gic-blue/30 rounded-xl text-[10px] font-bold text-gic-blue"
                    >
                      {lang}
                    </span>
                  ),
                )}
                {selectedCommunity.culture?.niches.map((niche: string) => (
                  <span
                    key={niche}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300"
                  >
                    {niche}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Signal Stream */}
            <div className="space-y-6 mb-8">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Live Event Stream
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase">
                    Live Pulse
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {communitySignals.map((signal, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-slate-500" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                          {signal.source}
                        </span>
                      </div>
                      <span
                        className={`text-[8px] font-black px-2 py-0.5 rounded-full ${signal.sentiment === "negative" ? "bg-rose-500/20 text-rose-500" : "bg-emerald-500/20 text-emerald-500"}`}
                      >
                        {signal.sentiment.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed opacity-80">
                      {signal.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Makers & Funding Partners */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-gic-blue/10 border border-gic-blue/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Hammer className="w-4 h-4 text-gic-blue" />
                  <span className="text-[10px] font-black text-gic-blue uppercase tracking-widest">
                    CapEx Authority
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-300">
                  Infrastructure Director
                </p>
                <p className="text-xs font-black text-white mt-1">B. Mthembu</p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                    Funding Match
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-300">
                  DBSA Pipeline
                </p>
                <p className="text-xs font-black text-white mt-1">Enabled</p>
              </div>
            </div>

            {/* Environmental & Risk HUD */}
            <div className="p-6 bg-slate-800/50 border border-white/5 rounded-[2rem]">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                Risk Horizon HUD
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-rose-500/20 rounded-lg">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <span className="text-xs font-bold">Crime Index</span>
                  </div>
                  <span className="text-xs font-black text-rose-500">
                    {selectedCommunity.environmental?.crimeRate || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gic-blue/20 rounded-lg">
                      <Globe className="w-3.5 h-3.5 text-gic-blue" />
                    </div>
                    <span className="text-xs font-bold">
                      Weather Resiliency
                    </span>
                  </div>
                  <span className="text-xs font-black text-gic-blue">
                    {selectedCommunity.environmental?.weatherRisk || "Standard"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Overlay for "Command Centre" feel */}
      <div className="absolute top-6 left-6 z-10 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">
            Live Command Uplink
          </span>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Activity className="w-2.5 h-2.5" />
            Scanning: {markers.length} Nodes
          </p>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Info className="w-2.5 h-2.5" />
            Surveillance Mode: Active
          </p>
        </div>
      </div>

      <style>{`
                .custom-info-window .gm-style-iw-c {
                    padding: 0 !important;
                    border-radius: 1.5rem !important;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
                    display: none !important;
                }
                .gm-style-iw-tc {
                    display: none !important;
                }
            `}</style>
    </div>
  );
}
