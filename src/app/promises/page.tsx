import PageHeader from "@/components/ui/PageHeader";
import KPIRibbon from "@/components/ui/KPIRibbon";
import GICCard from "@/components/ui/GICCard";
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function ProvincialPromises() {
    return (
        <div className="max-w-[1600px] mx-auto">
            <PageHeader 
                title="Provincial Promises" 
                subtitle="Accountability & Service Delivery Tracker"
                breadcrumb={[{ name: "Provincial Promises" }]}
            />

            <KPIRibbon kpis={[
                { label: 'Total Promises', value: '42', color: 'slate' },
                { label: 'Fulfilled', value: '18', color: 'blue' },
                { label: 'In Progress', value: '22', color: 'gold' },
                { label: 'At Risk', value: '2', color: 'slate' },
            ]} />

            <div className="space-y-8">
                <GICCard title="The Delivery Ledger" subtitle="Public Promises Record" icon={<FileText className="w-5 h-5" />}>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'Highway Extension Q4', status: 'Fulfilled', text: 'Commitment to extend the K101 highway by 15km to improve regional transit.' },
                            { title: 'Clean Water Initiative', status: 'In Progress', text: 'Deployment of 12 tactical water hubs across underserved regional sectors.' },
                            { title: 'Digital Health Node', status: 'In Progress', text: 'Implementation of high-speed connectivity for Maseru medical facilities.' },
                        ].map((promise, i) => (
                            <div key={i} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] relative overflow-hidden group hover:border-gic-blue transition-all">
                                <div className="flex items-center gap-3 mb-6">
                                    {promise.status === 'Fulfilled' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-gic-gold" />}
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${promise.status === 'Fulfilled' ? 'text-emerald-500' : 'text-gic-gold'}`}>
                                        {promise.status}
                                    </span>
                                </div>
                                <h5 className="text-sm font-bold text-slate-900 mb-4">{promise.title}</h5>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{promise.text}"</p>
                            </div>
                        ))}
                   </div>
                </GICCard>
            </div>
        </div>
    );
}
