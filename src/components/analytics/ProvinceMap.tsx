"use client";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { MunicipalityRankingResponse } from "@/lib/analytics/types";

interface ProvinceMapProps {
  province: string;
  days: number;
  onMunicipalitySelect?: (municipalityId: string) => void;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: MunicipalityRankingResponse }
  | { status: "error"; message: string };

const PROVINCIAL_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Gauteng
  "City of Johannesburg": { lat: -26.2041, lng: 28.0473 },
  "City of Tshwane": { lat: -25.7479, lng: 28.2293 },
  "Ekurhuleni": { lat: -26.1705, lng: 28.3204 },
  "West Rand": { lat: -26.10, lng: 27.60 },
  "Sedibeng": { lat: -26.65, lng: 27.93 },
  // Western Cape
  "City of Cape Town": { lat: -33.9249, lng: 18.4241 },
  "Cape Winelands": { lat: -33.6441, lng: 19.4336 },
  "Overberg": { lat: -34.3312, lng: 19.7997 },
  "Garden Route": { lat: -33.9621, lng: 22.4560 },
  "West Coast": { lat: -33.0232, lng: 18.6738 },
  // KZN
  "eThekwini": { lat: -29.8587, lng: 31.0218 },
  "uMgungundlovu": { lat: -29.6006, lng: 30.3794 },
  "iLembe": { lat: -29.3562, lng: 31.2599 },
  // Eastern Cape
  "Nelson Mandela Bay": { lat: -33.9608, lng: 25.6022 },
  "Buffalo City": { lat: -32.9815, lng: 27.8864 },
  "OR Tambo": { lat: -31.5831, lng: 28.7845 },
  // Free State
  "Mangaung": { lat: -29.1141, lng: 26.2208 },
  "Lejweleputswa": { lat: -28.0287, lng: 26.6669 },
  // Mpumalanga
  "Ehlanzeni": { lat: -25.4753, lng: 30.9852 },
  "Nkangala": { lat: -25.7725, lng: 29.4608 },
  // Limpopo
  "Capricorn": { lat: -23.9045, lng: 29.4688 },
  "Mopani": { lat: -23.8687, lng: 30.5516 },
  // North West
  "Bojanala": { lat: -25.6667, lng: 27.6667 },
  "Ngaka Modiri Molema": { lat: -25.8652, lng: 25.6442 },
  // Northern Cape
  "Frances Baard": { lat: -28.7282, lng: 24.7439 },
  "Pixley ka Seme": { lat: -30.6558, lng: 23.9822 }
};

