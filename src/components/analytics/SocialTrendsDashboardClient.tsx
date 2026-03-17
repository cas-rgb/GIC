"use client";

import { useEffect, useState } from "react";
import { Activity, MessageSquare, MessageSquareQuote, TrendingUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import CitizenVoiceTrendsPanel from "@/components/analytics/CitizenVoiceTrendsPanel";
import CitizenVoiceEvidencePanel from "@/components/analytics/CitizenVoiceEvidencePanel";
import ComplaintClustersPanel from "@/components/analytics/ComplaintClustersPanel";
import ProvinceSentimentPanel from "@/components/analytics/ProvinceSentimentPanel";
import ProvinceLegacyCommunitySignalsPanel from "@/components/analytics/ProvinceLegacyCommunitySignalsPanel";
import SocialTrendsExecutivePanel from "@/components/analytics/SocialTrendsExecutivePanel";
import SocialSourceMixPanel from "@/components/analytics/SocialSourceMixPanel";
import StructuredBriefingPanel from "@/components/analytics/StructuredBriefingPanel";
import GICCard from "@/components/ui/GICCard";
import DashboardToolbar from "@/components/ui/DashboardToolbar";

const PROVINCES = [
  "All Provinces",
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

const DAY_WINDOWS = [14, 30, 60] as const;
const SOURCE_TYPES = ["all", "news", "social", "gov", "civic"] as const;

export default function SocialTrendsDashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryProvince = searchParams.get("province");
  const queryDays = searchParams.get("days");
  const querySourceType = searchParams.get("sourceType");
  const [province, setProvince] = useState<(typeof PROVINCES)[number]>("All Provinces");
  const [days, setDays] = useState<(typeof DAY_WINDOWS)[number]>(30);
  const [sourceType, setSourceType] = useState<(typeof SOURCE_TYPES)[number]>("all");
  const [selectedIssueFamily, setSelectedIssueFamily] = useState<string | null>(null);

  const selectedProvince = province === "All Provinces" ? undefined : province;

  useEffect(() => {
    if (queryProvince && PROVINCES.includes(queryProvince as (typeof PROVINCES)[number]) && queryProvince !== province) {
      setProvince(queryProvince as (typeof PROVINCES)[number]);
    }
    if (!queryProvince && province !== "All Provinces") {
      setProvince("All Provinces");
    }

    if (queryDays) {
      const parsedDays = Number(queryDays);
      if (DAY_WINDOWS.includes(parsedDays as (typeof DAY_WINDOWS)[number]) && parsedDays !== days) {
        setDays(parsedDays as (typeof DAY_WINDOWS)[number]);
      }
    }
    if (querySourceType && SOURCE_TYPES.includes(querySourceType as (typeof SOURCE_TYPES)[number]) && querySourceType !== sourceType) {
      setSourceType(querySourceType as (typeof SOURCE_TYPES)[number]);
    }
    if (!querySourceType && sourceType !== "all") {
      setSourceType("all");
    }
  }, [days, province, queryDays, queryProvince, querySourceType, sourceType]);

  useEffect(() => {
    setSelectedIssueFamily(null);
  }, [province, days, sourceType]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("province", province);
    nextParams.set("days", String(days));
    if (sourceType !== "all") {
      nextParams.set("sourceType", sourceType);
    } else {
      nextParams.delete("sourceType");
    }

    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }
  }, [days, pathname, province, router, searchParams, sourceType]);

  return (
    <div className="space-y-5">
      <DashboardToolbar
        label="Signal Desk"
        title="Rising topics, narrative momentum, and real-time public signal"
        description="Use province and time filters to see which topics are rising fastest, what people and media are saying now, and which narratives are spreading across the public conversation. This is a governed signal monitor, not a full social firehose."
        controls={
          <>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Province
              </span>
              <select
                value={province}
                onChange={(event) => setProvince(event.target.value as (typeof PROVINCES)[number])}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
              >
                {PROVINCES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Window
              </span>
              <select
                value={days}
                onChange={(event) => setDays(Number(event.target.value) as (typeof DAY_WINDOWS)[number])}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
              >
                {DAY_WINDOWS.map((option) => (
                  <option key={option} value={option}>
                    Last {option} days
                  </option>
                ))}
              </select>
            </label>
          </>
        }
      />

      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Active Scope
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          The trends dashboard is currently focused on{" "}
          <span className="font-bold">{selectedProvince ?? "all provinces"}</span> over the last{" "}
          <span className="font-bold">{days} days</span>. The source filter below applies only to the
          Top Signals evidence layer so that evidence review can be narrowed without implying a
          dashboard-wide source exclusion.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          What This Answers
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          This dashboard answers what topics are rising now, which narratives are spreading fastest,
          which source layers are amplifying them, and where public conversation is becoming most intense.
        </p>
      </div>

      <GICCard
        premium
        title="Narrative Briefing"
        subtitle="Grounded AI summary of current topic momentum, public narrative risk, and what needs monitoring next"
        icon={<TrendingUp className="h-5 w-5 text-gic-blue" />}
      >
        <StructuredBriefingPanel
          url={`/api/intelligence/trends-briefing?${new URLSearchParams({
            ...(selectedProvince ? { province: selectedProvince } : {}),
            days: String(days),
          }).toString()}`}
          loadingLabel="Building trends briefing..."
          headlineLabel="Narrative Headline"
        />
      </GICCard>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <GICCard
          premium
          title="Narrative Command Summary"
          subtitle="Where signal pressure is rising, what topic dominates, and how intense the public narrative is"
          icon={<TrendingUp className="h-5 w-5 text-gic-blue" />}
        >
          <SocialTrendsExecutivePanel province={selectedProvince} days={days} />
        </GICCard>

        <GICCard
          premium
          title="Rising Topic Clusters"
          subtitle="Ranked topic clusters by spread, intensity, and negativity so the strongest narrative hotspots stand out first"
          icon={<Activity className="h-5 w-5 text-gic-blue" />}
        >
          <ComplaintClustersPanel
            province={selectedProvince}
            days={days}
            selectedIssueFamily={selectedIssueFamily}
            onSelectIssueFamily={setSelectedIssueFamily}
          />
        </GICCard>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <GICCard
          premium
          title="Topic Momentum"
          subtitle="How citizen-facing issue families are rising or falling over time"
          icon={<MessageSquare className="h-5 w-5 text-gic-blue" />}
        >
          <CitizenVoiceTrendsPanel
            province={selectedProvince}
            days={days}
            selectedIssueFamily={selectedIssueFamily}
            onSelectIssueFamily={setSelectedIssueFamily}
          />
        </GICCard>

        <GICCard
          premium
          title="Top Signals"
          subtitle="The governed posts, articles, and public documents behind the selected narrative cluster"
          icon={<Activity className="h-5 w-5 text-gic-blue" />}
        >
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Evidence Source
              </span>
              <select
                value={sourceType}
                onChange={(event) => setSourceType(event.target.value as (typeof SOURCE_TYPES)[number])}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
              >
                <option value="all">All sources</option>
                <option value="news">News</option>
                <option value="social">Social</option>
                <option value="gov">Public statements</option>
                <option value="civic">Civic / NGO</option>
              </select>
            </label>
          </div>
          <CitizenVoiceEvidencePanel
            province={selectedProvince}
            days={days}
            issueFamily={selectedIssueFamily}
            sourceType={sourceType !== "all" ? sourceType : null}
          />
        </GICCard>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <GICCard
          premium
          title="Community Signal Pulse"
          subtitle="Resident and community signals carried into the trends layer and aligned to the active topic focus"
          icon={<Activity className="h-5 w-5 text-gic-blue" />}
        >
          <ProvinceLegacyCommunitySignalsPanel
            province={selectedProvince}
            days={days}
            selectedIssue={selectedIssueFamily}
            onSelectIssue={setSelectedIssueFamily}
          />
          </GICCard>

        {selectedProvince ? (
          <GICCard
            premium
            title="Narrative Mood"
            subtitle="How the wider province conversation is shifting across public mood and issue tone"
            icon={<MessageSquareQuote className="h-5 w-5 text-gic-blue" />}
          >
            <ProvinceSentimentPanel province={selectedProvince} days={days} />
          </GICCard>
        ) : (
          <GICCard
            premium
            title="Narrative Mood"
            subtitle="Province mood comparison activates once a single province is selected"
            icon={<MessageSquareQuote className="h-5 w-5 text-gic-blue" />}
          >
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm font-medium text-slate-600">
              Select a single province to open the province-level mood view. While all provinces are selected, this dashboard stays focused on cross-province topic momentum and signal concentration.
            </div>
          </GICCard>
        )}
      </div>

      <GICCard
        premium
        title="Source Mix"
        subtitle="How the current trend layer is distributed across news, social, public statements, and civic sources"
        icon={<Activity className="h-5 w-5 text-gic-blue" />}
      >
        <SocialSourceMixPanel province={selectedProvince} days={days} />
      </GICCard>
    </div>
  );
}
