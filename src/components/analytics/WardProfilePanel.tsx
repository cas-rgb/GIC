"use client";

import { useEffect, useState } from "react";

import { WardProfileResponse } from "@/lib/analytics/types";
import { formatWardDisplayLabel } from "@/lib/analytics/ward-label";

type State =
  | { status: "loading" }
  | { status: "loaded"; data: WardProfileResponse }
  | { status: "error"; message: string };

export default function WardProfilePanel(props: {
  province: string;
  municipality: string;
  ward: string;
}) {
  const { province, municipality, ward } = props;
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    async function load() {
      setState({ status: "loading" });
      const params = new URLSearchParams({ province, municipality, ward });

      try {
        const response = await fetch(
          `/api/analytics/ward-profile?${params.toString()}`,
          {
            cache: "no-store",
          },
        );
        if (!response.ok) {
          throw new Error(`request failed with status ${response.status}`);
        }
        const data = (await response.json()) as WardProfileResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load ward profile",
        });
      }
    }

    void load();
  }, [municipality, province, ward]);

  if (state.status === "loading") {
    return <p className="text-sm text-slate-500">Loading ward profile...</p>;
  }

  if (state.status === "error") {
    return <p className="text-sm text-slate-500">{state.message}</p>;
  }

  const label = formatWardDisplayLabel(
    state.data.wardLabel,
    state.data.wardNumber,
  );
  const flags = [
    { label: "Councillor", active: state.data.summary.hasCouncillor },
    { label: "Election", active: state.data.summary.hasElectionHistory },
    { label: "History", active: state.data.summary.hasInfrastructureHistory },
    { label: "Allocation", active: state.data.summary.hasBudgetAllocations },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Ward Reference
        </p>
        <p className="mt-2 text-lg font-display font-bold text-slate-900">
          {label}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {state.data.municipality}
          {state.data.districtName ? ` | ${state.data.districtName}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {flags.map((flag) => (
          <div
            key={flag.label}
            className={`rounded-2xl border px-4 py-3 text-center ${
              flag.active
                ? "border-emerald-100 bg-emerald-50"
                : "border-slate-100 bg-slate-50"
            }`}
          >
            <p className="text-sm font-bold text-slate-900">
              {flag.active ? "Yes" : "No"}
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              {flag.label}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Source: {state.data.sourceName ?? "Ward registry"}
        {state.data.sourceUrl ? ` | ${state.data.sourceUrl}` : ""}
      </p>
    </div>
  );
}
