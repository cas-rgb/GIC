"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, MapPin, Download } from "lucide-react";

import { MunicipalityRankingResponse } from "@/lib/analytics/types";
import ProgressSpinner from "@/components/ui/ProgressSpinner";

interface MunicipalityRankingPanelProps {
  province?: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: MunicipalityRankingResponse }
  | { status: "error"; message: string };

export default function MunicipalityRankingPanel({
  province = "Gauteng",
}: MunicipalityRankingPanelProps) {
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
      try {
        const response = await fetch(
          `/api/analytics/municipality-ranking?province=${encodeURIComponent(province)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error(
            await parseError(
              response,
              `request failed with status ${response.status}`,
            ),
          );
        }

        const data = (await response.json()) as MunicipalityRankingResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load municipality ranking",
        });
      }
    }

    void load();
  }, [province]);

  const topRow = useMemo(() => {
    if (state.status !== "loaded") {
      return null;
    }

    return state.data.rows[0] ?? null;
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <ProgressSpinner message="Loading municipality exposure..." />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-500">{state.message}</p>
      </div>
    );
  }

  const { data } = state;

  if ((data.rows || []).length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-500">
          No municipality ranking rows available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-xl mb-4 print:hidden">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" /> Regional Stress Index
        </h3>
        <button
          onClick={() => {
            const header = ["Municipality", "Risk Score", "Pressure Cases", "Dominant Domain", "AI Synthesis Overview"];
            const csvRows = (data.rows || []).map(row => [
              `"${row.municipality}"`, 
              row.riskScore, 
              row.pressureCaseCount, 
              `"${row.dominantServiceDomain || 'Mixed'}"`, 
              `"${row.aiSynthesis?.[0]?.whatHappened || ''}"`
            ]);
            const csvContent = [header, ...csvRows].map(e => e.join(",")).join("\n");
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `municipal_ranking_${province.replace(/\s+/g, '_').toLowerCase()}.csv`;
            link.click();
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {topRow ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            Top Pressure Municipality
          </p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-display font-bold text-slate-900">
                {topRow.municipality}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {topRow.dominantServiceDomain || "Mixed domain"}
              </p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 text-right">
              <p className="text-lg font-bold text-rose-600">
                {topRow.riskScore}
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Risk index
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-rose-500/20 pt-4">
            {topRow.aiSynthesis && topRow.aiSynthesis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">Who</span>
                  <p className="text-xs font-medium text-slate-700 leading-snug">
                    {topRow.aiSynthesis[0].whoInvolved || "Municipal authorities and affected residents."}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">What</span>
                  <p className="text-xs font-medium text-slate-700 leading-snug">
                    {topRow.aiSynthesis[0].whatHappened || "Severe cluster of service delivery disruption."}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">Why</span>
                  <p className="text-xs font-medium text-slate-700 leading-snug">
                    {topRow.aiSynthesis[0].whyItHappened || "Chronic infrastructure fatigue compounding."}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">When</span>
                  <p className="text-xs font-medium text-slate-700 leading-snug">
                    {topRow.aiSynthesis[0].whenTimeline || "Ongoing throughout the rolling period."}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">How</span>
                  <p className="text-xs font-medium text-slate-700 leading-snug">
                    {topRow.aiSynthesis[0].howResolvedOrCurrent || "Ongoing tracking via governed feeds."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-700 font-medium">
                High concentration of {topRow.dominantServiceDomain?.toLowerCase() || "mixed"} failure incidents is driving the risk index to {topRow.riskScore}.
              </p>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {(data.rows || []).map((row, index) => (
          <div
            key={row.municipality}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-500">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-sm font-bold text-slate-900">
                      {row.municipality}
                    </p>
                  </div>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {row.dominantServiceDomain || "Mixed domain"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-display font-bold text-slate-900">
                  {row.pressureCaseCount}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Issue volume
                </p>
              </div>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{
                  width: `${Math.max(
                    8,
                    Math.round(
                      (row.pressureCaseCount /
                        Math.max(topRow?.pressureCaseCount ?? 1, 1)) *
                        100,
                    ),
                  )}%`,
                }}
              />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 p-2.5">
                <p className="text-sm font-bold text-slate-900">
                  {row.riskScore}
                </p>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Risk
                </p>
              </div>
              <div className="rounded-xl bg-rose-50 p-2.5">
                <p className="text-sm font-bold text-rose-600">
                  {row.highSeverityCount}
                </p>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-rose-400">
                  Severe
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-2.5">
                <p className="text-sm font-bold text-amber-600">
                  {row.protestCount}
                </p>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-400">
                  Protests
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-2.5">
                <p className="text-sm font-bold text-emerald-600">
                  {row.responseCount}
                </p>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400">
                  Responses
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        Ranked municipality bar view from issue volume, severity, protest, and
        response factors
      </div>
    </div>
  );
}