export default function ProvinceMap({
  province,
  days,
  onMunicipalitySelect,
}: ProvinceMapProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [hoveredMuni, setHoveredMuni] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function load() {
      setState({ status: "loading" });
      try {
        const response = await fetch(
          `/api/analytics/municipality-ranking?province=${encodeURIComponent(province)}&days=${days}`,
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error("Failed to fetch map data");
        const data = await response.json();
        setState({ status: "loaded", data });
      } catch (error) {
        setState({ status: "error", message: String(error) });
      }
    }
    void load();
  }, [province, days]);

  const sortedMunicipalities = useMemo(() => {
    if (state.status !== "loaded") return [];
    return state.data.rows;
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-100 relative text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">
          Loading Map Hotspots
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-100 relative text-slate-400">
        <AlertTriangle className="w-8 h-8 text-amber-500 mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-900">
          Map Data Unavailable
        </p>
        <p className="text-xs">{state.message}</p>
      </div>
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  
  const PROVINCE_CENTERS: Record<string, { lat: number; lng: number }> = {
    "Eastern Cape": { lat: -32.29, lng: 26.41 },
    "Free State": { lat: -28.45, lng: 26.79 },
    "Gauteng": { lat: -26.15, lng: 28.0 },
    "KwaZulu-Natal": { lat: -28.53, lng: 30.89 },
    "Limpopo": { lat: -23.40, lng: 29.41 },
    "Mpumalanga": { lat: -25.56, lng: 30.52 },
    "Northern Cape": { lat: -29.04, lng: 21.85 },
    "North West": { lat: -26.66, lng: 25.28 },
    "Western Cape": { lat: -33.22, lng: 21.85 },
    "All Provinces": { lat: -29.0, lng: 24.0 },
  };

  const mapCenter = PROVINCE_CENTERS[province] || { lat: -29.0, lng: 24.0 };

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative">
      <div className="flex-1 bg-slate-900 relative overflow-hidden flex items-center justify-center min-h-[300px] md:min-h-[400px]">
        {!apiKey ? (
          <div className="text-slate-400 font-bold p-8 text-center bg-slate-800 rounded-xl border border-slate-700 max-w-sm">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <p className="text-lg text-white mb-2">Google Maps Key Missing</p>
            <p className="text-sm">Please provide NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.</p>
          </div>
        ) : (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultZoom={9}
              defaultCenter={mapCenter}
              mapId="GIC_PROVINCE_MAP"
              gestureHandling={"greedy"}
              disableDefaultUI={true}
              className="w-full h-full absolute inset-0"
            >
              {sortedMunicipalities.map((muni) => {
                const risk = Number(muni.riskScore) || 0;
                let coords = PROVINCIAL_COORDINATES[muni.municipality];
                if (!coords) {
                  // Generate deterministic pseudo-random offset via string hash to prevent React render jitter
                  const hash = muni.municipality.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const pseudoRandomLat = ((hash % 100) / 100 - 0.5) * 0.5;
                  const pseudoRandomLng = (((hash * 7) % 100) / 100 - 0.5) * 0.5;
                  coords = {
                    lat: mapCenter.lat + pseudoRandomLat,
                    lng: mapCenter.lng + pseudoRandomLng,
                  };
                }
                
                const colorClass = risk > 70 ? "#ef4444" : risk > 40 ? "#f59e0b" : "#3b82f6";

                return (
                  <AdvancedMarker
                    key={muni.municipality}
                    position={coords}
                    onMouseEnter={() => setHoveredMuni(muni.municipality)}
                    onMouseLeave={() => setHoveredMuni(null)}
                    onClick={() => {
                      if (onMunicipalitySelect && risk > 0) {
                        onMunicipalitySelect(muni.municipality);
                      }
                    }}
                  >
                    <Pin
                      background={colorClass}
                      borderColor={"#1e293b"}
                      glyphColor="#ffffff"
                      scale={isMobile ? 0.8 + risk / 150 : 1.2 + risk / 100}
                    />
                  </AdvancedMarker>
                );
              })}
            </Map>
          </APIProvider>
        )}
      </div>

      <div className="w-full md:w-80 bg-white border-l border-slate-100 p-6 flex flex-col h-full overflow-y-auto shrink-0 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex justify-between items-center">
          <span>Heatmap Targets</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{sortedMunicipalities.length} Areas</span>
        </h4>
        <div className="flex flex-col gap-3">
          {sortedMunicipalities.map((muni) => {
            const risk = Number(muni.riskScore) || 0;
            return (
              <button
                key={`list-${muni.municipality}`}
                onClick={() => onMunicipalitySelect?.(muni.municipality)}
                onMouseEnter={() => setHoveredMuni(muni.municipality)}
                onMouseLeave={() => setHoveredMuni(null)}
                className={`flex items-center justify-between p-3 border hover:border-blue-200 transition-all text-left group
                  ${hoveredMuni === muni.municipality ? 'bg-blue-50 border-blue-200' : 'border-slate-100'} cursor-pointer hover:bg-slate-50
                `}
              >
                <div>
                  <p className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                    {muni.municipality}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-base font-black ${risk > 70 ? "text-red-500" : risk > 40 ? "text-amber-500" : "text-blue-500"}`}>
                      {risk}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform text-blue-400 group-hover:translate-x-1 group-hover:text-blue-600`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
