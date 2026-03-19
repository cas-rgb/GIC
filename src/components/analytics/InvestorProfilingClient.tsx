"use client";

import { useEffect, useState } from "react";
import { Briefcase, Landmark, TrendingUp } from "lucide-react";
import { useSearchParams } from "next/navigation";

import InfrastructureProjectsPanel from "@/components/analytics/InfrastructureProjectsPanel";
import InvestorOpportunityDetailPanel from "@/components/analytics/InvestorOpportunityDetailPanel";
import InvestorOpportunitiesPanel from "@/components/analytics/InvestorOpportunitiesPanel";
import OmniFilterToolbar from "@/components/ui/OmniFilterToolbar";
import GICCard from "@/components/ui/GICCard";

export default function InvestorProfilingClient() {
  const searchParams = useSearchParams();
  const activeProvince = searchParams.get("province") ?? "Gauteng";
  
  // Extract explicit 5D context
  const activeMunicipality = searchParams.get("municipality") || null;
  const activeServiceDomain = searchParams.get("serviceDomain") || null;
  const activeDays = searchParams.get("days") || "90";

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Reset selected project if high-level geography changes to prevent holding phantom state
  useEffect(() => {
    setSelectedProjectId(null);
  }, [activeProvince, activeMunicipality, activeServiceDomain]);

  return (
    <div className="space-y-6">
      {/* Removed embedded 5-Dimensional Global State Hook as it is already inherited from parent layout */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 shadow-gic-premium">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          Strategic Asset Scope
        </p>
        <p className="mt-2 text-sm font-medium text-slate-300">
          The Deal Room is currently analyzing the active 5-dimensional filter vector. 
          <span className="font-bold text-white block mt-1">
            [{activeProvince}] 
            {activeMunicipality ? ` / [${activeMunicipality}]` : ""}
            {activeServiceDomain ? ` / [${activeServiceDomain}]` : ""}
            {` / [${activeDays} Days]`}
          </span>
        </p>
      </div>

      <div className="space-y-6">
        <GICCard
          premium
          title="Dynamic Pipeline Matches"
          subtitle="AI-isolated infrastructure projects most ready for capital syndication within your constraints"
          icon={<TrendingUp className="w-5 h-5 text-sky-400" />}
        >
          <InvestorOpportunitiesPanel
            province={activeProvince}
            municipality={activeMunicipality}
            serviceDomain={activeServiceDomain}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
        </GICCard>

        <GICCard
          premium
          title="Treasury Execution Footprint"
          subtitle="Realized sector exposure drawn from the verified municipal capital baseline"
          icon={<Briefcase className="w-5 h-5 text-blue-400" />}
        >
          <InfrastructureProjectsPanel 
            province={activeProvince} 
            municipality={activeMunicipality}
            serviceDomain={activeServiceDomain}
          />
        </GICCard>
      </div>

      <GICCard
        premium
        title="Asset Diligence Detail"
        subtitle="Live verified allocations, project milestones, and Treasury data confidence scoring"
        icon={<Landmark className="w-5 h-5 text-gic-gold" />}
      >
        <InvestorOpportunityDetailPanel projectId={selectedProjectId} />
      </GICCard>
    </div>
  );
}
