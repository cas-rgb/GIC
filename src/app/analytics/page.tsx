import PageHeader from "@/components/ui/PageHeader";
import KPIRibbon from "@/components/ui/KPIRibbon";
import GICCard from "@/components/ui/GICCard";
import ServicePressurePanel from "@/components/analytics/ServicePressurePanel";
import SourceReliabilityPanel from "@/components/analytics/SourceReliabilityPanel";
import MunicipalityRankingPanel from "@/components/analytics/MunicipalityRankingPanel";
import { PieChart, BarChart3, MapPin } from "lucide-react";

export default function VisualAnalytics() {
    return (
        <div className="max-w-[1600px] mx-auto">
            <PageHeader 
                title="Governed Analytics" 
                subtitle="Operational BI for pressure, municipality exposure, and evidence quality"
                breadcrumb={[{ name: "Governed Analytics" }]}
            />

            <KPIRibbon kpis={[
                { label: 'Primary Path', value: 'V2', color: 'gold' },
                { label: 'Core Question', value: 'Where is pressure rising?', color: 'blue' },
                { label: 'Ranking Logic', value: 'Incident-Based', color: 'slate' },
                { label: 'Evidence Base', value: 'Governed', color: 'slate' },
            ]} />

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8">
                    <GICCard premium title="Pressure Trend and Domain Exposure" subtitle="Which services are creating the most operational pressure?" icon={<BarChart3 className="w-5 h-5" />}>
                        <ServicePressurePanel province="Gauteng" days={30} />
                    </GICCard>
                </div>
                
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                    <GICCard title="Municipality Exposure" subtitle="Which municipalities need intervention first?" icon={<MapPin className="w-5 h-5 text-rose-500" />}>
                        <MunicipalityRankingPanel province="Gauteng" />
                    </GICCard>

                    <GICCard title="Evidence Quality" subtitle="How strong is the underlying evidence mix?" icon={<PieChart className="w-5 h-5 text-gic-blue" />}>
                        <SourceReliabilityPanel province="Gauteng" />
                    </GICCard>
                </div>
            </div>
        </div>
    );
}
