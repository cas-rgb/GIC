"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Database, ShieldCheck } from "lucide-react";

import { SourceRegistrySummaryResponse } from "@/lib/source-registry/types";

interface MunicipalitySourceCoveragePanelProps {
  province: string;
  municipality: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: SourceRegistrySummaryResponse }
  | { status: "error"; message: string };

export default function MunicipalitySourceCoveragePanel({
  province,
  municipality,
}: MunicipalitySourceCoveragePanelProps) {
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
        const response = await fetch("/api/analytics/source-registry-summary", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            await parseError(
              response,
              `request failed with status ${response.status}`,
            ),
          );
        }

        const data = (await response.json()) as SourceRegistrySummaryResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load municipality source coverage",
        });
      }
    }

    void load();
  }, [province]);

  const provinceRow = useMemo(() => {
    if (state.status !== "loaded") {
      return null;
    }

    return (
      state.data.byProvince.find((row) => row.province === province) ?? null
    );
  }, [province, state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[180px] items-center justify-center text-sm font-bold text-slate-400">
        Loading registry-backed coverage...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[180px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  if (!provinceRow) {
    return (
      <div className="flex min-h-[180px] items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-500">
          No verified registry coverage is recorded for {province} yet.
        </p>
      </div>
    );
  }

  const kpiShare =
    provinceRow.sourceCount > 0
      ? Math.round((provinceRow.kpiTruthCount / provinceRow.sourceCount) * 100)
      : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Municipality dependency
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          {municipality} inherits the verified {province} source estate. Local
          evidence is only as decision-grade as the provincial official and
          KPI-truth coverage behind it.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-lg font-bold text-slate-900">
            {provinceRow.sourceCount}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Verified
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-lg font-bold text-emerald-700">
            {provinceRow.officialCount}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Official
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-lg font-bold text-blue-700">{kpiShare}%</p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">
            KPI Share
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <Database className="h-3.5 w-3.5" />
        source_registry
      </div>
    </div>
  );
}
