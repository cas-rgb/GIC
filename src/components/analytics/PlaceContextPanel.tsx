"use client";

import { useEffect, useState } from "react";

import { PlaceContextResponse } from "@/lib/analytics/types";

type State =
  | { status: "loading" }
  | { status: "loaded"; data: PlaceContextResponse }
  | { status: "error"; message: string };

export default function PlaceContextPanel(props: {
  province: string;
  municipality?: string | null;
}) {
  const { province, municipality = null } = props;
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    async function load() {
      setState({ status: "loading" });
      const params = new URLSearchParams({ province });
      if (municipality) {
        params.set("municipality", municipality);
      }

      try {
        const response = await fetch(`/api/analytics/place-context?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`request failed with status ${response.status}`);
        }
        const data = (await response.json()) as PlaceContextResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to load place context",
        });
      }
    }

    void load();
  }, [municipality, province]);

  if (state.status === "loading") {
    return <p className="text-sm text-slate-500">Loading place context...</p>;
  }

  if (state.status === "error") {
    return <p className="text-sm text-slate-500">{state.message}</p>;
  }

  const data = state.data;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Context Scope
        </p>
        <p className="mt-2 text-sm text-slate-700">
          {municipality ?? province}
          {data.knownWardCount > 0
            ? ` · ${data.knownWardCount} known wards · ${data.evidenceBackedWardCount} evidence-backed`
            : ""}
        </p>
      </div>
      {data.wikipediaTitle || data.wikipediaDescription ? (
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {data.wikipediaTitle ?? municipality ?? province}
          </p>
          {data.wikipediaDescription ? (
            <p className="mt-1 text-sm text-slate-600">{data.wikipediaDescription}</p>
          ) : null}
        </div>
      ) : null}
      {data.wikipediaExtract ? (
        <p className="text-sm leading-6 text-slate-700">{data.wikipediaExtract}</p>
      ) : (
        <p className="text-sm text-slate-500">
          Contextual narrative enrichment is still sparse for this place.
        </p>
      )}
      {data.storyAngles.length > 0 ? (
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Story Angles</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.storyAngles.map((angle) => (
              <span key={angle} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                {angle}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
