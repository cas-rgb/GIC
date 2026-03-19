"use client";

import { useEffect, useState } from "react";

import { WardCouncillorResponse } from "@/lib/analytics/types";
import { formatWardDisplayLabel } from "@/lib/analytics/ward-label";

type State =
  | { status: "loading" }
  | { status: "loaded"; data: WardCouncillorResponse }
  | { status: "error"; message: string };

export default function WardCouncillorPanel(props: {
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
          `/api/analytics/ward-councillor?${params.toString()}`,
          {
            cache: "no-store",
          },
        );
        if (!response.ok) {
          throw new Error(`request failed with status ${response.status}`);
        }
        const data = (await response.json()) as WardCouncillorResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load ward councillor",
        });
      }
    }

    void load();
  }, [municipality, province, ward]);

  if (state.status === "loading") {
    return <p className="text-sm text-slate-500">Loading ward councillor...</p>;
  }

  if (state.status === "error") {
    return <p className="text-sm text-slate-500">{state.message}</p>;
  }

  if (!state.data.councillorName) {
    return (
      <p className="text-sm text-slate-500">
        No verified ward councillor reference has been loaded for this ward yet.
      </p>
    );
  }

  const wardLabel = state.data.wardLabel || state.data.ward;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Ward Councillor
        </p>
        <p className="mt-2 text-sm font-bold text-slate-700">
          {formatWardDisplayLabel(wardLabel, state.data.wardNumber)}
        </p>
        <p className="mt-2 text-lg font-display font-bold text-slate-900">
          {state.data.councillorName}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {state.data.partyName ?? "Party unknown"}
          {state.data.officeTitle ? ` | ${state.data.officeTitle}` : ""}
        </p>
      </div>
      <p className="text-xs text-slate-500">
        Verification: {state.data.verificationTier ?? "unknown"}
        {state.data.sourceName ? ` | Source: ${state.data.sourceName}` : ""}
      </p>
    </div>
  );
}
