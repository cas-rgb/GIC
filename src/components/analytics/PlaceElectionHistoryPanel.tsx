"use client";

import { useEffect, useState } from "react";

import { ElectionHistoryResponse } from "@/lib/analytics/types";

type State =
  | { status: "loading" }
  | { status: "loaded"; data: ElectionHistoryResponse }
  | { status: "error"; message: string };

export default function PlaceElectionHistoryPanel(props: {
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
        const response = await fetch(`/api/analytics/place-election-history?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`request failed with status ${response.status}`);
        }
        const data = (await response.json()) as ElectionHistoryResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to load election history",
        });
      }
    }

    void load();
  }, [municipality, province, ward]);

  if (state.status === "loading") {
    return <p className="text-sm text-slate-500">Loading election history...</p>;
  }

  if (state.status === "error") {
    return <p className="text-sm text-slate-500">{state.message}</p>;
  }

  if (state.data.rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No election history has been loaded for this geography yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <th className="px-2 py-2">Year</th>
            <th className="px-2 py-2">Type</th>
            <th className="px-2 py-2">Party</th>
            <th className="px-2 py-2">Candidate</th>
            <th className="px-2 py-2">Vote Share</th>
            <th className="px-2 py-2">Turnout</th>
            <th className="px-2 py-2">Winner</th>
          </tr>
        </thead>
        <tbody>
          {state.data.rows.slice(0, 12).map((row, index) => (
            <tr key={`${row.electionYear}-${row.partyName}-${index}`} className="border-b border-slate-50 text-slate-700">
              <td className="px-2 py-2 font-medium">{row.electionYear}</td>
              <td className="px-2 py-2">{row.electionType}</td>
              <td className="px-2 py-2">{row.partyName}</td>
              <td className="px-2 py-2">{row.candidateName ?? "N/A"}</td>
              <td className="px-2 py-2">{row.voteShare ?? "N/A"}</td>
              <td className="px-2 py-2">{row.turnout ?? "N/A"}</td>
              <td className="px-2 py-2">{row.winnerFlag ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
