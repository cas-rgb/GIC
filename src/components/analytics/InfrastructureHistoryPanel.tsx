"use client";

import { useEffect, useState } from "react";

import { HistoricalInfrastructureResponse } from "@/lib/analytics/types";

type State =
  | { status: "loading" }
  | { status: "loaded"; data: HistoricalInfrastructureResponse }
  | { status: "error"; message: string };

export default function InfrastructureHistoryPanel(props: {
  province: string;
  municipality?: string | null;
  ward?: string | null;
}) {
  const { province, municipality = null, ward = null } = props;
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    async function load() {
      setState({ status: "loading" });
      const params = new URLSearchParams({ province });
      if (municipality) params.set("municipality", municipality);
      if (ward) params.set("ward", ward);

      try {
        const response = await fetch(`/api/analytics/place-infrastructure-history?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`request failed with status ${response.status}`);
        }
        const data = (await response.json()) as HistoricalInfrastructureResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Failed to load infrastructure history",
        });
      }
    }

    void load();
  }, [municipality, province, ward]);

  if (state.status === "loading") {
    return <p className="text-sm text-slate-500">Loading infrastructure history...</p>;
  }

  if (state.status === "error") {
    return <p className="text-sm text-slate-500">{state.message}</p>;
  }

  if (state.data.rows.length === 0) {
    return <p className="text-sm text-slate-500">No structured infrastructure history has been loaded for this geography yet.</p>;
  }

  const usingFallbackEvents = state.data.trace.table === "historical_issue_events";

  return (
    <div className="space-y-3">
      {usingFallbackEvents ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Showing ward-level historical issue events because no curated infrastructure-history rows have been loaded for this ward yet.
        </p>
      ) : null}
      {state.data.rows.slice(0, 8).map((row, index) => (
        <div
          key={`${row.summaryText}-${index}`}
          className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {row.periodYear ?? row.eventDate ?? "Historical record"}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{row.summaryText}</p>
          <p className="mt-1 text-xs text-slate-500">
            {[row.issueFamily, row.serviceDomain, row.severity, row.sourceName]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </div>
      ))}
    </div>
  );
}
