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
        const response = await fetch(
          `/api/analytics/place-election-history?${params.toString()}`,
          {
            cache: "no-store",
          },
        );
        if (!response.ok) {
          throw new Error(`request failed with status ${response.status}`);
        }
        const data = (await response.json()) as ElectionHistoryResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load election history",
        });
      }
    }

    void load();
  }, [municipality, province, ward]);

  if (state.status === "loading") {
    return (
      <p className="text-sm font-bold tracking-widest uppercase text-slate-500 animate-pulse">Loading election history...</p>
    );
  }

  if (state.status === "error") {
    return <p className="text-sm font-bold tracking-widest uppercase text-red-500">{state.message}</p>;
  }

  if ((state.data.rows || []).length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <th className="px-3 py-3">Year</th>
            <th className="px-3 py-3">Type</th>
            <th className="px-3 py-3">Party</th>
            <th className="px-3 py-3">Candidate</th>
            <th className="px-3 py-3">Vote Share</th>
            <th className="px-3 py-3">Turnout</th>
            <th className="px-3 py-3 text-emerald-400">Winner</th>
          </tr>
        </thead>
        <tbody>
          {state.data.rows.slice(0, 12).map((row, index) => (
            <tr
              key={`${row.electionYear}-${row.partyName}-${index}`}
              className="border-b border-slate-800 text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <td className="px-3 py-3 font-medium text-white">{row.electionYear}</td>
              <td className="px-3 py-3 text-slate-400 text-xs font-bold uppercase tracking-widest">{row.electionType}</td>
              <td className="px-3 py-3">{row.partyName}</td>
              <td className="px-3 py-3">{row.candidateName ?? "N/A"}</td>
              <td className="px-3 py-3 text-blue-400 font-bold">{row.voteShare ?? "N/A"}</td>
              <td className="px-3 py-3 text-slate-400">{row.turnout ?? "N/A"}</td>
              <td className="px-3 py-3">
                 {row.winnerFlag ? (
                   <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase rounded border border-emerald-500/20">Yes</span>
                 ) : (
                   <span className="px-2 py-1 bg-slate-800 text-slate-500 text-xs font-black uppercase rounded">No</span>
                 )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
