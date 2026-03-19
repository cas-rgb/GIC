"use client";

import { useEffect, useState } from "react";
import { Vote, Building2, MapPin } from "lucide-react";

import { PlaceContextResponse, ElectionHistoryResponse } from "@/lib/analytics/types";

type State =
  | { status: "loading" }
  | { status: "loaded"; data: PlaceContextResponse; elections: ElectionHistoryResponse | null }
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
        const [contextResponse, electionResponse] = await Promise.all([
          fetch(`/api/analytics/place-context?${params.toString()}`, { cache: "no-store" }),
          fetch(`/api/analytics/place-election-history?${params.toString()}`, { cache: "no-store" })
        ]);
        
        if (!contextResponse.ok) {
          throw new Error(`Context request failed with status ${contextResponse.status}`);
        }
        
        const data = (await contextResponse.json()) as PlaceContextResponse;
        
        let elections = null;
        if (electionResponse.ok) {
          elections = (await electionResponse.json()) as ElectionHistoryResponse;
        }

        setState({ status: "loaded", data, elections });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load demographic map context",
        });
      }
    }

    void load();
  }, [municipality, province]);

  if (state.status === "loading") {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-gic-premium animate-pulse">
        <div className="h-4 w-32 bg-slate-800 rounded mb-4" />
        <div className="h-16 w-full bg-slate-800 rounded" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-2xl border border-rose-900/30 bg-slate-900 p-6 shadow-gic-premium text-rose-500">
        <p className="text-sm font-bold">{state.message}</p>
      </div>
    );
  }

  const { data, elections } = state;

  // Find the winning party in the most recent election
  let winningParty = null;
  let victoryMargin = null;
  let electionYear = null;

  if (elections && elections.rows && elections.rows.length > 0) {
    const latestYear = elections.rows[0].electionYear;
    electionYear = latestYear;
    const latestResults = elections.rows.filter(r => r.electionYear === latestYear);
    
    // Sort by vote share
    latestResults.sort((a, b) => (b.voteShare ?? 0) - (a.voteShare ?? 0));
    
    if (latestResults.length > 0) {
      winningParty = latestResults[0].partyName;
      if (latestResults.length > 1 && latestResults[0].voteShare && latestResults[1].voteShare) {
        victoryMargin = (latestResults[0].voteShare - latestResults[1].voteShare).toFixed(1);
      }
    }
  }

  const locationTitle = data.wikipediaTitle ?? municipality ?? province;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-gic-premium space-y-6">
      
      {/* Header section with Political Overlay */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-start border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <MapPin className="h-4 w-4 text-sky-400" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
               Demographic Baseline
             </p>
          </div>
          <h3 className="text-2xl font-display font-bold text-white">
            {locationTitle}
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-400">
            {municipality ?? province} Geography
            {data.knownWardCount > 0
              ? ` · ${data.knownWardCount} active wards · ${data.evidenceBackedWardCount} traced locally`
              : ""}
          </p>
        </div>

        {/* Electoral Context Badge */}
        {winningParty && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-3 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gic-gold">
              <Vote className="h-3.5 w-3.5" />
              Political Context ({electionYear})
            </div>
            <p className="text-sm font-bold text-white">
               Ruling Bloc: <span className="text-emerald-400">{winningParty}</span>
            </p>
            {victoryMargin && (
              <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 mt-1">
                Victory Margin: {victoryMargin}%
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {data.wikipediaDescription ? (
          <p className="text-sm font-bold leading-6 text-slate-300 italic border-l-2 border-sky-500/50 pl-3">
            {data.wikipediaDescription}
          </p>
        ) : null}

        {data.wikipediaExtract ? (
          <p className="text-sm leading-relaxed text-slate-400">
            {data.wikipediaExtract}
          </p>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 border-dashed bg-slate-900/50 px-4 py-3 text-sm text-slate-500">
            <Building2 className="h-4 w-4" />
            Geography context is sparse for this regional isolate. Pending data integration.
          </div>
        )}
      </div>

      {(data.storyAngles || []).length > 0 ? (
        <div className="pt-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 block">
            Pre-computed Structural Vulnerabilities
          </p>
          <div className="flex flex-wrap gap-2">
            {(data.storyAngles || []).map((angle) => (
               <span
                 key={angle}
                 className="rounded-full border border-sky-900/30 bg-sky-950/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-sky-400"
               >
                 {angle}
               </span>
             ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
