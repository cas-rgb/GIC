"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Droplets, RefreshCw } from "lucide-react";

import { WaterReliabilityResponse } from "@/lib/analytics/types";

interface WaterReliabilityPanelProps {
  province: string;
  days?: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: WaterReliabilityResponse }
  | { status: "error"; message: string };

export default function WaterReliabilityPanel({
  province,
  days = 30,
}: WaterReliabilityPanelProps) {
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
          `/api/analytics/water-reliability?province=${encodeURIComponent(
            province
          )}&days=${days}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            await parseError(
              response,
              `request failed with status ${response.status}`
            )
          );
        }

        const data = (await response.json()) as WaterReliabilityResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load water reliability",
        });
      }
    }

    void load();
  }, [province, days]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading water reliability...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-center">
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Water Reliability
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.summary.waterReliabilityScore}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Official Docs
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.summary.officialDocumentCount}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Official Signals
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.summary.officialSignalCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Latest Day
          </p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {data.summary.latestDay ?? "No official water rows"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <Droplets className="mt-1 h-5 w-5 text-blue-600" />
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-900">
              Official water evidence is contributing to the province view.
            </p>
            <p className="text-sm font-medium text-slate-600">
              This score uses official water-related documents, governed signals, and official
              incidents to reduce narrative bias in water-heavy pressure windows.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 p-4">
        {data.caveats.map((caveat) => (
          <p key={caveat} className="text-sm font-medium text-slate-500">
            {caveat}
          </p>
        ))}
      </div>
    </div>
  );
}
