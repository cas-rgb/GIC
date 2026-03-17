import PageHeader from "@/components/ui/PageHeader";
import KPIRibbon from "@/components/ui/KPIRibbon";
import GICCard from "@/components/ui/GICCard";
import { Briefcase, Activity, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ServiceIntelligence() {
    return (
        <div className="max-w-[1600px] mx-auto">
            <PageHeader 
                title="Service Intelligence" 
                subtitle="Sectoral Performance & Promise Audit"
                breadcrumb={[{ name: "Service Intelligence" }]}
            />

            <KPIRibbon kpis={[
                { label: 'Service Score', value: '4.8/5', color: 'blue' },
                { label: 'Uptime', value: '99.99%', color: 'slate' },
                { label: 'Resolution Time', value: '1.2d', color: 'gold' },
                { label: 'Client Satisfaction', value: 'High', color: 'blue' },
            ]} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {['Civil', 'Roads', 'Health', 'Planning'].map((sector) => (
                    <GICCard key={sector} title={sector} subtitle="Sector Intelligence" icon={<ShieldCheck className="w-5 h-5" />}>
                        <div className="space-y-8">
                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
                                <Activity className="w-8 h-8 text-gic-blue mx-auto mb-4" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance Matrix</span>
                                <h5 className="text-2xl font-display font-bold text-slate-900 mt-2 tracking-tight">NOMINAL</h5>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Projects</span>
                                <span className="text-slate-900">42</span>
                            </div>
                            <div className="h-1 w-full bg-slate-100 rounded-full" />
                        </div>
                    </GICCard>
                ))}
            </div>
        </div>
    );
}
