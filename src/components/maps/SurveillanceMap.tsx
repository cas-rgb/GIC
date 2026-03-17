"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, MapPin, Database } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';

interface SurveillanceMapProps {
    center?: { lat: number; lng: number };
    zoom?: number;
    onNodeSelect?: (node: any) => void;
}

export default function SurveillanceMap({
    center = { lat: -26.2041, lng: 28.0473 }, // Johannesburg focus
    zoom = 11,
    onNodeSelect
}: SurveillanceMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const [datasets, setDatasets] = useState<any[]>([]);
    const [hoveredNode, setHoveredNode] = useState<any>(null);

    // Fetch Strategic Datasets
    useEffect(() => {
        const q = query(collection(db, "strategicDatasets"), limit(200));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDatasets(docs);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const initMap = async () => {
            const loader = new Loader({
                apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
                version: 'weekly'
            });

            const { Map, Marker, SymbolPath } = await (loader as any).importLibrary('maps');

            if (mapRef.current && !googleMapRef.current) {
                googleMapRef.current = new Map(mapRef.current, {
                    center,
                    zoom,
                    mapId: 'GIC_SURVEILLANCE_MAP',
                    disableDefaultUI: true,
                    backgroundColor: '#0f172a',
                    styles: [
                        { "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
                        { "elementType": "labels.text.stroke", "stylers": [{ "visibility": "off" }] },
                        { "elementType": "labels.text.fill", "stylers": [{ "color": "#475569" }] },
                        { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
                        { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
                        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
                        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
                        { "featureType": "transit", "stylers": [{ "visibility": "off" }] },
                        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] }
                    ]
                });
            }

            // Clear markers
            markersRef.current.forEach(m => m.setMap(null));
            markersRef.current = [];

            // Add Dataset Points
            datasets.forEach((node) => {
                if (!node.lat || !node.lng) return;

                const marker = new Marker({
                    position: { lat: Number(node.lat), lng: Number(node.lng) },
                    map: googleMapRef.current,
                    icon: {
                        path: SymbolPath.CIRCLE,
                        fillColor: '#3b82f6',
                        fillOpacity: 0.9,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                        scale: 8,
                    }
                });

                marker.addListener('mouseover', () => setHoveredNode(node));
                marker.addListener('mouseout', () => setHoveredNode(null));
                marker.addListener('click', () => {
                    if (onNodeSelect) onNodeSelect(node);
                });

                markersRef.current.push(marker);
            });
        };

        if (typeof window !== 'undefined') {
            initMap();
        }
    }, [center, zoom, datasets]);

    return (
        <div className="w-full h-full relative overflow-hidden rounded-[2.5rem] border border-slate-800 shadow-2xl">
            <div ref={mapRef} className="w-full h-full bg-slate-900" />
            
            {/* Surveillance Overlay UI */}
            <div className="absolute top-6 left-6 z-10 space-y-2 pointer-events-none">
                <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Surveillance Active</span>
                </div>
                <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3">
                    <Database className="w-3.5 h-3.5 text-gic-gold" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{datasets.length} Strategic Nodes Polled</span>
                </div>
            </div>

            {/* Hover Tooltip */}
            <AnimatePresence>
                {hoveredNode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute z-50 pointer-events-none"
                        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                    >
                        <div className="bg-slate-950 border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[200px]">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{hoveredNode.category || 'Strategic Node'}</p>
                            <h5 className="text-white font-bold mb-2">{hoveredNode.projectName || hoveredNode.name || 'Unnamed Data Point'}</h5>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                <MapPin className="w-3 h-3" />
                                {hoveredNode.municipality} {hoveredNode.ward ? `(Ward ${hoveredNode.ward})` : ''}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
