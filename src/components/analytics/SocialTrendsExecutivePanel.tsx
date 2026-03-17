"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, RefreshCw, Siren, Speech } from "lucide-react";

import {
  SocialTrendConcernProvinceRow,
  SocialTrendsExecutiveSummaryResponse,
} from "@/lib/analytics/types";

interface SocialTrendsExecutivePanelProps {
  province?: string;
  days?: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: SocialTrendsExecutiveSummaryResponse }
  | { status: "error"; message: string };

function riskTone(level: "Low" | "Elevated" | "High"): string {
  switch (level) {
    case "High":
      return "border-rose-100 bg-rose-50 text-rose-700";
    case "Elevated":
      return "border-amber-100 bg-amber-50 text-amber-700";
    default:
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }
}

export default function SocialTrendsExecutivePanel({
  province,
  days = 30,
}: SocialTrendsExecutivePanelProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    async function parseError(response: Response, fallback: string) {
      try {
        const body = (await response.json()) as { error?: string };
        return body.error || fallback;
      } catch {
        return fallback;
      }
    }

    async function load() {
      setState({ status: "loading" });

      const params = new URLSearchParams();
      params.set("days", String(days));
      if (province && province !== "All Provinces") {
        params.set("province", province);
      }

      try {
        const response = await fetch(
          `/api/analytics/social-trends-executive-summary?${params.toString()}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            await parseError(response, `request failed with status ${response.status}`)
          );
        }

        const data = (await response.json()) as SocialTrendsExecutiveSummaryResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load social trends executive summary",
        });
      }
    }

    void load();
  }, [province, days]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading public-voice command summary...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">{state.message}</p>
        </div>
      </div>
    );
  }

  const { data } = state;
  const leadConcernProvince = data.concernProvinces[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.45fr_1fr_1fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Command Readout
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {data.summary.hottestProvince
              ? `${data.summary.hottestProvince} is carrying the strongest public-pressure signal, led by ${leadConcernProvince?.dominantIssueFamily ?? data.summary.dominantIssueFamily ?? "mixed complaints"}.`
              : "No province currently dominates the public-pressure view."}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Citizen Mentions
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.summary.totalCitizenMentions}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Legacy Community Docs
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.summary.totalLegacyCommunityDocuments}
          </p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 ${riskTone(data.summary.narrativeRiskLevel)}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Narrative Risk
          </p>
          <p className="mt-1 text-xl font-display font-bold">
            {data.summary.narrativeRiskLevel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Hottest Province
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {data.summary.hottestProvince ?? "No clear hotspot"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            public-pressure leader
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">
            Lead Hotspot Cluster
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {leadConcernProvince?.dominantIssueFamily ?? data.summary.dominantIssueFamily ?? "Unavailable"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            {leadConcernProvince ? `${leadConcernProvince.mentionCount} mentions` : "issue focus forming"}
          </p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 ${riskTone(data.summary.narrativeRiskLevel)}`}>
          <p className="text-[9px] font-black uppercase tracking-[0.2em]">
            Public Mood
          </p>
          <p className="mt-1 text-sm font-bold">
            {Math.round(data.summary.averageNegativeShare * 100)}% negative
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em]">
            cross-province complaint tone
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">
            Legacy Urgency
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {data.summary.legacyAvgUrgency.toFixed(1)}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            imported community pulse
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.02fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Speech className="h-4 w-4" />
            Executive readout
          </div>
          <div className="mt-4 space-y-3">
            {data.narratives.map((narrative: string) => (
              <p key={narrative} className="text-sm font-medium leading-6 text-slate-700">
                {narrative}
              </p>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Current hotspot
            </p>
            <p className="mt-1 text-xl font-display font-bold text-slate-900">
              {data.summary.hottestProvince ?? "No clear hotspot"}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {Math.round(data.summary.averageNegativeShare * 100)}% average negative share
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Siren className="h-4 w-4" />
            Concern provinces
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <p>Province</p>
              <p>Issue</p>
              <p className="text-right">Mentions</p>
              <p className="text-right">Negative</p>
              <p className="text-right">Intensity</p>
            </div>
            <div className="divide-y divide-slate-100">
              {data.concernProvinces.length === 0 ? (
                <div className="bg-slate-50 px-4 py-4 text-sm font-medium text-slate-500">
                  No governed citizen-voice hotspot rows are available yet.
                </div>
              ) : (
                data.concernProvinces.map((row: SocialTrendConcernProvinceRow) => (
                  <div key={row.province} className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr] lg:items-start">
                    <p className="text-sm font-bold text-slate-900">{row.province}</p>
                    <p className="text-sm font-medium text-slate-700">{row.dominantIssueFamily ?? "mixed issue pressure"}</p>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{row.mentionCount}</p>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {row.documentCount} docs
                      </p>
                    </div>
                    <p className="text-right text-sm font-bold text-rose-700">
                      {Math.round(row.avgNegativeShare * 100)}%
                    </p>
                    <p className="text-right text-sm font-bold text-blue-700">
                      {Math.round(row.intensityScore)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
              Geographic Spread
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Where the active narrative is strongest across provinces in the current window
            </p>
          </div>
        </div>

        {data.concernProvinces.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
            No governed geographic spread rows are available yet.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.concernProvinces.map((row, index) => {
              const intensityWidth = leadConcernProvince
                ? Math.max(10, Math.round((row.intensityScore / Math.max(leadConcernProvince.intensityScore, 1)) * 100))
                : 10;
              const tone =
                index === 0
                  ? "border-rose-100 bg-rose-50"
                  : index === 1
                    ? "border-amber-100 bg-amber-50"
                    : "border-slate-100 bg-slate-50";

              return (
                <div key={`${row.province}-spread`} className={`rounded-2xl border px-4 py-4 ${tone}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{row.province}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {row.dominantIssueFamily ?? "mixed issue pressure"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-display font-bold text-slate-900">
                        {Math.round(row.intensityScore)}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        intensity
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-white/80">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${intensityWidth}%` }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-slate-700">
                      {row.mentionCount} mentions
                    </span>
                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-rose-700">
                      {Math.round(row.avgNegativeShare * 100)}% negative
                    </span>
                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-blue-700">
                      {row.documentCount} docs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Speech className="h-4 w-4" />
          Direct public evidence
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
          {data.evidenceHighlights.length === 0 ? (
            <div className="bg-slate-50 px-4 py-4 text-sm font-medium text-slate-500">
              No governed citizen-voice evidence highlights are available yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.evidenceHighlights.map((row) => (
                <div key={row.documentId} className="bg-white px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{row.title}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {[row.province, row.municipality, row.issueFamily, row.sourceName].filter(Boolean).join(" | ")}
                      </p>
                    </div>
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600"
                    >
                      Open
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                        row.sentimentLabel === "negative"
                          ? "bg-rose-50 text-rose-700"
                          : row.sentimentLabel === "positive"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {row.sentimentLabel}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
                      score {Math.round(row.sentimentScore)}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
                      confidence {Math.round(row.confidence * 100)}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-700">{row.excerpt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
        {data.caveats.map((caveat: string) => (
          <p key={caveat} className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700">
            {caveat}
          </p>
        ))}
      </div>
    </div>
  );
}
