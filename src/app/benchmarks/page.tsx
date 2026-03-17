import PageHeader from "@/components/ui/PageHeader";
import KPIRibbon from "@/components/ui/KPIRibbon";
import GICCard from "@/components/ui/GICCard";
import { BarChart3, Target, Award, ShieldCheck } from "lucide-react";

export default function Benchmarks() {
    return (
        <div className="max-w-[1600px] mx-auto">
            <PageHeader 
                title="Benchmarks" 
                subtitle="Comparative Institutional Performance"
                breadcrumb={[{ name: "Benchmarks" }]}
            />

            <KPIRibbon kpis={[
                { label: 'Global Percentile', value: 'Top 5%', color: 'gold' },
                { label: 'Market Variance', value: '+14%', color: 'blue' },
                { label: 'Cost Efficiency', value: '0.92', color: 'slate' },
                { label: 'Innovation Index', value: '94/100', color: 'blue' },
            ]} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GICCard premium title="GIC vs Regional Peers" subtitle="Efficiency Score Audit" icon={<Target className="w-5 h-5" />}>
                    <div className="space-y-8 p-6">
                        {[
                            { name: 'GIC Platform', value: 94, isMain: true },
                            { name: 'Regional Average', value: 72 },
                            { name: 'Private Sector Benchmark', value: 88 },
                        ].map((peer, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${peer.isMain ? 'text-slate-900' : 'text-slate-400'}`}>
                                        {peer.name}
                                    </span>
                                    <span className="text-xs font-bold text-slate-900">{peer.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${peer.isMain ? 'bg-gic-dark shadow-gic-glow' : 'bg-slate-300'}`} style={{ width: `${peer.value}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </GICCard>

                <GICCard title="Compliance Excellence" subtitle="Governance Scorecard" icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}>
                   <div className="grid grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-center">
                                <Award className="w-6 h-6 text-gic-gold mx-auto mb-3" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol {i}</span>
                                <p className="text-sm font-bold text-slate-900 mt-1">PASSED</p>
                            </div>
                        ))}
                   </div>
                </GICCard>
            </div>
        </div>
    );
}
