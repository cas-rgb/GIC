import { Database, ShieldCheck } from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import GICCard from "@/components/ui/GICCard";
import DataCoveragePanel from "@/components/analytics/DataCoveragePanel";

export default function DataCoveragePage() {
  return (
    <div className="max-w-[1600px] mx-auto">
      <PageHeader
        title="Data Coverage"
        subtitle="Verified source depth across official, media, civic, research, and social layers"
        breadcrumb={[{ name: "Data Coverage" }]}
      />

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12">
          <GICCard
            premium
            title="Governed Coverage Map"
            subtitle="How much verified data backs each province and source class"
            icon={<Database className="w-5 h-5" />}
          >
            <DataCoveragePanel />
          </GICCard>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <GICCard
            title="Interpretation"
            subtitle="How leadership should read source coverage"
            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
          >
            <div className="space-y-3">
              {[
                "High official and KPI-truth coverage increases confidence in executive dashboard decisions.",
                "Media and civic coverage strengthen situational awareness and contradiction detection.",
                "Social coverage should be treated as early warning and sentiment context, not KPI truth.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="w-2 h-2 rounded-full bg-gic-blue" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </GICCard>
        </div>
      </div>
    </div>
  );
}
