"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { SourceHealthSummaryResponse } from "@/lib/source-registry/types";

interface SourceFreshnessNoticeProps {
  province: string;
  municipality?: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: SourceHealthSummaryResponse }
  | { status: "error"; message: string };

export default function SourceFreshnessNotice({
  province,
  municipality,
}: SourceFreshnessNoticeProps) {
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
              : "Failed to load source freshness",
        });
      }
    }

    void load();
  }, [province]);

  if (state.status === "loading" || state.status === "error") {
    return null;
  }

  const totals = state.data.totals;
  const hasWarning = totals.staleCount > 0 || totals.failingCount > 0;

  if (!hasWarning) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <RefreshCw className="mt-0.5 h-4 w-4 text-emerald-600" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              Source Freshness
            </p>
            <p className="mt-2 text-sm font-medium text-slate-700">
              {municipality
                ? `${municipality} is currently`
                : `${province} is currently`}{" "}
              backed by a healthy province-level source refresh cycle.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
            Source Freshness Warning
          </p>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {province} has {totals.staleCount} stale and {totals.failingCount}{" "}
            failing active connectors. Treat local and provincial
            narrative-heavy views with extra caution until the source refresh
            cycle stabilizes.
          </p>
        </div>
      </div>
    </div>
  );
}
