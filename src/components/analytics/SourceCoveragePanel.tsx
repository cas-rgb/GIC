"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Database, ShieldCheck } from "lucide-react";

import {
  SourceHealthSummaryResponse,
  SourceRegistrySummaryResponse,
} from "@/lib/source-registry/types";

interface SourceCoveragePanelProps {
  province: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: SourceRegistrySummaryResponse }
  | { status: "error"; message: string };

type HealthState =
  | { status: "loading" }
  | { status: "loaded"; data: SourceHealthSummaryResponse }
  | { status: "error"; message: string };

export default function SourceCoveragePanel({
  province,
}: SourceCoveragePanelProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [healthState, setHealthState] = useState<HealthState>({ status: "loading" });

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
        const [response, healthResponse] = await Promise.all([
          fetch("/api/analytics/source-registry-summary", {
            cache: "no-store",
          }),
          fetch(
            `/api/analytics/source-health-summary?province=${encodeURIComponent(province)}`,
            { cache: "no-store" }
          ),
        ]);

        if (!response.ok) {
          throw new Error(
            await parseError(
              response,
              `request failed with status ${response.status}`
            )
          );
        }

        if (!healthResponse.ok) {
          throw new Error(
            await parseError(
              healthResponse,
              `request failed with status ${healthResponse.status}`
            )
          );
        }

        const [data, healthData] = (await Promise.all([
          response.json(),
          healthResponse.json(),
        ])) as [SourceRegistrySummaryResponse, SourceHealthSummaryResponse];
        setState({ status: "loaded", data });
        setHealthState({ status: "loaded", data: healthData });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load source coverage",
        });
        setHealthState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load source health",
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

  const topTypes = useMemo(() => {
    if (state.status !== "loaded") {
      return [];
    }

    return state.data.byType.slice(0, 3);
  }, [state]);

  const provinceHealth = useMemo(() => {
    if (healthState.status !== "loaded") {
      return null;
    }

    return (
      healthState.data.byProvince.find((row) => row.province === province) ?? null
    );
  }, [healthState, province]);

  if (state.status === "loading" || healthState.status === "loading") {
    return (
      <div className="flex min-h-[260px] items-center justify-center text-sm font-bold text-slate-400">
        Loading governed source coverage...
      </div>
    );
  }

  if (state.status === "error" || healthState.status === "error") {
    const message =
      state.status === "error"
        ? state.message
        : healthState.status === "error"
          ? healthState.message
          : "Failed to load source coverage";

    return (
      <div className="flex min-h-[260px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">{message}</p>
        </div>
      </div>
    );
  }

  const { data } = state;

  if (!provinceRow) {
    return (
      <div className="flex min-h-[260px] items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-500">
          No source registry coverage recorded for {province} yet.
        </p>
      </div>
    );
  }

  const kpiShare =
    provinceRow.sourceCount > 0
      ? Math.round((provinceRow.kpiTruthCount / provinceRow.sourceCount) * 100)
      : 0;
  const staleWarning =
    provinceHealth &&
    (provinceHealth.failingCount > 0 || provinceHealth.staleCount > 0);

  return (
    <div className="space-y-5">
      {staleWarning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
            Freshness Warning
          </p>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {province} currently has {provinceHealth?.staleCount ?? 0} stale and{" "}
            {provinceHealth?.failingCount ?? 0} failing connectors. Read operational
            charts with extra care until the source refresh cycle recovers.
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
          Province Coverage
        </p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xl font-display font-bold text-slate-900">
              {province}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {provinceRow.sourceCount} verified sources
            </p>
          </div>
          <div className="rounded-xl bg-white px-3 py-2 text-right">
            <p className="text-lg font-bold text-blue-600">{provinceRow.kpiTruthCount}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              KPI truth
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-lg font-bold text-slate-900">
            {provinceRow.sourceCount}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Verified
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-lg font-bold text-emerald-600">
            {provinceRow.officialCount}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
            Official
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-lg font-bold text-amber-600">{kpiShare}%</p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">
            KPI share
          </p>
        </div>
      </div>

      {provinceHealth ? (
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-lg font-bold text-emerald-600">
              {provinceHealth.healthyCount}
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
              Healthy
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-lg font-bold text-amber-600">
              {provinceHealth.staleCount}
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">
              Stale
            </p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <p className="text-lg font-bold text-rose-600">
              {provinceHealth.failingCount}
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-400">
              Failing
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-lg font-bold text-slate-900">
              {provinceHealth.refreshedLast24hCount}
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              24h
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Source Type Mix
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Database className="h-3.5 w-3.5" />
            {data.trace.table}
          </div>
        </div>

        {topTypes.map((row) => (
          <div
            key={row.sourceType}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-900">
                  {row.sourceType}
                </span>
              </div>
              <span className="text-sm font-display font-bold text-slate-900">
                {row.sourceCount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
