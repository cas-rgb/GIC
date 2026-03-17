"use client";

import React from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { TrendingUp, MapPin, Building2 } from 'lucide-react';
import { SA_REGIONAL_REGISTRY } from '@/data/regional-registry';

interface SignalTrajectoryProps {
    data: any[];
}

const DOMAINS = [
    { label: 'All Domains', value: 'all' },
    { label: 'Political', value: 'Political' },
    { label: 'Social', value: 'Social' },
    { label: 'Infrastructure', value: 'Infrastructure' }
];

export default function SignalTrajectory({ data }: SignalTrajectoryProps) {
    const [activeDomain, setActiveDomain] = React.useState('all');
    const [activeMunicipality, setActiveMunicipality] = React.useState('all');
    const [activeWard, setActiveWard] = React.useState('all');

    // Get Gauteng Registry Data
    const gautengData = SA_REGIONAL_REGISTRY.provinces.find(p => p.name === 'Gauteng');
    const municipalities = gautengData?.municipalities || [];
    const currentMuni = municipalities.find(m => m.name === activeMunicipality);
    const wards = currentMuni?.wards || [];

    // Process raw signal data into time-series points
    const filtered = data.filter(sig => 
        (activeDomain === 'all' || sig.domain?.toLowerCase() === activeDomain.toLowerCase()) &&
        (activeMunicipality === 'all' || sig.municipality === activeMunicipality) &&
        (activeWard === 'all' || sig.ward === activeWard)
    );

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const grouped = filtered.reduce<Record<string, number>>((acc, sig) => {
        const createdAt = sig.createdAt ? new Date(sig.createdAt) : null;
        const day = createdAt && !Number.isNaN(createdAt.getTime())
            ? days[createdAt.getDay()]
            : 'Sun';
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {});

    const chartData = days.map(day => ({
        name: day,
        risks: grouped[day] || 0
    }));

    return (
        <div className="w-full h-80 bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-hidden">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Signal Trajectory</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">7-Day Institutional Risk Momentum</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Municipality Cascader */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <select 
                            value={activeMunicipality}
                            onChange={(e) => {
                                setActiveMunicipality(e.target.value);
                                setActiveWard('all');
                            }}
                            className="bg-transparent border-none text-white text-[9px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer outline-none"
                        >
                            <option value="all" className="bg-slate-900">All Municipalities</option>
                            {municipalities.map(m => (
                                <option key={m.name} value={m.name} className="bg-slate-900">{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Ward Cascader */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <select 
                            value={activeWard}
                            onChange={(e) => setActiveWard(e.target.value)}
                            disabled={activeMunicipality === 'all'}
                            className="bg-transparent border-none text-white text-[9px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <option value="all" className="bg-slate-900">All Wards</option>
                            {wards.map(w => (
                                <option key={w} value={w} className="bg-slate-900">{w}</option>
                            ))}
                        </select>
                    </div>

                    <select 
                        value={activeDomain}
                        onChange={(e) => setActiveDomain(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white text-[9px] font-black rounded-lg px-3 py-1.5 uppercase tracking-widest outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                        {DOMAINS.map(d => (
                            <option key={d.value} value={d.value} className="bg-slate-900">{d.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="w-full h-56 flex items-center justify-center">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRisks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                itemStyle={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}
                                labelStyle={{ color: '#fff', fontSize: '10px', marginBottom: '4px' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="risks" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorRisks)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/5">
                            <TrendingUp className="w-6 h-6 text-white/20" />
                        </div>
                        <h4 className="text-white text-xs font-bold mb-1">Inertia Detected</h4>
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Zero signal movement in selected window</p>
                    </div>
                )}
            </div>
        </div>
    );
}
