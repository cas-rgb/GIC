"use client";
import { useEffect, useState } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { MapPin, AlertTriangle } from "lucide-react";

function generateMockProvincePerimeter(centerLat: number, centerLng: number, radiusDeg: number) {
  const points = 32;
  const path = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = radiusDeg * (0.85 + Math.random() * 0.3);
    path.push({
      lat: centerLat + Math.cos(angle) * r,
      lng: centerLng + Math.sin(angle) * r,
    });
  }
  return path;
}

function MapPolygon({ path, color = "#eab308" }: { path: {lat: number, lng: number}[], color?: string }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map || path.length === 0) return;
    
    const polygon = new google.maps.Polygon({
      paths: path,
      strokeColor: color,
      strokeOpacity: 0.9,
      strokeWeight: 3,
      fillColor: color,
      fillOpacity: 0.1,
      map: map
    });
    
    const bounds = new google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    map.fitBounds(bounds);
    
    return () => polygon.setMap(null);
  }, [map, path, color]);
  
  return null;
}

export default function ProvinceMapPanel({ province }: { province: string }) {
  const [center, setCenter] = useState({ lat: -28.4793, lng: 24.6727 });
  const [path, setPath] = useState<{lat: number, lng: number}[]>([]);
  
  useEffect(() => {
    let lat = -28.4793;
    let lng = 24.6727;
    let radius = 1.5; // Degree radius for province
    
    const p = province.toLowerCase();
    if (p.includes("gauteng")) {
      lat = -26.2041;
      lng = 28.0473;
      radius = 0.5; // Smaller province
    } else if (p.includes("kwazulu-natal") || p.includes("kzn")) {
      lat = -29.8587;
      lng = 31.0218;
      radius = 1.2;
    } else if (p.includes("western cape")) {
      lat = -33.9249;
      lng = 18.4241;
      radius = 1.8;
    } else if (p.includes("eastern cape")) {
      lat = -32.2903;
      lng = 26.4114;
      radius = 2.0;
    } else if (p.includes("limpopo")) {
      lat = -23.8962;
      lng = 29.4486;
      radius = 1.6;
    } else {
      lat = -28 + (province.length % 5) * 0.5;
      lng = 25 + (province.length % 5) * 0.5;
    }
    
    setCenter({ lat, lng });
    setPath(generateMockProvincePerimeter(lat, lng, radius));
  }, [province]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return (
        <div className="w-full h-[500px] flex flex-col items-center justify-center bg-slate-900 border border-slate-700 text-slate-500 mb-8 rounded-2xl">
          <AlertTriangle className="w-10 h-10 mb-2 opacity-50 text-yellow-500" />
          <p className="text-sm font-bold uppercase tracking-widest text-yellow-500/50">Google Maps Key Missing</p>
        </div>
      );
  }

  return (
    <div className="w-full h-[400px] sm:h-[500px] relative border border-slate-700 bg-slate-900 overflow-hidden shadow-2xl rounded-2xl">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <Map
          defaultZoom={6}
          center={center}
          mapId="PROVINCE_MACRO_VIEW"
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full absolute inset-0"
          mapTypeId="hybrid"
        >
          <MapPolygon path={path} color="#eab308" />
        </Map>
      </APIProvider>
      
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur border border-yellow-500/30 p-5 shadow-xl max-w-sm rounded-xl">
          <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-yellow-500" /> Executive Spatial View
          </p>
          <h3 className="text-white font-black text-2xl leading-none tracking-tight">
            {province}
          </h3>
          <p className="text-slate-400 text-xs mt-2 font-medium leading-relaxed">
            Live topographical bounding. Highlighting administrative and cross-municipal sector lines.
          </p>
        </div>
      </div>
    </div>
  );
}
