"use client";

import { useEffect, useState } from "react";

import {
  ElectionHistoryResponse,
  HistoricalInfrastructureResponse,
  PlaceContextResponse,
  PlaceProfileResponse,
} from "@/lib/analytics/types";

type State =
  | { status: "loading" }
  | {
      status: "loaded";
      placeProfile: PlaceProfileResponse | null;
      placeContext: PlaceContextResponse | null;
      electionHistory: ElectionHistoryResponse | null;
      infrastructureHistory: HistoricalInfrastructureResponse | null;
    }
  | { status: "error"; message: string };

export default function ProvincePlaceCoverageStrip(props: {
  province: string;
}) {
  const { province } = props;
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
      const params = new URLSearchParams({ province });

      try {
        const [
          profileResponse,
          contextResponse,
          electionResponse,
          historyResponse,
        ] = await Promise.all([
          fetch(`/api/analytics/place-profile?${params.toString()}`, {
            cache: "no-store",
          }),
          fetch(`/api/analytics/place-context?${params.toString()}`, {
            cache: "no-store",
          }),
          fetch(`/api/analytics/place-election-history?${params.toString()}`, {
            cache: "no-store",
          }),
          fetch(
            `/api/analytics/place-infrastructure-history?${params.toString()}`,
            {
              cache: "no-store",
            },
          ),
        ]);

        setState({
          status: "loaded",
          placeProfile: await parseJson<PlaceProfileResponse>(profileResponse),
          placeContext: await parseJson<PlaceContextResponse>(contextResponse),
          electionHistory:
            await parseJson<ElectionHistoryResponse>(electionResponse),
          infrastructureHistory:
            await parseJson<HistoricalInfrastructureResponse>(historyResponse),
        });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load province place coverage",
        });
      }
    }

    void load();
  }, [province]);

  if (state.status === "loading") {
    return (
      <p className="text-sm text-slate-500">
        Loading province place-intelligence coverage...
      </p>
    );
  }

  if (state.status === "error") {
    return <p className="text-sm text-slate-500">{state.message}</p>;
  }

  const hasProfile = Boolean(state.placeProfile?.demographics);
  const hasContext = Boolean(
    state.placeContext &&
    (state.placeContext.wikipediaDescription ||
      state.placeContext.wikipediaExtract ||
      state.placeContext.storyAngles.length > 0),
  );
  const hasElection = Boolean(
    state.electionHistory && state.electionHistory.rows.length > 0,
  );
  const historyCount = state.infrastructureHistory?.rows.length ?? 0;
  const knownWards = state.placeContext?.knownWardCount ?? 0;
  const evidenceBackedWards = state.placeContext?.evidenceBackedWardCount ?? 0;

  const items = [
    {
      label: "Profile",
      value: hasProfile ? "Loaded" : "Partial",
    },
    {
      label: "Politics",
      value: hasElection ? "Loaded" : "Partial",
    },
    {
      label: "Context",
      value: hasContext ? "Loaded" : "Partial",
    },
    {
      label: "History",
      value: historyCount > 0 ? String(historyCount) : "0",
    },
    {
      label: "Known wards",
      value: String(knownWards),
    },
    {
      label: "Evidence-backed wards",
      value: String(evidenceBackedWards),
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        Coverage Snapshot
      </p>
      <p className="mt-2 text-sm font-medium text-slate-700">
        How much place, political, and ward-backed context is already loaded for
        this province.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
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
