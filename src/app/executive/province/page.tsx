"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Database, Download, ShieldCheck, TrendingUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import PageHeader from "@/components/ui/PageHeader";
import GICCard from "@/components/ui/GICCard";
import DashboardToolbar from "@/components/ui/DashboardToolbar";
import ServicePressurePanel from "@/components/analytics/ServicePressurePanel";
import MunicipalityRankingPanel from "@/components/analytics/MunicipalityRankingPanel";
import ProvinceBriefingPanel from "@/components/analytics/ProvinceBriefingPanel";
import ProvinceEvidenceBalancePanel from "@/components/analytics/ProvinceEvidenceBalancePanel";
import ProvinceEvidencePanel from "@/components/analytics/ProvinceEvidencePanel";
import ProvinceRecommendationsPanel from "@/components/analytics/ProvinceRecommendationsPanel";
import ProvinceSentimentPanel from "@/components/analytics/ProvinceSentimentPanel";
import ProvinceSourceHealthPanel from "@/components/analytics/ProvinceSourceHealthPanel";
import SourceReliabilityPanel from "@/components/analytics/SourceReliabilityPanel";
import SourceCoveragePanel from "@/components/analytics/SourceCoveragePanel";
import WaterReliabilityPanel from "@/components/analytics/WaterReliabilityPanel";
import DecisionReadinessStrip from "@/components/analytics/DecisionReadinessStrip";
import SocialTrendsExecutivePanel from "@/components/analytics/SocialTrendsExecutivePanel";
import CitizenVoiceEvidencePanel from "@/components/analytics/CitizenVoiceEvidencePanel";
import ComplaintClustersPanel from "@/components/analytics/ComplaintClustersPanel";
import ProvinceHotspotSummaryPanel from "@/components/analytics/ProvinceHotspotSummaryPanel";
import EvidenceFocusStrip from "@/components/analytics/EvidenceFocusStrip";
import ProvincePublicVoiceHighlightsPanel from "@/components/analytics/ProvincePublicVoiceHighlightsPanel";
import ProvinceLegacyCommunitySignalsPanel from "@/components/analytics/ProvinceLegacyCommunitySignalsPanel";
import ProvinceIssueHeatmapPanel from "@/components/analytics/ProvinceIssueHeatmapPanel";
import ProvinceAlignmentMatrixPanel from "@/components/analytics/ProvinceAlignmentMatrixPanel";
import PlaceProfilePanel from "@/components/analytics/PlaceProfilePanel";
import InfrastructureHistoryPanel from "@/components/analytics/InfrastructureHistoryPanel";
import PlaceContextPanel from "@/components/analytics/PlaceContextPanel";
import PlaceIntelligenceSummaryPanel from "@/components/analytics/PlaceIntelligenceSummaryPanel";
import BudgetAllocationPanel from "@/components/analytics/BudgetAllocationPanel";
import ProvincePlaceCoverageStrip from "@/components/analytics/ProvincePlaceCoverageStrip";
import {
  ProvincePressureTrendResponse,
  ProvinceSummaryResponse,
} from "@/lib/analytics/types";
import { INFRASTRUCTURE_SERVICE_OPTIONS } from "@/lib/analytics/issue-taxonomy";
import { ProvinceRecommendationsResponse } from "@/lib/recommendations/types";

type ProvinceState =
  | { status: "loading" }
  | {
      status: "loaded";
      summary: ProvinceSummaryResponse;
      trend: ProvincePressureTrendResponse;
    }
  | { status: "error"; message: string };

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
];

