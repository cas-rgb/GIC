"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileJson, RefreshCw } from "lucide-react";

import { ProvinceRecommendationsResponse } from "@/lib/recommendations/types";

interface MunicipalityRecommendationsPanelProps {
  province: string;
  municipality: string;
  days?: number;
  selectedIssue?: string | null;
  onSelectIssue?: (issue: string) => void;
  onSelectTraceChip?: (chip: string) => void;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ProvinceRecommendationsResponse }
  | { status: "error"; message: string };

export default function MunicipalityRecommendationsPanel({
  province,
  municipality,
  days = 30,
  selectedIssue,
  onSelectIssue,
  onSelectTraceChip,
}: MunicipalityRecommendationsPanelProps) {
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

    async function load(): Promise<void> {
      setState({ status: "loading" });
      try {
        const response = await fetch(
          `/api/intelligence/municipality-recommendations?province=${encodeURIComponent(
            province
          )}&municipality=${encodeURIComponent(municipality)}&days=${days}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            await parseError(response, `request failed with status ${response.status}`)
          );
        }

        const data = (await response.json()) as ProvinceRecommendationsResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load municipality recommendations",
        });
      }
    }

    void load();
  }, [province, municipality, days]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[260px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Building municipality recommendations...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[260px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">{state.message}</p>
        </div>
      </div>
    );
  }

  const { data } = state;

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${municipality.toLowerCase().replace(/\s+/g, "-")}-municipality-recommendations.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const header = [
      "title",
      "issue",
      "urgency",
      "impact_tier",
      "owner_office",
      "evidence_count",
      "official_share",
      "confidence",
      "linked_leaders",
      "recommended_action",
      "expected_impact",
      "rationale",
      "trace_chips",
    ];

    const lines = data.recommendations.map((recommendation) =>
      [
        recommendation.title,
        recommendation.issue,
        recommendation.urgency,
        recommendation.impactTier,
        recommendation.ownerOffice,
        recommendation.evidenceCount,
        recommendation.officialShare,
        recommendation.confidence,
        recommendation.linkedLeaders.join(" | "),
        recommendation.recommendedAction,
        recommendation.expectedImpact,
        recommendation.rationale,
        recommendation.traceChips.join(" | "),
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    );

    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${municipality.toLowerCase().replace(/\s+/g, "-")}-municipality-recommendations.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
        <button
          type="button"
          onClick={exportJson}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600"
        >
          <FileJson className="h-3.5 w-3.5" />
          Export JSON
        </button>
      </div>
      {data.recommendations.map((recommendation) => (
        <div
          key={recommendation.title}
          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {recommendation.title}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {recommendation.issue}
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${
                recommendation.urgency === "High"
                  ? "bg-rose-50 text-rose-600"
                  : recommendation.urgency === "Medium"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {recommendation.urgency}
            </span>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-600">
            {recommendation.recommendedAction}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Owner Office
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">
                {recommendation.ownerOffice}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Impact Tier
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {recommendation.impactTier}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Evidence Count
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {recommendation.evidenceCount}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Official Share
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {recommendation.officialShare}%
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">
                Public Pressure
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {recommendation.publicPressureMentions} mentions
              </p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600">
                Legacy Community
              </p>
              <p className="mt-2 text-sm font-bold text-slate-900">
                {recommendation.legacyCommunityDocuments} docs
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {recommendation.traceChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onSelectTraceChip?.(chip)}
                className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 transition-colors hover:bg-slate-200"
              >
                {chip}
              </button>
            ))}
          </div>

          {onSelectIssue ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => onSelectIssue(recommendation.issue)}
                className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${
                  selectedIssue === recommendation.issue
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {selectedIssue === recommendation.issue ? "Evidence Open" : "Open Evidence"}
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
