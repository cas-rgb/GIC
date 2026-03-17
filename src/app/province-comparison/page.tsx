import { BarChart3 } from "lucide-react";

import ProvinceComparisonPanel from "@/components/analytics/ProvinceComparisonPanel";
import PageHeader from "@/components/ui/PageHeader";
import GICCard from "@/components/ui/GICCard";
import DashboardToolbar from "@/components/ui/DashboardToolbar";

export default function ProvinceComparisonPage() {
  return (
    <div className="max-w-[1600px] mx-auto pb-24">
      <PageHeader
        title="Province Comparison"
        subtitle="Cross-province comparison of governed pressure, sentiment, evidence quality, and source health"
        breadcrumb={[{ name: "Province Comparison" }]}
        guidingQuestion="Which provinces are under the greatest pressure, and how trustworthy is the evidence behind that view?"
      />

      <div className="space-y-5">
        <DashboardToolbar
          title="Rank provinces by pressure, evidence quality, official share, and sentiment risk"
          description="Use comparison mode to isolate where pressure is highest, where evidence is weakest, and which provinces need immediate executive attention."
        />

        <GICCard
          premium
          title="All 9 Provinces"
          subtitle="Governed comparison view across pressure, escalation, sentiment, official share, and source health"
          icon={<BarChart3 className="w-5 h-5 text-gic-blue" />}
        >
          <ProvinceComparisonPanel />
        </GICCard>
      </div>
    </div>
  );
}
