"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ShieldCheck, MapPin } from "lucide-react";
import { CommunityNode } from "@/data/communities";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, limit } from "firebase/firestore";

interface SAMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  activeLayers: string[];
  onNodeClick?: (node: CommunityNode) => void;
  storyStep?: number;
  selectedService?: string | null;
}

export default function SAMap({
  center = { lat: -28.4793, lng: 24.6727 },
  zoom = 6,
  activeLayers = ["demand", "signals"],
  onNodeClick,
  storyStep,
  selectedService,
}: SAMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const heatmapRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<CommunityNode | null>(null);
  const [communities, setCommunities] = useState<CommunityNode[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    // Story Mode Panning
    if (
      googleMapRef.current &&
      storyStep !== undefined &&
      communities.length > 0
    ) {
      const stepNode = communities[storyStep % communities.length];
      googleMapRef.current.panTo({ lat: stepNode.lat, lng: stepNode.lng });
      googleMapRef.current.setZoom(10);
    }
  }, [storyStep, communities]);

  // Firestore Listener - Communities
  useEffect(() => {
    const q = query(collection(db, "community_signals"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as CommunityNode,
      );
      setCommunities(docs);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listener - Master Projects
  useEffect(() => {
    const q = query(collection(db, "gic_projects"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(docs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        version: "weekly",
        libraries: ["visualization"],
      });

      const { Map, Marker, SymbolPath } = await (loader as any).importLibrary(
        "maps",
      );
      const { HeatmapLayer } = await (loader as any).importLibrary(
        "visualization",
      );

      if (mapRef.current && !googleMapRef.current) {
        googleMapRef.current = new Map(mapRef.current, {
          center,
          zoom,
          mapId: "GIC_REGIONAL_MAP",
          disableDefaultUI: true,
          backgroundColor: "#ffffff",
          styles: [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#475569" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.stroke",
              stylers: [{ visibility: "off" }],
            },
            { featureType: "landscape", stylers: [{ color: "#f8fafc" }] },
            { featureType: "water", stylers: [{ color: "#e2e8f0" }] },
            {
              featureType: "administrative",
              elementType: "geometry.stroke",
              stylers: [{ color: "#cbd5e1" }, { weight: 1 }],
            },
            { featureType: "road", stylers: [{ visibility: "off" }] },
            { featureType: "poi", stylers: [{ visibility: "off" }] },
          ],
        });
      }

      // Clear existing markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      // Community Signals Layer
      if (activeLayers.includes("signals")) {
        communities.forEach((node) => {
          const matchesService =
            !selectedService ||
            selectedService === "apex" ||
            (selectedService === "water" && node.issue === "Water") ||
            (selectedService === "roads" && node.issue === "Roads") ||
            (selectedService === "health" && node.issue === "Health") ||
            (selectedService === "planning" &&
              node.issue === "Town Planning") ||
            (selectedService === "structural" && node.issue === "Structural");

          const color =
            node.sentiment < 40
              ? "#ef4444"
              : node.sentiment < 70
                ? "#3b82f6"
                : "#22c55e";
          const scale = (node.priority / 100) * 12 + 4;
          const opacity = matchesService ? 1 : 0.2;

          const marker = new Marker({
            position: { lat: node.lat, lng: node.lng },
            map: googleMapRef.current,
            opacity: opacity,
            icon: {
              path: SymbolPath.CIRCLE,
              fillColor: color,
              fillOpacity: 0.8,
              strokeColor: matchesService ? "#ffffff" : "transparent",
              strokeWeight: matchesService ? 2 : 0,
              scale: matchesService ? scale * 1.2 : scale,
            },
          });

          marker.addListener("mouseover", () => setHoveredNode(node));
          marker.addListener("mouseout", () => setHoveredNode(null));
          marker.addListener("click", () => {
            if (onNodeClick) onNodeClick(node);
          });

          markersRef.current.push(marker);
        });
      }

      // GIC Master Project Sites Layer
      if (activeLayers.includes("projects")) {
        projects.forEach((proj) => {
          const marker = new Marker({
            position: { lat: proj.lat, lng: proj.lng },
            map: googleMapRef.current,
            title: proj.name,
            label: {
              text: proj.name.substring(0, 1),
              color: "white",
              fontSize: "10px",
              fontWeight: "bold",
            },
            icon: {
              path: "M 0,-1 L 1,0 L 0,1 L -1,0 Z", // Diamond
              fillColor: proj.status === "Active" ? "#D0A700" : "#3b82f6",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 12,
            },
          });
          markersRef.current.push(marker);
        });
      }

      // Infrastructure Demand & Failure Hotspot Layer
      if (activeLayers.includes("demand") || activeLayers.includes("hotspot")) {
        const isHotspot = activeLayers.includes("hotspot");
        const heatmapData = communities
          .map((node) => {
            const latLng = new (window as any).google.maps.LatLng(
              node.lat,
              node.lng,
            );
            // Hotspots focus on high-priority negative sentiment signals
            const weight = isHotspot
              ? node.sentiment < 40
                ? node.priority
                : 0
              : node.priority / 10;

            return {
              location: latLng,
              weight: weight,
            };
          })
          .filter((h) => h.weight > 0);

        if (heatmapRef.current) heatmapRef.current.setMap(null);

        heatmapRef.current = new HeatmapLayer({
          data: heatmapData,
          map: googleMapRef.current,
          radius: isHotspot ? 100 : 60,
          opacity: isHotspot ? 0.8 : 0.5,
          gradient: isHotspot
            ? [
                "rgba(0, 255, 255, 0)",
                "rgba(244, 63, 94, 0.4)",
                "rgba(244, 63, 94, 0.6)",
                "rgba(244, 63, 94, 0.8)",
                "rgba(255, 255, 255, 1)",
              ]
            : undefined,
        });
      } else if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
      }
    };

    if (typeof window !== "undefined") {
      initMap();
    }
  }, [center, zoom, activeLayers, onNodeClick, communities]);

  return (
    <div className="w-full h-full relative group">
      <div ref={mapRef} className="w-full h-full" />

      {/* Intelligence Tooltip (Hover) */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-50 pointer-events-none"
            style={{
              left: "50%",
              top: "40%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-gic-professional min-w-[240px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                {hoveredNode.name}
              </p>
              <div className="flex justify-between items-baseline mb-3">
                <p className="text-xl font-display font-bold text-slate-900 tracking-tight">
                  Level {hoveredNode.priority}
                </p>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  {hoveredNode.issue}
                </span>
              </div>
              <div className="h-[1px] w-full bg-slate-100 mb-3" />
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3 overflow-hidden">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center"
                    >
                      <Users className="w-3 h-3 text-slate-400" />
                    </div>
                  ))}
                </div>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  {hoveredNode.influencers.length} Stakeholders Identified
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
