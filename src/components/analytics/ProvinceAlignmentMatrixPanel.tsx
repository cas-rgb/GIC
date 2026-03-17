"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw, Scale } from "lucide-react";

import { ProvinceAlignmentMatrixResponse } from "@/lib/analytics/types";

interface ProvinceAlignmentMatrixPanelProps {
  province: string;
  days?: number;
  serviceDomain?: string | null;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ProvinceAlignmentMatrixResponse }
  | { status: "error"; message: string };

function getPointColor(alignmentGap: number): string {
  if (alignmentGap >= 8) {
    return "#2563eb";
  }
  if (alignmentGap <= -8) {
    return "#dc2626";
  }
  return "#0f766e";
}

export default function ProvinceAlignmentMatrixPanel({
  province,
  days = 30,
  serviceDomain = null,
}: ProvinceAlignmentMatrixPanelProps) {
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
        const response = await fetch(
          `/api/analytics/province-alignment-matrix?province=${encodeURIComponent(province)}&days=${days}${serviceDomain ? `&serviceDomain=${encodeURIComponent(serviceDomain)}` : ""}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            await parseError(response, `request failed with status ${response.status}`)
          );
        }

        const data = (await response.json()) as ProvinceAlignmentMatrixResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load province alignment matrix",
        });
      }
    }

    void load();
  }, [province, days, serviceDomain]);

  const rows = useMemo(() => {
    if (state.status !== "loaded") {
      return [];
    }

    return state.data.rows.slice(0, 8);
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading province alignment view...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[280px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">{state.message}</p>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
        <p className="text-sm font-bold text-slate-500">No alignment rows available yet.</p>
      </div>
    );
  }

  const { summary } = state.data;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Attention Alignment
          </p>
          <p className="mt-1 text-2xl font-display font-bold text-slate-900">
            {Math.max(0, Math.round(100 - summary.avgAlignmentGap))}%
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Strongest Match
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {summary.strongestAlignedIssue ?? "No data"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Weakest Match
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {summary.weakestAlignedIssue ?? "No data"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
              Strategic Alignment Matrix
            </h4>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Public concern share versus governed official attention share by issue category
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Scale className="h-3.5 w-3.5" />
            concern vs attention proxy
          </div>
        </div>

        <svg viewBox="0 0 520 320" className="h-72 w-full">
          <line x1="60" y1="260" x2="470" y2="260" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="60" y1="260" x2="60" y2="40" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="60" y1="150" x2="470" y2="150" stroke="#e2e8f0" strokeDasharray="4 4" />
          <line x1="265" y1="40" x2="265" y2="260" stroke="#e2e8f0" strokeDasharray="4 4" />

          <text x="265" y="300" textAnchor="middle" className="fill-slate-400 text-[10px] font-black uppercase tracking-[0.18em]">
            Public Concern Share
          </text>
          <text x="18" y="150" textAnchor="middle" transform="rotate(-90 18 150)" className="fill-slate-400 text-[10px] font-black uppercase tracking-[0.18em]">
            Official Attention Share
          </text>

          {rows.map((row) => {
            const x = 60 + (row.concernShare / 100) * 410;
            const y = 260 - (row.officialAttentionShare / 100) * 220;
            return (
              <g key={row.serviceDomain}>
                <circle
                  cx={x}
                  cy={y}
                  r={Math.max(8, Math.round(row.concernVolume / 6))}
                  fill={getPointColor(row.alignmentGap)}
                  fillOpacity="0.85"
                />
                <text
                  x={x}
                  y={y - 14}
                  textAnchor="middle"
                  className="fill-slate-700 text-[9px] font-black uppercase tracking-[0.12em]"
                >
                  {row.serviceDomain}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
        <p className="text-sm font-medium text-slate-700">
          This matrix uses governed official attention signals as a proxy for government focus. It should be read as an attention-alignment surface, not a literal provincial budget allocation chart.
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.serviceDomain}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">{row.serviceDomain}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Concern {row.concernShare}% | Official attention {row.officialAttentionShare}%
              </p>
            </div>
            <p className={`text-sm font-bold ${row.alignmentGap >= 0 ? "text-blue-700" : "text-rose-600"}`}>
              {row.alignmentGap >= 0 ? "+" : ""}
              {row.alignmentGap} pts
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
