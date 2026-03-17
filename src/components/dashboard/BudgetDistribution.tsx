"use client";

import React from 'react';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip,
    Legend
} from 'recharts';
import { Building2, MapPin } from 'lucide-react';
import { SA_REGIONAL_REGISTRY } from '@/data/regional-registry';

interface BudgetDistributionProps {
    data: any[];
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#f43f5e', '#0ea5e9'];

export default function BudgetDistribution({ data }: BudgetDistributionProps) {
    const [activeMunicipality, setActiveMunicipality] = React.useState('all');
    const [activeWard, setActiveWard] = React.useState('all');

    // Get Gauteng Registry Data
    const gautengData = SA_REGIONAL_REGISTRY.provinces.find(p => p.name === 'Gauteng');
    const municipalities = gautengData?.municipalities || [];
    const currentMuni = municipalities.find(m => m.name === activeMunicipality);
    const wards = currentMuni?.wards || [];

    const filtered = data.filter(item => 
        (activeMunicipality === 'all' || item.municipality === activeMunicipality) &&
        (activeWard === 'all' || item.ward === activeWard)
    );

    const sectors = filtered.reduce<Record<string, number>>((acc, item) => {
        const sector = item.sector || item.category || 'Other';
        acc[sector] = (acc[sector] || 0) + Number(item.budgetAllocation || item.budget || 0);
        return acc;
    }, {});

    const chartData = Object.entries(sectors)
        .map(([name, value]) => ({
            name,
            value,
        }))
        .sort((a, b) => b.value - a.value);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="w-full h-80 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Budget Allocation</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Strategic Capex Distribution</p>
                </div>
                <div className="flex items-center gap-3">
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
                </div>
            </div>
            
            <div className="flex-1 w-full flex items-center justify-center">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: any) => formatCurrency(Number(value || 0))}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                align="center"
                                wrapperStyle={{ fontSize: '8px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/5">
                            <div className="w-6 h-6 rounded-full border-2 border-dashed border-white/20" />
                        </div>
                        <h4 className="text-white text-xs font-bold mb-1">No Budget Signals</h4>
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Zero allocation detected for query</p>
                    </div>
                )}
            </div>
        </div>
    );
}
