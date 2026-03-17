"use client";

import React from 'react';
import { 
    ScatterChart, 
    Scatter, 
    XAxis, 
    YAxis, 
    ZAxis, 
    Tooltip, 
    ResponsiveContainer,
    Cell,
    CartesianGrid
} from 'recharts';
import { Target, TrendingUp, MapPin, Building2 } from 'lucide-react';
import { SA_REGIONAL_REGISTRY } from '@/data/regional-registry';

interface OpportunityIndexPlotProps {
    risks: any[];
    planning: any[];
    tenders: any[];
    externalMunicipality?: string | null;
    externalWard?: string | null;
}

const SECTORS = [
    { label: 'All Sectors', value: 'all' },
    { label: 'Civil', value: 'civil' },
    { label: 'Roads', value: 'roads' },
    { label: 'Health', value: 'health' },
    { label: 'Water', value: 'water' }
];

const DOMAINS = [
    { label: 'All Domains', value: 'all' },
    { label: 'Political', value: 'Political' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Infrastructure', value: 'Infrastructure' },
    { label: 'Social', value: 'Social' }
];

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#0ea5e9'];

export default function OpportunityIndexPlot({ 
    risks, 
    planning, 
    tenders,
    externalMunicipality,
    externalWard
}: OpportunityIndexPlotProps) {
    const [activeSector, setActiveSector] = React.useState('all');
    const [activeDomain, setActiveDomain] = React.useState('all');
    
    // Sync with external filters or use local state
    const activeMunicipality = externalMunicipality || 'all';
    const activeWard = externalWard || 'all';

    // Get Gauteng Registry Data
    const gautengData = SA_REGIONAL_REGISTRY.provinces.find(p => p.name === 'Gauteng');
    const municipalities = gautengData?.municipalities || [];
    const currentMuni = municipalities.find(m => m.name === activeMunicipality);
    const wards = currentMuni?.wards || [];

    const chartData = React.useMemo(() => {
        // Aggregate by municipality
        const municipalitiesTyped: Record<string, { x: number, y: number, z: number, name: string }> = {};

        // Local Filtering logic
        const filteredPlanning = planning.filter(p => 
            (activeSector === 'all' || p.sector === activeSector) &&
            (activeDomain === 'all' || p.domain === activeDomain) &&
            (activeMunicipality === 'all' || p.municipality === activeMunicipality) &&
            (activeWard === 'all' || p.ward === activeWard)
        );

        const filteredRisks = risks.filter(r => 
            (activeSector === 'all' || r.sector === activeSector) &&
            (activeDomain === 'all' || r.domain === activeDomain) &&
            (activeMunicipality === 'all' || r.municipality === activeMunicipality) &&
            (activeWard === 'all' || r.ward === activeWard)
        );

        const filteredTenders = tenders.filter(t => 
            (activeSector === 'all' || t.sector === activeSector) &&
            (activeDomain === 'all' || t.domain === activeDomain) &&
            (activeMunicipality === 'all' || t.municipality === activeMunicipality) &&
            (activeWard === 'all' || t.ward === activeWard)
        );

        // 1. Process Planning Budgets (Y-Axis)
        filteredPlanning.forEach(p => {
            const mun = activeWard !== 'all' ? p.ward : (activeMunicipality !== 'all' ? p.municipality : (p.municipality || p.province || 'National'));
            if (!municipalitiesTyped[mun]) municipalitiesTyped[mun] = { x: 0, y: 0, z: 0, name: mun };
            municipalitiesTyped[mun].y += (p.budgetAllocation || p.budget || 0);
        });

        // 2. Process Risk Signals (X-Axis: Signal Complexity)
        filteredRisks.forEach(r => {
            const mun = activeWard !== 'all' ? r.ward : (activeMunicipality !== 'all' ? r.municipality : (r.municipality || r.province || 'National'));
            if (!municipalitiesTyped[mun]) municipalitiesTyped[mun] = { x: 0, y: 0, z: 0, name: mun };
            municipalitiesTyped[mun].x += 1;
        });

        // 3. Process Tenders (Z-Axis: Tender Volume)
        filteredTenders.forEach(t => {
            const mun = activeWard !== 'all' ? t.ward : (activeMunicipality !== 'all' ? t.municipality : (t.municipality || t.province || 'National'));
            if (!municipalitiesTyped[mun]) municipalitiesTyped[mun] = { x: 0, y: 0, z: 0, name: mun };
            municipalitiesTyped[mun].z += 1;
        });

        return Object.values(municipalitiesTyped);
    }, [risks, planning, tenders, activeSector, activeDomain, activeMunicipality, activeWard]);

    const formatCurrency = (value: number) => {
        return `R${(value / 1000000).toFixed(1)}M`;
    };

    return (
        <div className="w-full h-[400px] bg-slate-900 border border-slate-800 rounded-[3rem] p-10 flex flex-col relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gic-blue/10 blur-[80px] -mr-32 -mt-32" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Target className="w-6 h-6 text-gic-blue" />
                        Opportunity Sweet Spot Index
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black mt-1">Complexity (Risk) vs. Budget (Allocation)</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 relative z-20">
                    {/* Redundant local regional filters removed in favor of global Strategic Filter Bar */}

                    {/* Local Sector Toggle */}
                    <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                        {SECTORS.slice(0, 3).map(s => (
                            <button
                                key={s.value}
                                onClick={() => setActiveSector(s.value)}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeSector === s.value ? 'bg-gic-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Local Domain Toggle */}
                    <select 
                        value={activeDomain}
                        onChange={(e) => setActiveDomain(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white text-[10px] font-black rounded-xl px-4 py-2 uppercase tracking-widest focus:ring-2 focus:ring-gic-blue"
                    >
                        {DOMAINS.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 w-full relative z-10 flex items-center justify-center">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis 
                                type="number" 
                                dataKey="x" 
                                name="Complexity" 
                                unit=" Signals" 
                                stroke="#64748b" 
                                fontSize={10} 
                                tick={{ fontWeight: 'bold' }}
                            />
                            <YAxis 
                                type="number" 
                                dataKey="y" 
                                name="Budget" 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickFormatter={formatCurrency}
                                tick={{ fontWeight: 'bold' }}
                            />
                            <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Tenders" />
                            <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }} 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '12px' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                labelStyle={{ color: '#fff', marginBottom: '8px' }}
                                formatter={(value: any, name: any) => {
                                    if (name === 'Budget') return formatCurrency(value);
                                    return value;
                                }}
                            />
                            <Scatter name="Regions" data={chartData}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.6} stroke={COLORS[index % COLORS.length]} strokeWidth={2} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                            <Target className="w-8 h-8 text-slate-600" />
                        </div>
                        <h4 className="text-white font-bold mb-1">No Intelligence Data Found</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Refine filters or check GIC database connection</p>
                    </div>
                )}
            </div>

            {/* Strategic Prompt */}
            <div className="mt-4 flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl relative z-10">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <p className="text-[10px] font-bold text-slate-300 italic">
                    Top-Right Quadrant clusters represent <span className="text-white font-black">Strategic Priorities</span> for GIC Boardroom interventions.
                </p>
            </div>
        </div>
    );
}
