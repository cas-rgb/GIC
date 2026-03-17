"use client";

import { useEffect, useState } from "react";

import { PlaceProfileResponse } from "@/lib/analytics/types";

type State =
  | { status: "loading" }
  | { status: "loaded"; data: PlaceProfileResponse }
  | { status: "error"; message: string };

export default function PlaceProfilePanel(props: {
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
        const response = await fetch(`/api/analytics/place-profile?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`request failed with status ${response.status}`);
        }
        const data = (await response.json()) as PlaceProfileResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to load place profile",
        });
      }
    }

    void load();
  }, [municipality, province, ward]);

  if (state.status === "loading") {
    return <p className="text-sm text-slate-500">Loading place profile...</p>;
  }

  if (state.status === "error") {
    return <p className="text-sm text-slate-500">{state.message}</p>;
  }

  if (!state.data.demographics) {
    return (
      <p className="text-sm text-slate-500">
        No structured demographic profile has been loaded for this place yet.
      </p>
    );
  }

  const { demographics, latestYear } = state.data;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Profile Scope
        </p>
        <p className="mt-2 text-sm text-slate-700">
          {ward ?? municipality ?? province}
          {latestYear ? ` demographic baseline for ${latestYear}` : ""}.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric label="Population" value={formatNumber(demographics.populationTotal)} />
        <Metric label="Households" value={formatNumber(demographics.householdsTotal)} />
        <Metric label="Unemployment" value={formatPercent(demographics.unemploymentRate)} />
        <Metric label="Water Access" value={formatPercent(demographics.serviceAccessWater)} />
        <Metric label="Electricity" value={formatPercent(demographics.serviceAccessElectricity)} />
        <Metric label="Sanitation" value={formatPercent(demographics.serviceAccessSanitation)} />
      </div>
      <JsonGroup title="Language Profile" value={demographics.languageProfile} />
      <JsonGroup title="Settlement Profile" value={demographics.settlementProfile} />
      <JsonGroup title="Economic Profile" value={demographics.economicProfile} />
    </div>
  );
}

function Metric(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{props.label}</p>
      <p className="mt-2 text-lg font-display font-bold text-slate-900">{props.value}</p>
    </div>
  );
}

function JsonGroup(props: { title: string; value: Record<string, unknown> }) {
  const entries = Object.entries(props.value ?? {});
  if (entries.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{props.title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {entries.map(([key, value]) => (
          <span key={key} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
            {key}: {String(value)}
          </span>
        ))}
      </div>
    </div>
  );
}

function formatNumber(value: number | null) {
  return value === null ? "N/A" : value.toLocaleString();
}

function formatPercent(value: number | null) {
  return value === null ? "N/A" : `${value}%`;
}
