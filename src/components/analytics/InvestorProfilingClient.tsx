"use client";

import { useEffect, useMemo, useState } from "react";
import { Briefcase, Landmark, TrendingUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import InfrastructureProjectsPanel from "@/components/analytics/InfrastructureProjectsPanel";
import InvestorExecutiveSummaryPanel from "@/components/analytics/InvestorExecutiveSummaryPanel";
import InvestorOpportunityDetailPanel from "@/components/analytics/InvestorOpportunityDetailPanel";
import InvestorOpportunitiesPanel from "@/components/analytics/InvestorOpportunitiesPanel";
import StructuredBriefingPanel from "@/components/analytics/StructuredBriefingPanel";
import GICCard from "@/components/ui/GICCard";
import DashboardToolbar from "@/components/ui/DashboardToolbar";
import { MunicipalityDirectoryResponse } from "@/lib/analytics/types";

const PROVINCES = [
  "All Provinces",
  "Western Cape",
  "Eastern Cape",
  "Northern Cape",
  "Mpumalanga",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "North West",
  "Free State",
];

type DirectoryState =
  | { status: "idle" | "loading" }
  | { status: "loaded"; data: MunicipalityDirectoryResponse }
  | { status: "error" };

export default function InvestorProfilingClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryProvince = searchParams.get("province");
  const queryMunicipality = searchParams.get("municipality");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [province, setProvince] = useState<string>("All Provinces");
  const [municipality, setMunicipality] = useState<string>("all");
  const [directoryState, setDirectoryState] = useState<DirectoryState>({ status: "idle" });

  const activeProvince = province === "All Provinces" ? null : province;
  const activeMunicipality =
    activeProvince && municipality !== "all" ? municipality : null;

  useEffect(() => {
    if (queryProvince && PROVINCES.includes(queryProvince) && queryProvince !== province) {
      setProvince(queryProvince);
    }
    if (!queryProvince && province !== "All Provinces") {
      setProvince("All Provinces");
    }
  }, [province, queryProvince]);

  useEffect(() => {
    if (!activeProvince && municipality !== "all") {
      setMunicipality("all");
    }
  }, [activeProvince, municipality]);

  useEffect(() => {
    async function loadDirectory() {
      if (!activeProvince) {
        setDirectoryState({ status: "idle" });
        setMunicipality("all");
        return;
      }

      setDirectoryState({ status: "loading" });
      try {
        const response = await fetch(
          `/api/analytics/municipality-directory?province=${encodeURIComponent(activeProvince)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Failed to load municipality directory");
        }

        const data = (await response.json()) as MunicipalityDirectoryResponse;
        setDirectoryState({ status: "loaded", data });
        const matched = queryMunicipality
          ? data.rows.find((row) => row.municipality === queryMunicipality)?.municipality
          : null;
        setMunicipality(matched ?? "all");
      } catch {
        setDirectoryState({ status: "error" });
        setMunicipality("all");
      }
    }

    void loadDirectory();
  }, [activeProvince, queryMunicipality]);

  useEffect(() => {
    setSelectedProjectId(null);
  }, [activeProvince, activeMunicipality]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (activeProvince) {
      nextParams.set("province", activeProvince);
    } else {
      nextParams.delete("province");
    }
    if (activeMunicipality) {
      nextParams.set("municipality", activeMunicipality);
    } else {
      nextParams.delete("municipality");
    }
    const nextQuery = nextParams.toString();
    if (nextQuery !== searchParams.toString()) {
      router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ""}`, { scroll: false });
    }
  }, [activeMunicipality, activeProvince, pathname, router, searchParams]);

  const municipalityOptions = useMemo(() => {
    if (directoryState.status !== "loaded") {
      return [];
    }

    return directoryState.data.rows;
  }, [directoryState]);

  return (
    <div className="space-y-5">
      <DashboardToolbar
        label="Directional Lens"
        title="Economic opportunity, sector relevance, and investor fit"
        description={`Use this dashboard to see what ${activeMunicipality ?? activeProvince ?? "the current geography"} needs most, which sectors are relevant to those needs, and where investor-fit signals are strongest. This is directional opportunity intelligence for government engagement, not a confirmed investor commitment tracker.`}
        controls={
          <>
            <select
              value={province}
              onChange={(event) => setProvince(event.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:outline-none"
            >
              {PROVINCES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
            <select
              value={municipality}
              onChange={(event) => setMunicipality(event.target.value)}
              disabled={!activeProvince || municipalityOptions.length === 0}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:outline-none min-w-[240px] disabled:opacity-50"
            >
              <option value="all">All Municipalities</option>
              {municipalityOptions.map((entry) => (
                <option key={entry.municipality} value={entry.municipality}>
                  {entry.municipality}
                </option>
              ))}
            </select>
          </>
        }
      />

      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Active Scope
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          The investor view is currently focused on{" "}
          <span className="font-bold">{activeMunicipality ?? activeProvince ?? "all provinces"}</span>.
          All rankings remain directional and confidence-tiered, so they should be used for opportunity
          positioning and investor engagement planning, not as proof of confirmed investment intent.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          What This Answers
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          This dashboard answers where infrastructure-led opportunity is strongest, which sectors best
          match local need, and which opportunities are ready enough to support investor engagement planning.
        </p>
      </div>

      {directoryState.status === "error" ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            Municipality filtering is temporarily unavailable for this province, so the investor view is staying at province level until the local directory can be reloaded.
          </p>
        </div>
      ) : null}

      {activeProvince && directoryState.status === "loaded" && municipalityOptions.length === 0 ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            No municipality-level investor rows are currently mapped for {activeProvince}. The dashboard remains usable at province level using the screened Treasury opportunity footprint.
          </p>
        </div>
      ) : null}

      <GICCard
        premium
        title="Opportunity Briefing"
        subtitle="Grounded AI summary of the strongest opportunity themes, top directional fits, and key caution points"
        icon={<TrendingUp className="w-5 h-5 text-gic-blue" />}
      >
        <StructuredBriefingPanel
          url={`/api/intelligence/investor-briefing?days=30${activeProvince ? `&province=${encodeURIComponent(activeProvince)}` : ""}${activeMunicipality ? `&municipality=${encodeURIComponent(activeMunicipality)}` : ""}`}
          loadingLabel="Building investor opportunity briefing..."
          headlineLabel="Opportunity Headline"
        />
      </GICCard>

      <GICCard
        premium
        title="Investment Opportunity Summary"
        subtitle="Where capital should go first, which opportunity themes are strongest, and where readiness is still weak"
        icon={<TrendingUp className="w-5 h-5 text-gic-blue" />}
      >
        <InvestorExecutiveSummaryPanel province={activeProvince} />
      </GICCard>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.08fr_1fr]">
        <GICCard
          premium
          title="Opportunity Pipeline"
          subtitle="Sector and geography opportunity exposure across the normalized Treasury project universe"
          icon={<Briefcase className="w-5 h-5 text-gic-blue" />}
        >
          <InfrastructureProjectsPanel province={activeProvince ?? undefined} />
        </GICCard>

        <GICCard
          premium
          title="Investor Fit Ranking"
          subtitle="Named opportunities most ready for capital attention based on sector, geography, stage, and data confidence"
          icon={<TrendingUp className="w-5 h-5 text-gic-blue" />}
        >
          <InvestorOpportunitiesPanel
            province={activeProvince ?? undefined}
            municipality={activeMunicipality}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
          />
        </GICCard>
      </div>

      <GICCard
        premium
        title="Investment Opportunity Detail"
        subtitle="Funding rows, project updates, and source-backed detail for the selected opportunity"
        icon={<Landmark className="w-5 h-5 text-gic-blue" />}
      >
        <InvestorOpportunityDetailPanel projectId={selectedProjectId} />
      </GICCard>
    </div>
  );
}
