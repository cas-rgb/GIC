"use client";

import { useEffect, useState } from "react";

import {
  ElectionHistoryResponse,
  PlaceProfileResponse,
  WardProfileResponse,
} from "@/lib/analytics/types";

type State =
  | { status: "loading" }
  | {
      status: "loaded";
      placeProfile: PlaceProfileResponse | null;
      electionHistory: ElectionHistoryResponse | null;
      wardProfile: WardProfileResponse | null;
    }
  | { status: "error"; message: string };

const COALITION_SENSITIVE_MUNICIPALITIES = new Set([
  "City of Johannesburg",
  "City of Tshwane",
  "Ekurhuleni",
  "Nelson Mandela Bay",
]);

export default function MunicipalityPlaceCoverageStrip(props: {
  province: string;
  municipality: string;
  ward?: string | null;
  wardReadinessLabel?: string | null;
  knownWardCount?: number | null;
  evidenceBackedWardCount?: number | null;
}) {
  const {
    province,
    municipality,
    ward = null,
    wardReadinessLabel = null,
    knownWardCount = null,
    evidenceBackedWardCount = null,
  } = props;
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    async function parseJson<T>(response: Response): Promise<T | null> {
      if (!response.ok) {
        return null;
      }

      return (await response.json()) as T;
    }

    async function load() {
      setState({ status: "loading" });
      const params = new URLSearchParams({ province, municipality });
      if (ward) {
        params.set("ward", ward);
      }

      try {
        const requests: Promise<Response>[] = [
          fetch(`/api/analytics/place-profile?${params.toString()}`, { cache: "no-store" }),
          fetch(`/api/analytics/place-election-history?${params.toString()}`, {
            cache: "no-store",
          }),
        ];

        if (ward) {
          requests.push(fetch(`/api/analytics/ward-profile?${params.toString()}`, { cache: "no-store" }));
        }

        const responses = await Promise.all(requests);

        setState({
          status: "loaded",
          placeProfile: await parseJson<PlaceProfileResponse>(responses[0]),
          electionHistory: await parseJson<ElectionHistoryResponse>(responses[1]),
          wardProfile: ward
            ? await parseJson<WardProfileResponse>(responses[2])
            : null,
        });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load municipality place coverage",
        });
      }
    }

    void load();
  }, [municipality, province, ward]);

  if (state.status === "loading") {
    return <p className="text-sm text-slate-500">Loading place-intelligence coverage...</p>;
  }

  if (state.status === "error") {
    return <p className="text-sm text-slate-500">{state.message}</p>;
  }

  const hasDemographics = Boolean(state.placeProfile?.demographics);
  const hasElection = Boolean(state.electionHistory && state.electionHistory.rows.length > 0);
  const coalitionSensitive = !ward && COALITION_SENSITIVE_MUNICIPALITIES.has(municipality);
  const hasWardPolitical = Boolean(
    ward &&
      state.wardProfile &&
      (state.wardProfile.summary.hasCouncillor || state.wardProfile.summary.hasElectionHistory)
  );

  const items = [
    {
      label: "Profile",
      value: hasDemographics ? "Loaded" : "Partial",
    },
    {
      label: "Politics",
      value: hasElection ? "Loaded" : coalitionSensitive ? "Complex" : "Partial",
    },
    {
      label: ward ? "Ward politics" : "Ward readiness",
      value: ward ? (hasWardPolitical ? "Verified" : "Partial") : wardReadinessLabel ?? "Unknown",
    },
    {
      label: ward ? "Ward-backed" : "Wards backed",
      value:
        knownWardCount !== null && evidenceBackedWardCount !== null
          ? `${evidenceBackedWardCount}/${knownWardCount}`
          : "Unknown",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        Coverage Snapshot
      </p>
      <p className="mt-2 text-sm font-medium text-slate-700">
        How much place, political, and ward context is already loaded for this local view.
      </p>
      {coalitionSensitive && !hasElection ? (
        <p className="mt-2 text-xs text-slate-500">
          Political coverage is marked complex where a single-party municipality winner would be misleading.
        </p>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">{item.value}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
