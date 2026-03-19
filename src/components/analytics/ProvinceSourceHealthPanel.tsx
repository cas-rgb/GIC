"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

import { SourceHealthSummaryResponse } from "@/lib/source-registry/types";

interface ProvinceSourceHealthPanelProps {
  province: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: SourceHealthSummaryResponse }
  | { status: "error"; message: string };

export default function ProvinceSourceHealthPanel({
  province,
}: ProvinceSourceHealthPanelProps) {
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
          `/api/analytics/source-health-summary?province=${encodeURIComponent(province)}`,
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

        const data = (await response.json()) as SourceHealthSummaryResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load province source health",
        });
      }
    }

    void load();
  }, [province]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[160px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading source health...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[160px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  const totals = state.data.totals;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Healthy
          </div>
          <p className="mt-2 text-2xl font-display font-bold text-emerald-700">
            {totals.healthyCount}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
            <RefreshCw className="h-3.5 w-3.5" />
            24h Refreshed
          </div>
          <p className="mt-2 text-2xl font-display font-bold text-blue-700">
            {totals.refreshedLast24hCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
            <TimerReset className="h-3.5 w-3.5" />
            Stale
          </div>
          <p className="mt-2 text-2xl font-display font-bold text-amber-700">
            {totals.staleCount}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            Failing
          </div>
          <p className="mt-2 text-2xl font-display font-bold text-rose-700">
            {totals.failingCount}
          </p>
        </div>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
        Latest province success {totals.latestSuccessAt ?? "Unavailable"}
      </p>
    </div>
  );
}
