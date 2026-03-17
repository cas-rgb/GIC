"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Database, Zap, Map as MapIcon, MapPin, Building2 } from 'lucide-react';
import { SA_REGIONAL_REGISTRY } from '@/data/regional-registry';

interface DatasetDensityHeatmapProps {
    data: any[];
    externalMunicipality?: string | null;
    externalWard?: string | null;
}

const CATEGORIES = [
    { label: 'All Nodes', value: 'all' },
    { label: 'Wikipedia', value: 'wikipedia' },
    { label: 'OSINT', value: 'osint' },
    { label: 'Social Media', value: 'social' },
    { label: 'News Media', value: 'news' }
];

export default function DatasetDensityHeatmap({ data, externalMunicipality, externalWard }: DatasetDensityHeatmapProps) {
    const [activeCategory, setActiveCategory] = React.useState('all');
    
    // Sync with global filter
    const activeMunicipality = externalMunicipality || 'all';
    const activeWard = externalWard || 'all';

    // Get Gauteng Registry Data
    const gautengData = SA_REGIONAL_REGISTRY.provinces.find(p => p.name === 'Gauteng');
    const municipalities = gautengData?.municipalities || [];
    const currentMuni = municipalities.find(m => m.name === activeMunicipality);
    const wards = currentMuni?.wards || [];

    // Process data to count nodes per region/municipality
    const densityData = React.useMemo(() => {
        const filtered = data.filter(item => 
            (activeCategory === 'all' || item.category?.toLowerCase() === activeCategory || item.sourceType?.toLowerCase() === activeCategory) &&
            (activeMunicipality === 'all' || item.municipality === activeMunicipality) &&
            (activeWard === 'all' || item.ward === activeWard)
        );

        const counts: Record<string, number> = {};
        
        filtered.forEach(item => {
            let key = 'Other';
            if (activeWard !== 'all') {
                // If a ward is selected, show density by Category/Source
                key = item.sourceType || item.category || 'Unknown';
            } else if (activeMunicipality !== 'all') {
                // If a municipality is selected, show density by Ward
                key = item.ward || 'General';
            } else {
                // Default: show density by Municipality
                key = item.municipality || item.province || 'Other';
            }
            counts[key] = (counts[key] || 0) + 1;
        });

        const countsArray = Object.values(counts);
        if (countsArray.length === 0) return [];

        const max = Math.max(...countsArray);
        return Object.entries(counts).map(([name, count]) => ({
            name,
            count,
            intensity: count / max
        })).sort((a, b) => b.count - a.count);
    }, [data, activeCategory, activeMunicipality, activeWard]);

    return (
        <div className="w-full bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Database className="w-5 h-5 text-gic-blue" />
                        Dataset Node Intensity
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Regional Intelligence Density (40+ Sources)</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Redundant local regional filters removed in favor of global Strategic Filter Bar */}

                    <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                        {CATEGORIES.slice(0, 3).map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setActiveCategory(cat.value)}
                                className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                    activeCategory === cat.value 
                                    ? 'bg-white text-gic-blue shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="min-h-[200px] flex items-center justify-center">
                {densityData.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                        {densityData.slice(0, 10).map((region, index) => (
                            <motion.div 
                                key={region.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative flex flex-col gap-3 p-4 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-gic-blue/5 transition-all cursor-crosshair group/box"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight truncate max-w-[80%]">{region.name}</span>
                                    <Zap className={`w-3 h-3 ${region.intensity > 0.7 ? 'text-amber-500' : 'text-slate-300'}`} />
                                </div>
                                
                                <div className="flex items-end gap-2">
                                    <span className="text-2xl font-black text-slate-900 leading-none">{region.count}</span>
                                    <span className="text-[9px] font-bold text-slate-400 mb-0.5">NODES</span>
                                </div>

                                {/* Intensity Bar */}
                                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${region.intensity * 100}%` }}
                                        className={`h-full ${region.intensity > 0.8 ? 'bg-gic-blue' : region.intensity > 0.5 ? 'bg-gic-blue/60' : 'bg-gic-blue/30'}`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Database className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-slate-900 font-bold mb-1">No Density Nodes Detected</h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Adjust category filters for real-time detection</p>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                                <MapIcon className="w-3 h-3 text-slate-400" />
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 italic">Across {densityData.length} strategic clusters</p>
                </div>
                <button className="text-[10px] font-black text-gic-blue uppercase tracking-widest hover:underline">View All Anchors</button>
            </div>
        </div>
    );
}