export default function ProvinceDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryProvince = searchParams.get("province");
  const queryDays = searchParams.get("days");
  const queryServiceDomain = searchParams.get("serviceDomain");
  const returnTo = searchParams.get("from");
  const [province, setProvince] = useState("Gauteng");
  const [days, setDays] = useState(30);
  const [serviceDomain, setServiceDomain] = useState<string>("all");
  const [state, setState] = useState<ProvinceState>({ status: "loading" });
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  function downloadFile(content: string, filename: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function exportRecommendations(format: "csv" | "json") {
    const response = await fetch(
      `/api/intelligence/province-recommendations?province=${encodeURIComponent(province)}&days=${days}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`recommendation export failed with status ${response.status}`);
    }

    const payload = (await response.json()) as ProvinceRecommendationsResponse;
    const baseName = `${province.toLowerCase().replace(/\s+/g, "-")}-province-recommendations`;

    if (format === "json") {
      downloadFile(
        JSON.stringify(payload, null, 2),
        `${baseName}.json`,
        "application/json;charset=utf-8"
      );
      return;
    }

    const header = [
      "title",
      "issue",
      "urgency",
      "impact_tier",
      "owner_office",
      "recommended_action",
      "expected_impact",
      "confidence",
      "evidence_count",
      "official_share",
      "linked_leaders",
      "affected_municipalities",
    ];

    const lines = payload.recommendations.map((recommendation) =>
      [
        recommendation.title,
        recommendation.issue,
        recommendation.urgency,
        recommendation.impactTier,
        recommendation.ownerOffice,
        recommendation.recommendedAction,
        recommendation.expectedImpact,
        recommendation.confidence,
        recommendation.evidenceCount,
        recommendation.officialShare,
        recommendation.linkedLeaders.join(" | "),
        recommendation.affectedMunicipalities.join(" | "),
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    );

    downloadFile(
      [header.join(","), ...lines].join("\n"),
      `${baseName}.csv`,
      "text/csv;charset=utf-8"
    );
  }

  function navigateTraceChip(chip: string) {
    const targets: Record<string, string> = {
      "pressure facts": "province-service-reality",
      "municipality ranking": "province-municipality-exposure",
      "evidence confidence": "province-evidence-quality",
      "evidence balance": "province-evidence-balance",
      "source reliability": "province-evidence-quality",
      "sentiment facts": "province-public-sentiment",
      "public voice": "province-public-voice",
      "water reliability": "province-water-reliability",
      "official evidence share": "province-evidence-balance",
    };

    const targetId = targets[chip];
    if (!targetId) {
      return;
    }

    const element = document.getElementById(targetId);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    if (queryProvince && PROVINCES.includes(queryProvince) && queryProvince !== province) {
      setProvince(queryProvince);
    }

    if (queryDays) {
      const parsedDays = Number(queryDays);
      if ([14, 30, 90].includes(parsedDays) && parsedDays !== days) {
        setDays(parsedDays);
      }
    }
    if (queryServiceDomain && queryServiceDomain !== serviceDomain) {
      setServiceDomain(queryServiceDomain);
    }
  }, [days, province, queryDays, queryProvince, queryServiceDomain, serviceDomain]);

  useEffect(() => {
    async function parseError(response: Response, fallback: string) {
      try {
        const body = (await response.json()) as { error?: string };
        return body.error || fallback;
      } catch {
        return fallback;
      }
    }

    async function load(): Promise<void> {
      setState({ status: "loading" });

      try {
        const [summaryResponse, trendResponse] = await Promise.all([
          fetch(
            `/api/analytics/province-summary?province=${encodeURIComponent(province)}&days=${days}${serviceDomain !== "all" ? `&serviceDomain=${encodeURIComponent(serviceDomain)}` : ""}`,
            { cache: "no-store" }
          ),
          fetch(
            `/api/analytics/province-pressure-trend?province=${encodeURIComponent(province)}&days=${days}${serviceDomain !== "all" ? `&serviceDomain=${encodeURIComponent(serviceDomain)}` : ""}`,
            { cache: "no-store" }
          ),
        ]);

        if (!summaryResponse.ok) {
          throw new Error(
            await parseError(
              summaryResponse,
              `province summary failed with status ${summaryResponse.status}`
            )
          );
        }

        if (!trendResponse.ok) {
          throw new Error(
            await parseError(
              trendResponse,
              `province trend failed with status ${trendResponse.status}`
            )
          );
        }

        const [summary, trend] = (await Promise.all([
          summaryResponse.json(),
          trendResponse.json(),
        ])) as [ProvinceSummaryResponse, ProvincePressureTrendResponse];

        setState({
          status: "loaded",
          summary,
          trend,
        });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load province dashboard",
        });
      }
    }

    void load();
  }, [province, days, serviceDomain]);

  useEffect(() => {
    setSelectedIssue(null);
  }, [province, days, serviceDomain]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("province", province);
    nextParams.set("days", String(days));
    if (serviceDomain !== "all") {
      nextParams.set("serviceDomain", serviceDomain);
    } else {
      nextParams.delete("serviceDomain");
    }

    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }
  }, [days, pathname, province, router, searchParams, serviceDomain]);

  const trendDirection = useMemo(() => {
    if (state.status !== "loaded" || state.trend.series.length < 2) {
      return "Stable";
    }

    const first = state.trend.series[0].pressureCaseCount;
    const last = state.trend.series[state.trend.series.length - 1].pressureCaseCount;

    if (last > first) {
      return "Rising";
    }

    if (last < first) {
      return "Improving";
    }

    return "Stable";
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <img src="/gic-logo.svg" alt="GIC" className="h-16 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            Loading governed province view...
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    const isDatabaseConfigError = state.message.includes("DATABASE_URL");

    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md rounded-[2.5rem] border border-amber-200 bg-white p-10 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <p className="mt-4 text-sm font-black uppercase tracking-widest text-slate-900">
            Province dashboard unavailable
          </p>
          <p className="mt-2 text-sm text-slate-500">{state.message}</p>
          {isDatabaseConfigError ? (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Required setup
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Add `DATABASE_URL` to your local environment, run the v2 migrations, and restart the dev server.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const { summary, trend } = state;
  const totalTrendCases = trend.series.reduce(
    (sum, point) => sum + point.pressureCaseCount,
    0
  );
  const peakPoint = trend.series.reduce<
    ProvincePressureTrendResponse["series"][number] | null
  >((current, point) => {
    if (!current || point.pressureCaseCount > current.pressureCaseCount) {
      return point;
    }

    return current;
  }, null);
  const highestExposureMunicipality = summary.summary.highestExposureMunicipality;
  const activeIssue =
    (serviceDomain !== "all" ? serviceDomain : null) ??
    selectedIssue ??
    summary.summary.topPressureDomain;
  const evidenceOptions = [
    summary.summary.topPressureDomain,
    selectedIssue,
  ].filter((value): value is string => Boolean(value));

  return (
    <div className="max-w-[1600px] mx-auto pb-24">
      <PageHeader
        title="State of the Province"
        subtitle="Provincial executive overview of top citizen concerns, municipality pressure points, and alignment between public need and government focus."
        breadcrumb={[{ name: "Executive" }, { name: "State of the Province" }]}
        headerImage="/projects/MAJWEMASWEU-X5-1604-1024x683.webp"
        guidingQuestion="What is happening across the province right now, what do citizens care about most, where are the biggest pressure points, and is government focus aligned with public need?"
        actions={
          <>
            {returnTo ? (
              <button
                onClick={() => router.push(returnTo)}
                className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                title="Return to comparison"
              >
                <span className="text-[10px] font-black uppercase text-slate-400">
                  Back
                </span>
              </button>
            ) : null}
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
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:outline-none"
            >
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <select
              value={serviceDomain}
              onChange={(event) => setServiceDomain(event.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:outline-none"
            >
              {INFRASTRUCTURE_SERVICE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => window.print()}
              className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
              title="Export briefing"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black uppercase text-slate-400">
                Export
              </span>
            </button>
            <button
              onClick={() => void exportRecommendations("csv")}
              className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
              title="Export province recommendations as CSV"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black uppercase text-slate-400">
                Recs CSV
              </span>
            </button>
            <button
              onClick={() => void exportRecommendations("json")}
              className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
              title="Export province recommendations as JSON"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black uppercase text-slate-400">
                Recs JSON
              </span>
            </button>
            {highestExposureMunicipality ? (
              <button
                onClick={() => {
                  window.location.assign(
                    `/municipality-wards?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(highestExposureMunicipality)}&days=${days}`
                  );
                }}
                className="p-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors shadow-sm flex items-center gap-2"
                title="Open highest exposure municipality"
              >
                <TrendingUp className="w-4 h-4 text-blue-700" />
                <span className="text-[10px] font-black uppercase text-blue-700">
                  Open Hotspot
                </span>
              </button>
            ) : null}
          </>
        }
      />

      <div className="space-y-10">
        <DashboardToolbar
          label="Province Command"
          title={`${province} citizen concerns, municipality pressure, and government alignment view`}
          description={`Pressure is ${trendDirection.toLowerCase()} with ${summary.summary.pressureCaseCount} governed cases in the current window. Highest exposure is ${summary.summary.highestExposureMunicipality || "still resolving"}, led by ${summary.summary.topPressureDomain || "mixed service pressure"}, with ${summary.summary.evidenceConfidenceScore}% evidence confidence and ${summary.summary.officialEvidenceShare}% official share.${serviceDomain !== "all" ? ` The view is filtered to ${serviceDomain}.` : ""} Use this dashboard as the province-wide view of what citizens care about most, where pressure is concentrated, and whether current attention is aligned.`}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Public Concern Volume
            </p>
            <p className="mt-1 text-2xl font-display font-bold text-slate-900">
              {summary.summary.pressureCaseCount}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Top Concern Topic
            </p>
            <p className="mt-1 text-sm font-display font-bold text-slate-900">
              {summary.summary.topPressureDomain || "No data"}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Concern Velocity
            </p>
            <p className="mt-1 text-2xl font-display font-bold text-rose-600">
              {trendDirection}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Hotspot Municipality
            </p>
            <p className="mt-1 text-sm font-display font-bold text-slate-900">
              {summary.summary.highestExposureMunicipality || "No data"}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Province Risk Index
            </p>
            <p className="mt-1 text-2xl font-display font-bold text-slate-900">
              {summary.summary.pressureScore}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Government Focus Signal
            </p>
            <p className="mt-1 text-2xl font-display font-bold text-blue-600">
              {summary.summary.officialEvidenceShare}%
            </p>
          </div>
        </div>

        <DecisionReadinessStrip
          province={province}
          days={days}
          evidenceConfidenceScore={summary.summary.evidenceConfidenceScore}
          officialEvidenceShare={summary.summary.officialEvidenceShare}
        />

        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Active Scope
          </p>
          <p className="mt-2 text-sm font-medium text-slate-700">
            The province dashboard is currently focused on{" "}
            <span className="font-bold">{province}</span> over the last{" "}
            <span className="font-bold">{days} days</span>
            {serviceDomain !== "all" ? (
              <>
                , narrowed to <span className="font-bold">{serviceDomain}</span>.
              </>
            ) : (
              "."
            )}{" "}
            Rankings and heatmaps stay province-wide, while evidence layers may narrow further when
            a topic is selected below.
          </p>
        </div>

        <GICCard
          premium
          title="Province Situation Summary"
          subtitle="Executive readout of concern pressure, public reaction, and emerging province risk"
          icon={<Database className="w-5 h-5 text-gic-blue" />}
        >
          <ProvinceBriefingPanel province={province} days={days} />
        </GICCard>

        <GICCard
          premium
          title="Province Place Intelligence Summary"
          subtitle="Combined place identity, political context, and historical infrastructure readout for the active province"
          icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
        >
          <PlaceIntelligenceSummaryPanel province={province} />
        </GICCard>

        <ProvincePlaceCoverageStrip province={province} />

        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-slate-700">
            Read this province context block first. It explains who this province is, what historical infrastructure pressures recur here, and what planning or allocation signals exist before you move into live concern, ranking, and alignment analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <GICCard
            title="Province Place Profile"
            subtitle="Population, service access, and socioeconomic baseline for the province"
            icon={<Database className="w-5 h-5 text-gic-blue" />}
          >
            <PlaceProfilePanel province={province} />
          </GICCard>

          <GICCard
            title="Province Context"
            subtitle="Narrative and reference context for the province"
            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
          >
            <PlaceContextPanel province={province} />
          </GICCard>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <GICCard
            title="Province Infrastructure History"
            subtitle="Historical infrastructure and issue context for the province"
            icon={<TrendingUp className="w-5 h-5 text-gic-blue" />}
          >
            <InfrastructureHistoryPanel province={province} />
          </GICCard>

          <GICCard
            title="Province Budget and Allocation Signals"
            subtitle="Structured allocation records and project signals tied to the active province"
            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
          >
            <BudgetAllocationPanel province={province} />
          </GICCard>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-8">
            <div id="province-service-reality">
            <GICCard
              premium
              title="Province Concern Trend"
              subtitle="How province-wide issue pressure is changing across the current window"
              icon={<TrendingUp className="w-5 h-5" />}
            >
              <ServicePressurePanel province={province} days={days} serviceDomain={serviceDomain !== "all" ? serviceDomain : null} />
            </GICCard>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-8">
            <div id="province-municipality-exposure">
            <GICCard
              title="Municipality Exposure"
              subtitle="Which municipalities are carrying the highest current issue pressure"
              icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
            >
              <MunicipalityRankingPanel province={province} />
            </GICCard>
            </div>

            <div id="province-evidence-balance">
            <GICCard
              title="Government Focus Signal"
              subtitle="How official attention compares with live public and narrative pressure"
              icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
            >
              <ProvinceEvidenceBalancePanel province={province} days={days} />
            </GICCard>
            </div>
          </div>
        </div>

        <GICCard
          title="Issue Intensity Heatmap"
          subtitle="Where concern intensity is concentrated across municipalities and service categories"
          icon={<TrendingUp className="w-5 h-5 text-gic-blue" />}
        >
          <ProvinceIssueHeatmapPanel province={province} days={days} serviceDomain={serviceDomain !== "all" ? serviceDomain : null} />
        </GICCard>

        <GICCard
          title="Strategic Alignment Matrix"
          subtitle="How public concern by issue compares with official attention by issue"
          icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
        >
          <ProvinceAlignmentMatrixPanel province={province} days={days} serviceDomain={serviceDomain !== "all" ? serviceDomain : null} />
        </GICCard>

        <div id="province-water-reliability">
        <GICCard
          title="Water Reliability Signal"
          subtitle="Official water evidence used where water pressure is a major province concern"
          icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
        >
          <WaterReliabilityPanel province={province} days={days} />
        </GICCard>
        </div>

        <div id="province-public-sentiment">
        <GICCard
          title="Province Public Mood"
          subtitle="How communities across the province are reacting to the current issue mix"
          icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
        >
          <ProvinceSentimentPanel province={province} days={days} />
        </GICCard>
        </div>

        <div id="province-public-voice">
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.05fr_1fr]">
            <GICCard
              title="Public Voice"
              subtitle="Governed citizen complaint pressure, hotspotting, and narrative risk for the selected province"
              icon={<AlertTriangle className="w-5 h-5 text-gic-blue" />}
            >
              <SocialTrendsExecutivePanel province={province} days={days} />
            </GICCard>

            <GICCard
              title="Complaint Clusters"
              subtitle="Ranked public complaint families by spread, negativity, and intensity"
              icon={<TrendingUp className="w-5 h-5 text-gic-blue" />}
            >
              <ComplaintClustersPanel
                province={province}
                days={days}
                selectedIssueFamily={selectedIssue}
                onSelectIssueFamily={setSelectedIssue}
              />
            </GICCard>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <GICCard
              title="Imported Community Pulse"
              subtitle="Legacy Firebase resident and civic complaints normalized into the governed province signal layer"
              icon={<Database className="w-5 h-5 text-gic-blue" />}
            >
              <ProvinceLegacyCommunitySignalsPanel
                province={province}
                days={days}
                selectedIssue={selectedIssue}
                onSelectIssue={setSelectedIssue}
              />
            </GICCard>

            <GICCard
              title="Direct Public Evidence"
              subtitle="Top governed citizen-facing documents behind the current province issue focus"
              icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
            >
              <ProvincePublicVoiceHighlightsPanel
                province={province}
                issueFamily={activeIssue}
                days={days}
              />
            </GICCard>
          </div>
        </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GICCard
            title="Priority Actions"
            subtitle="Province actions that best match current concern pressure and public need"
            icon={<AlertTriangle className="w-5 h-5 text-gic-gold" />}
          >
            <ProvinceRecommendationsPanel
              province={province}
              days={days}
              selectedIssue={activeIssue}
              onSelectIssue={setSelectedIssue}
              onSelectTraceChip={navigateTraceChip}
            />
          </GICCard>

          <GICCard
            title="Hotspot Command"
            subtitle="Where issue pressure is converging and where province attention should go first"
            icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          >
            <ProvinceHotspotSummaryPanel
              province={province}
              days={days}
              highestExposureMunicipality={summary.summary.highestExposureMunicipality}
              topPressureDomain={summary.summary.topPressureDomain}
              trendDirection={trendDirection}
              selectedIssueFamily={selectedIssue}
              onSelectIssueFamily={setSelectedIssue}
            />
          </GICCard>

          <GICCard
            title="Trend Readout"
            subtitle="Peak period, total concern volume, and direction of change"
            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Trend Direction
                </p>
                <p className="mt-3 text-3xl font-display font-bold text-slate-900">
                  {trendDirection}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Peak Day
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {peakPoint?.date ?? "No data"}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {peakPoint?.pressureCaseCount ?? 0} cases
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Window Total
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{totalTrendCases}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    governed cases
                  </p>
                </div>
              </div>
            </div>
          </GICCard>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <GICCard
            title="Province Evidence"
            subtitle="Supporting governed documents and sentiment mentions for the selected province issue"
            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
          >
            <div className="space-y-5">
              <EvidenceFocusStrip
                label="Province evidence focus"
                activeIssue={activeIssue}
                options={evidenceOptions}
                onSelectIssue={setSelectedIssue}
              />
              <ProvinceEvidencePanel province={province} topic={activeIssue} />
            </div>
          </GICCard>

          <GICCard
            title="Public Voice Evidence"
            subtitle="Citizen-facing documents behind the current complaint family and province public-pressure layer"
            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
          >
            <div className="space-y-5">
              <EvidenceFocusStrip
                label="Public voice focus"
                activeIssue={activeIssue}
                options={evidenceOptions}
                onSelectIssue={setSelectedIssue}
              />
              <CitizenVoiceEvidencePanel province={province} issueFamily={activeIssue} days={days} />
            </div>
          </GICCard>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div id="province-evidence-quality">
          <GICCard
            title="Evidence Quality"
            subtitle="Supporting confidence behind the province story"
            icon={<Database className="w-5 h-5 text-gic-blue" />}
          >
            <SourceReliabilityPanel province={province} />
          </GICCard>
          </div>

          <GICCard
            title="Source Coverage"
            subtitle="Verified official source depth behind this province"
            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
          >
            <SourceCoveragePanel province={province} />
          </GICCard>

          <GICCard
            title="Source Health"
            subtitle="Connector freshness and run condition behind this province view"
            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
          >
            <ProvinceSourceHealthPanel province={province} />
          </GICCard>
        </div>
      </div>
    </div>
  );
}
