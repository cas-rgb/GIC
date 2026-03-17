"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, MessageSquareQuote, RefreshCw, Users } from "lucide-react";

import {
  LeadershipSentimentLeaderRow,
  MunicipalLeadershipSentimentResponse,
} from "@/lib/analytics/types";

interface MunicipalityLeadershipSentimentPanelProps {
  province: string;
  municipality: string;
  days?: number;
  selectedLeaderName?: string | null;
  onSelectLeader?: (leader: LeadershipSentimentLeaderRow) => void;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: MunicipalLeadershipSentimentResponse }
  | { status: "error"; message: string };

export default function MunicipalityLeadershipSentimentPanel({
  province,
  municipality,
  days = 30,
  selectedLeaderName,
  onSelectLeader,
}: MunicipalityLeadershipSentimentPanelProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    async function parseError(response: Response, fallback: string) {
      try {
        const body = (await response.json()) as { error?: string };
        return body.error || fallback;
      } catch {
        return fallback;
      }
    }

    async function load(): Promise<void> {
      setState({ status: "loading" });

      try {
        const response = await fetch(
          `/api/analytics/municipal-leadership-sentiment?province=${encodeURIComponent(
            province
          )}&municipality=${encodeURIComponent(municipality)}&days=${days}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            await parseError(
              response,
              `request failed with status ${response.status}`
            )
          );
        }

        const data =
          (await response.json()) as MunicipalLeadershipSentimentResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load municipal leadership sentiment",
        });
      }
    }

    void load();
  }, [province, municipality, days]);

  useEffect(() => {
    if (
      state.status === "loaded" &&
      !selectedLeaderName &&
      state.data.leaders.length > 0 &&
      onSelectLeader
    ) {
      onSelectLeader(state.data.leaders[0]);
    }
  }, [onSelectLeader, selectedLeaderName, state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading local political PR view...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[280px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  const { data } = state;

  if (data.leaders.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <p className="text-sm font-bold text-slate-500">
            No governed mayor or municipal-office mentions were detected for{" "}
            {municipality} in this window.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            This PR layer only materializes when governed documents explicitly mention a
            verified local political leader alias.
          </p>
        </div>
        {data.caveats.map((caveat) => (
          <p key={caveat} className="text-sm font-medium text-slate-500">
            {caveat}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Municipality
          </p>
          <p className="mt-2 text-xl font-display font-bold text-slate-900">
            {municipality}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Leaders In View
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.leaders.length}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Dominant Exposure
          </p>
          <p className="mt-2 text-lg font-display font-bold text-slate-900">
            {data.leaders[0]?.leaderName ?? "Unavailable"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.leaders.map((leader: LeadershipSentimentLeaderRow) => (
          <button
            key={leader.leaderName}
            type="button"
            onClick={() => onSelectLeader?.(leader)}
            className={`w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
              selectedLeaderName === leader.leaderName
                ? "border-blue-300 ring-2 ring-blue-100"
                : "border-slate-100 hover:border-blue-200"
            }`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-blue-600" />
                  <p className="text-base font-bold text-slate-900">
                    {leader.leaderName}
                  </p>
                </div>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {leader.office}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:min-w-[320px]">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-sm font-bold text-slate-900">
                    {leader.sentimentScore}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Score
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-center">
                  <p className="text-sm font-bold text-blue-700">
                    {leader.mentionCount}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">
                    Mentions
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-center">
                  <p className="text-sm font-bold text-emerald-700">
                    {Math.round(leader.confidence * 100)}%
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
                    Confidence
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 md:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Sentiment Split
                </p>
                <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-white">
                  <div
                    className="bg-emerald-500"
                    style={{
                      width: `${leader.mentionCount > 0 ? (leader.positiveMentionCount / leader.mentionCount) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-slate-400"
                    style={{
                      width: `${leader.mentionCount > 0 ? (leader.neutralMentionCount / leader.mentionCount) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-rose-500"
                    style={{
                      width: `${leader.mentionCount > 0 ? (leader.negativeMentionCount / leader.mentionCount) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700">
                    {leader.positiveMentionCount} positive
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-700">
                    {leader.neutralMentionCount} neutral
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-rose-700">
                    {leader.negativeMentionCount} negative
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote className="h-4 w-4 text-blue-600" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Linked Issues
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {leader.linkedIssueBreakdown.map((issue) => (
                    <span
                      key={`${leader.leaderName}-${issue.topic}`}
                      className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500"
                    >
                      {issue.topic} {issue.mentionCount}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Narrative Drivers
                </p>
                <div className="mt-3 space-y-2">
                  {leader.topNarratives.map((narrative) => (
                    <p key={narrative} className="text-sm font-medium text-slate-700">
                      {narrative}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 p-4">
        {data.caveats.map((caveat) => (
          <p key={caveat} className="text-sm font-medium text-slate-500">
            {caveat}
          </p>
        ))}
      </div>
    </div>
  );
}
