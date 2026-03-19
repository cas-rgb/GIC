"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { ComplaintClustersResponse } from "@/lib/analytics/types";

interface ComplaintClustersPanelProps {
  province?: string;
  municipality?: string | null;
  serviceDomain?: string | null;
  days?: number;
  selectedIssueFamily?: string | null;
  onSelectIssueFamily?: (issueFamily: string) => void;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ComplaintClustersResponse }
  | { status: "error"; message: string };

export default function ComplaintClustersPanel({
  province,
  days = 30,
  selectedIssueFamily = null,
  onSelectIssueFamily,
}: ComplaintClustersPanelProps) {
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
      const params = new URLSearchParams({ days: String(days) });
      if (province) {
        params.set("province", province);
      }

      try {
        const response = await fetch(
          `/api/analytics/complaint-clusters?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            await parseError(
              response,
              `request failed with status ${response.status}`,
            ),
          );
        }

        const data = (await response.json()) as ComplaintClustersResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load complaint clusters",
        });
      }
    }

    void load();
  }, [province, days]);

  useEffect(() => {
    if (
      state.status === "loaded" &&
      !selectedIssueFamily &&
      (state.data.rows || []).length > 0 &&
      onSelectIssueFamily
    ) {
      onSelectIssueFamily(state.data.rows[0].issueFamily);
    }
  }, [onSelectIssueFamily, selectedIssueFamily, state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading complaint clusters...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-center">
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Issue Families
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.summary?.issueCount ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">
            Total Mentions
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.summary?.totalMentions ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">
            Dominant Issue
          </p>
          <p className="mt-1 text-sm font-display font-bold text-slate-900">
            {data.summary?.dominantIssueFamily ?? "Unavailable"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-500">
            Widest Spread
          </p>
          <p className="mt-1 text-sm font-display font-bold text-slate-900">
            {data.summary?.widestSpreadIssueFamily ?? "Unavailable"}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        {(data.rows || []).length === 0 ? (
          <div className="bg-slate-50 px-4 py-4 text-sm font-medium text-slate-500">
            No complaint clusters are available yet.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              <p>Issue Family</p>
              <p className="text-right">Mentions</p>
              <p className="text-right">Docs</p>
              <p className="text-right">Municipalities</p>
              <p className="text-right">Negative</p>
              <p className="text-right">Intensity</p>
              <p className="text-right">Score</p>
            </div>
            <div className="divide-y divide-slate-100">
              {(data.rows || []).map((row) => (
                <button
                  key={row.issueFamily}
                  type="button"
                  onClick={() => onSelectIssueFamily?.(row.issueFamily)}
                  className={`grid w-full grid-cols-1 gap-3 px-4 py-4 text-left transition-colors lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr_0.8fr_0.8fr_0.8fr] lg:items-start ${
                    selectedIssueFamily === row.issueFamily
                      ? "bg-blue-50"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {row.issueFamily}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      governed complaint cluster
                    </p>
                  </div>
                  <p className="text-right text-sm font-bold text-slate-900">
                    {row.mentionCount}
                  </p>
                  <p className="text-right text-sm font-bold text-slate-900">
                    {row.documentCount}
                  </p>
                  <p className="text-right text-sm font-bold text-slate-900">
                    {row.municipalityCount}
                  </p>
                  <p className="text-right text-sm font-bold text-rose-700">
                    {Math.round(row.avgNegativeShare * 100)}%
                  </p>
                  <p className="text-right text-sm font-bold text-blue-700">
                    {Math.round(row.intensityScore)}
                  </p>
                  <p className="text-right text-sm font-bold text-slate-900">
                    {row.avgSentimentScore}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
        {(data.caveats || []).map((caveat) => (
          <p key={caveat} className="text-sm font-medium text-slate-700">
            {caveat}
          </p>
        ))}
      </div>
    </div>
  );
}
