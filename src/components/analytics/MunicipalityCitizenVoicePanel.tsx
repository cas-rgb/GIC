"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, MessageSquareWarning, RefreshCw, Siren, Speech } from "lucide-react";

import {
  MunicipalityCitizenVoiceSummaryResponse,
  MunicipalityLegacyCommunitySignalsResponse,
} from "@/lib/analytics/types";

interface MunicipalityCitizenVoicePanelProps {
  province: string;
  municipality: string;
  days?: number;
  selectedIssue?: string | null;
  onSelectIssue?: (issueFamily: string) => void;
}

type LoadState =
  | { status: "loading" }
  | {
      status: "loaded";
      data: MunicipalityCitizenVoiceSummaryResponse;
      legacy: MunicipalityLegacyCommunitySignalsResponse;
    }
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

export default function MunicipalityCitizenVoicePanel({
  province,
  municipality,
  days = 30,
  selectedIssue,
  onSelectIssue,
}: MunicipalityCitizenVoicePanelProps) {
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

      try {
        const [response, legacyResponse] = await Promise.all([
          fetch(
            `/api/analytics/municipality-citizen-voice-summary?province=${encodeURIComponent(
              province
            )}&municipality=${encodeURIComponent(municipality)}&days=${days}`,
            { cache: "no-store" }
          ),
          fetch(
            `/api/analytics/municipality-legacy-community-signals?province=${encodeURIComponent(
              province
            )}&municipality=${encodeURIComponent(municipality)}&days=${days}`,
            { cache: "no-store" }
          ),
        ]);

        if (!response.ok) {
          throw new Error(
            await parseError(response, `request failed with status ${response.status}`)
          );
        }

        if (!legacyResponse.ok) {
          throw new Error(
            await parseError(
              legacyResponse,
              `request failed with status ${legacyResponse.status}`
            )
          );
        }

        const [data, legacy] = (await Promise.all([
          response.json(),
          legacyResponse.json(),
        ])) as [
          MunicipalityCitizenVoiceSummaryResponse,
          MunicipalityLegacyCommunitySignalsResponse,
        ];
        setState({ status: "loaded", data, legacy });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load municipality public voice summary",
        });
      }
    }

    void load();
  }, [province, municipality, days]);

  useEffect(() => {
    if (
      state.status === "loaded" &&
      !selectedIssue &&
      state.data.issues.length > 0 &&
      onSelectIssue
    ) {
      onSelectIssue(state.data.issues[0].issueFamily);
    }
  }, [onSelectIssue, selectedIssue, state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading municipality public voice...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">{state.message}</p>
        </div>
      </div>
    );
  }

  const { data, legacy } = state;
  const strongestLegacyIssue = legacy.issues[0]?.issue ?? null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Citizen Mentions
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-slate-900">
            {data.summary.totalCitizenMentions}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Evidence Docs
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-blue-700">
            {data.summary.totalCitizenDocuments}
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
            Legacy Docs
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-indigo-700">
            {legacy.summary.documentCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Dominant Complaint
          </p>
          <p className="mt-2 text-lg font-display font-bold text-slate-900">
            {data.summary.dominantIssueFamily ?? "Unavailable"}
          </p>
        </div>
        <div className={`rounded-2xl border p-4 ${riskTone(data.summary.narrativeRiskLevel)}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Narrative Risk
          </p>
          <p className="mt-2 text-2xl font-display font-bold">
            {data.summary.narrativeRiskLevel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Speech className="h-4 w-4" />
            Local readout
          </div>
          <div className="mt-4 space-y-3">
            {data.narratives.map((narrative) => (
              <p key={narrative} className="text-sm font-medium leading-6 text-slate-700">
                {narrative}
              </p>
            ))}
            {legacy.summary.documentCount > 0 ? (
              <p className="text-sm font-medium leading-6 text-slate-700">
                Imported community history adds {legacy.summary.documentCount} legacy resident/civic documents
                {strongestLegacyIssue ? `, with ${strongestLegacyIssue} as the strongest recurring local complaint` : ""}
                {" "}at average urgency {legacy.summary.avgUrgency.toFixed(1)}.
              </p>
            ) : null}
          </div>
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Local mood
            </p>
            <p className="mt-2 text-xl font-display font-bold text-slate-900">
              {Math.round(data.summary.averageNegativeShare * 100)}% negative share
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {municipality}, {province}
            </p>
            {legacy.summary.documentCount > 0 ? (
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
                legacy urgency {legacy.summary.avgUrgency.toFixed(1)} | {Math.round(legacy.summary.negativeShare * 100)}% negative
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Siren className="h-4 w-4" />
            Complaint families
          </div>
          <div className="mt-4 space-y-3">
            {data.issues.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                No governed municipality public-voice issues are available yet.
              </div>
            ) : (
              data.issues.map((issue) => {
                const active = selectedIssue === issue.issueFamily;

                return (
                  <button
                    key={issue.issueFamily}
                    type="button"
                    onClick={() => onSelectIssue?.(issue.issueFamily)}
                    className={`w-full rounded-2xl border p-4 text-left shadow-sm transition-colors ${
                      active
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{issue.issueFamily}</p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          local citizen complaint family
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display font-bold text-slate-900">
                          {issue.mentionCount}
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                          mentions
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-sm font-bold text-slate-900">{issue.documentCount}</p>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                          docs
                        </p>
                      </div>
                      <div className="rounded-xl bg-rose-50 p-3">
                        <p className="text-sm font-bold text-rose-700">
                          {Math.round(issue.avgNegativeShare * 100)}%
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">
                          negative
                        </p>
                      </div>
                      <div className="rounded-xl bg-blue-50 p-3">
                        <p className="text-sm font-bold text-blue-700">
                          {Math.round(issue.intensityScore)}
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">
                          intensity
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex items-start gap-2">
          <MessageSquareWarning className="mt-0.5 h-4 w-4 text-amber-600" />
          <div className="space-y-2">
            {data.caveats.map((caveat) => (
              <p key={caveat} className="text-sm font-medium text-slate-700">
                {caveat}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
