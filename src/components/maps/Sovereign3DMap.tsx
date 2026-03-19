"use client";

import React, { useEffect, useMemo, useState } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { DeckProps } from "@deck.gl/core";
import { DeckGL } from "@deck.gl/react";
import { ColumnLayer } from "@deck.gl/layers";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Activity, Info, Users, X } from "lucide-react";

// Use standard type or interface for input data
interface MapDataPoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
  value: number; // For height
  color: [number, number, number];
  type: "community" | "project";
  metadata?: any;
}

function DeckGLOverlay(props: DeckProps) {
  const map = useMap();
  const [overlay] = useState(() => new GoogleMapsOverlay({}));

  useEffect(() => {
    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [map, overlay]);

  overlay.setProps(props);
  return null;
}

interface Sovereign3DMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  communities?: any[];
  projects?: any[];
}

export default function Sovereign3DMap({
  center = { lat: -26.2041, lng: 28.0473 }, // Johannesburg
  zoom = 10,
  communities = [],
  projects = [],
}: Sovereign3DMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [hoveredObject, setHoveredObject] = useState<any>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);

  // Map data to Deck.gl format
  const data: MapDataPoint[] = useMemo(() => {
    const commData = communities.map((c) => ({
      id: c.id,
      lat: c.latitude || c.lat || -26.2,
      lng: c.longitude || c.lng || 28.0,
      name: c.name,
      value: c.riskScore || c.priority || 50,
      type: "community" as const,
      // GIC Gold to Red scale base on risk
      color: (c.riskScore > 70 ? [244, 63, 94] : [204, 163, 0]) as [
        number,
        number,
        number,
      ],
      metadata: c,
    }));

    const projData = projects.map((p) => ({
      id: p.id,
      lat: p.lat || -26.1,
      lng: p.lng || 28.1,
      name: p.name,
      value: p.budget / 10000000 || 30, // Normalize budget for height
      type: "project" as const,
      color: [59, 130, 246] as [number, number, number], // GIC Blue
      metadata: p,
    }));

    return [...commData, ...projData];
  }, [communities, projects]);

  const layers = [
    new ColumnLayer({
      id: "column-layer",
      data,
      diskResolution: 12,
      radius: 1500,
      extruded: true,
      pickable: true,
      elevationScale: 100,
      getPosition: (d: MapDataPoint) => [d.lng, d.lat],
      getFillColor: (d: MapDataPoint) => [...d.color, 200],
      getElevation: (d: MapDataPoint) => d.value,
      onHover: (info) => setHoveredObject(info.object),
      onClick: (info) => setSelectedObject(info.object),
    }),
  ];

  if (!apiKey) {
    return (
      <div className="w-full h-[600px] bg-slate-950 rounded-[3rem] flex items-center justify-center border border-white/5">
        <ShieldAlert className="w-12 h-12 text-rose-500/30" />
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-[3rem] overflow-hidden border border-white/10 shadow-gic-premium relative">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="GIC_3D_COMMAND_MAP"
          disableDefaultUI={true}
          gestureHandling={"greedy"}
          className="w-full h-full"
          mapTypeId="hybrid"
          styles={DARK_MAP_STYLE}
        >
          <DeckGLOverlay layers={layers} />
        </Map>
      </APIProvider>

      {/* Floating Telemetry HUD */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <div className="p-6 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-gic-gold animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
              3D Risk Telemetry
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-display font-black text-white">
              Regional Extrusion
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Mapping {communities.length} Communities & {projects.length} GIC
              Projects
            </p>
          </div>
        </div>
      </div>

      {/* Hover Tooltip/HUD */}
      <AnimatePresence>
        {hoveredObject && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-8 left-8 z-30 pointer-events-none"
          >
            <div className="p-6 bg-white rounded-3xl shadow-gic-professional border border-slate-100 min-w-[280px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {hoveredObject.type}
              </p>
              <h4 className="text-lg font-display font-black text-slate-900 mb-3">
                {hoveredObject.name}
              </h4>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {hoveredObject.type === "community"
                    ? "Risk Intensity"
                    : "Budget Power"}
                </span>
                <span
                  className={`text-sm font-black ${hoveredObject.type === "community" ? "text-rose-500" : "text-gic-blue"}`}
                >
                  {Math.round(hoveredObject.value)} Units
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Panel */}
      <AnimatePresence>
        {selectedObject && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute top-0 right-0 h-full w-[400px] bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 z-50 p-8 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="p-3 bg-white/5 rounded-2xl">
                {selectedObject.type === "community" ? (
                  <Users className="w-6 h-6 text-gic-gold" />
                ) : (
                  <Activity className="w-6 h-6 text-gic-blue" />
                )}
              </div>
              <button
                onClick={() => setSelectedObject(null)}
                className="p-3 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-8">
              <span className="text-[10px] font-black text-gic-gold uppercase tracking-[0.3em]">
                {selectedObject.type} Overview
              </span>
              <h2 className="text-3xl font-display font-black mt-2 leading-tight">
                {selectedObject.name}
              </h2>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                  Strategic Pulse
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">
                      Regional Impact
                    </span>
                    <span className="text-sm font-black">
                      {Math.round(selectedObject.value)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedObject.value}%` }}
                      className={`h-full ${selectedObject.type === "community" ? "bg-gic-gold" : "bg-gic-blue"}`}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-950 rounded-[2rem] border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Metadata Anchor
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-400 leading-relaxed italic">
                  "Deep-space multispectral analysis indicates{" "}
                  {selectedObject.value > 70
                    ? "extreme pressure"
                    : "stable growth"}{" "}
                  in this sector. Recommend immediate deployment of{" "}
                  {selectedObject.type === "community" ? "social" : "technical"}{" "}
                  task force."
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
];
