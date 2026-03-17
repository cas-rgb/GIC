"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Scale, ShieldCheck } from "lucide-react";

import { EvidenceBalanceRow, ProvinceEvidenceBalanceResponse } from "@/lib/analytics/types";

interface ProvinceEvidenceBalancePanelProps {
  province: string;
  days?: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ProvinceEvidenceBalanceResponse }
  | { status: "error"; message: string };

export default function ProvinceEvidenceBalancePanel({
  province,
  days = 30,
}: ProvinceEvidenceBalancePanelProps) {
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
          `/api/analytics/province-evidence-balance?province=${encodeURIComponent(
            province
          )}&days=${days}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            await parseError(
              response,
              `request failed with status ${response.status}`
            )
          );
        }

        const data = (await response.json()) as ProvinceEvidenceBalanceResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load province evidence balance",
        });
      }
    }

    void load();
  }, [province, days]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[260px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading evidence balance...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[260px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  const { data } = state;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-lg font-bold text-emerald-700">
            {data.summary.officialDocumentShare}%
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Official share
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-lg font-bold text-amber-700">
            {data.summary.narrativeDocumentShare}%
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">
            Narrative share
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-lg font-bold text-blue-700">
            {Math.round(data.summary.weightedConfidence * 100)}%
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">
            Weighted confidence
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <Scale className="mt-0.5 h-4 w-4 text-slate-600" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Dominant evidence class
            </p>
            <p className="mt-2 text-sm font-bold text-slate-900">
              {data.summary.dominantEvidenceClass ?? "Unavailable"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.rows.map((row: EvidenceBalanceRow) => (
          <div
            key={row.evidenceClass}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {row.evidenceClass}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {row.documentCount} documents · {row.sourceCount} source rows
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">
                  {row.documentShare}%
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Share
                </p>
              </div>
            </div>

            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{ width: `${Math.max(8, Math.round(row.documentShare))}%` }}
              />
            </div>

            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Reliability {Math.round(row.avgReliabilityScore * 100)}%
            </p>
          </div>
        ))}
      </div>

      {data.caveats.length > 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-4">
          {data.caveats.map((caveat: string) => (
            <p key={caveat} className="text-sm font-medium text-slate-500">
              {caveat}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
