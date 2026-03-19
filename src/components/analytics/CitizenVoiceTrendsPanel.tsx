"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { CitizenVoiceTrendsResponse } from "@/lib/analytics/types";

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: CitizenVoiceTrendsResponse }
  | { status: "error"; message: string };

interface CitizenVoiceTrendsPanelProps {
  province?: string;
  municipality?: string | null;
  serviceDomain?: string | null;
  days?: number;
  selectedIssueFamily?: string | null;
  onSelectIssueFamily?: (issueFamily: string) => void;
}

const SERIES_COLORS = ["#0f172a", "#2563eb", "#d97706", "#dc2626"];

function buildPolylinePoints(
  values: number[],
  width: number,
  height: number,
  maxValue: number,
) {
  if (values.length === 0) {
    return "";
  }

  if (values.length === 1) {
    return `0,${height} ${width},${height - Math.round((values[0] / maxValue) * height)}`;
  }

  return values
    .map((value, index) => {
      const x = Math.round((index / (values.length - 1)) * width);
      const y = height - Math.round((value / maxValue) * height);
      return `${x},${y}`;
    })
    .join(" ");
}

export default function CitizenVoiceTrendsPanel({
  province,
  municipality,
  serviceDomain,
  days = 30,
  selectedIssueFamily = null,
  onSelectIssueFamily,
}: CitizenVoiceTrendsPanelProps) {
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

    async function load() {
      setState({ status: "loading" });

      const query = new URLSearchParams();
      query.set("days", String(days));
      if (province) query.set("province", province);
      if (municipality && municipality !== "All Municipalities") query.set("municipality", municipality);
      if (serviceDomain && serviceDomain !== "all") query.set("serviceDomain", serviceDomain);

      try {
        const response = await fetch(
          `/api/analytics/citizen-voice-trends?${query.toString()}`,
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

        const data = (await response.json()) as CitizenVoiceTrendsResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load citizen voice trends",
        });
      }
    }

    void load();
  }, [days, province, municipality, serviceDomain]);

  const topicTrend = useMemo(() => {
    if (state.status !== "loaded") {
      return { dates: [], series: [], maxValue: 1 };
    }

    const { data } = state;
    const dates = Array.from(
      new Set((data.issueTrend || []).map((row) => row.date)),
    ).sort((left, right) => left.localeCompare(right));
    const grouped = new Map<string, Map<string, number>>();

    for (const row of data.issueTrend) {
      const current = grouped.get(row.issueFamily) ?? new Map<string, number>();
      current.set(row.date, row.mentionCount);
      grouped.set(row.issueFamily, current);
    }

    const series = data.issues.slice(0, 4).map((issue) => ({
      issueFamily: issue.issueFamily,
      points: dates.map(
        (date) => grouped.get(issue.issueFamily)?.get(date) ?? 0,
      ),
      mentionCount: issue.mentionCount,
      share:
        (data.summary?.mentionCount ?? 0) > 0
          ? Math.round((issue.mentionCount / (data.summary?.mentionCount ?? 1)) * 100)
          : 0,
    }));

    return {
      dates,
      series,
      maxValue: Math.max(...series.flatMap((row) => row.points), 1),
    };
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading citizen voice trends...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-center">
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
        <div className="gic-card bg-slate-900 border-slate-800 shadow-gic-premium px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Mentions
          </p>
          <p className="mt-1 text-xl font-display font-bold text-white">
            {data.summary?.mentionCount ?? 0}
          </p>
        </div>
        <div className="gic-card bg-slate-900 border-slate-800 shadow-gic-premium px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Documents
          </p>
          <p className="mt-1 text-xl font-display font-bold text-white">
            {data.summary?.documentCount ?? 0}
          </p>
        </div>
        <div className="gic-card bg-slate-900 border-slate-800 shadow-gic-premium px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            Avg Negative Share
          </p>
          <p className="mt-1 text-xl font-display font-bold text-white">
            {Math.round((data.summary?.avgNegativeShare ?? 0) * 100)}%
          </p>
        </div>
        <div className="gic-card bg-slate-900 border-slate-800 shadow-gic-premium px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Dominant Issue
          </p>
          <p className="mt-1 text-sm font-display font-bold text-white">
            {data.summary?.dominantIssueFamily ?? "No data"}
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.02fr]">
        <div className="gic-card bg-slate-900 border-slate-800 shadow-gic-premium px-4 py-4">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-white">
            Topic Velocity
          </p>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
              {topicTrend.series.length === 0 ? (
                <div className="flex h-52 items-center justify-center text-sm font-medium text-slate-500">
                  No topic velocity rows available yet.
                </div>
              ) : (
                <svg viewBox="0 0 640 220" className="h-56 w-full">
                  {[0, 1, 2, 3].map((step) => {
                    const y = 20 + step * 50;
                    return (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="640"
                        y2={y}
                        stroke="#334155"
                        strokeWidth="1"
                      />
                    );
                  })}
                  {topicTrend.series.map((series, index) => (
                    <polyline
                      key={series.issueFamily}
                      fill="none"
                      stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                      strokeWidth="4"
                      points={buildPolylinePoints(
                        series.points,
                        640,
                        200,
                        topicTrend.maxValue,
                      )}
                    />
                  ))}
                </svg>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {topicTrend.series.map((series, index) => (
                <div
                  key={series.issueFamily}
                  className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          SERIES_COLORS[index % SERIES_COLORS.length],
                      }}
                    />
                    <div>
                      <p className="text-sm font-bold text-white">
                        {series.issueFamily}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                        {series.share}% share of voice
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {series.mentionCount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="gic-card bg-slate-900 border-slate-800 shadow-gic-premium px-4 py-4">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-white">
            Topic Dominance
          </p>
          <div className="mt-4 grid gap-3">
            {data.issues.slice(0, 4).map((row, index) => {
              const share =
                (data.summary?.mentionCount ?? 0) > 0
                  ? Math.round(
                      (row.mentionCount / (data.summary?.mentionCount ?? 1)) * 100,
                    )
                  : 0;
              const tone =
                index === 0
                  ? "from-slate-900 to-slate-700"
                  : index === 1
                    ? "from-blue-700 to-blue-500"
                    : index === 2
                      ? "from-amber-600 to-amber-400"
                      : "from-rose-600 to-rose-400";

              return (
                <button
                  key={`${row.issueFamily}-dominance`}
                  type="button"
                  onClick={() => onSelectIssueFamily?.(row.issueFamily)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                    selectedIssueFamily === row.issueFamily
                      ? "border-blue-500/50 bg-blue-900/20"
                      : "border-slate-800 bg-slate-800/50 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {row.issueFamily}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {row.mentionCount} mentions | {row.documentCount} docs
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-white">
                        {share}%
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        share of voice
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${tone}`}
                      style={{ width: `${Math.max(share, 8)}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em]">
                    <span className="text-rose-600">
                      {Math.round(row.negativeShare * 100)}% negative
                    </span>
                    <span className="text-blue-600">
                      {row.avgConfidence} confidence
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="gic-card bg-slate-900 border-slate-800 shadow-gic-premium px-4 py-4">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-white">
            Share Of Voice
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-slate-800 bg-slate-800/50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <p>Issue</p>
              <p className="text-right">Mentions</p>
              <p className="text-right">Share</p>
              <p className="text-right">Negative</p>
              <p className="text-right">Confidence</p>
            </div>
            <div className="divide-y divide-slate-800">
              {(data.issues || []).map((row) => (
                <button
                  key={row.issueFamily}
                  type="button"
                  onClick={() => onSelectIssueFamily?.(row.issueFamily)}
                  className={`grid w-full grid-cols-1 gap-3 px-4 py-3 text-left lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] lg:items-start transition-colors ${
                    selectedIssueFamily === row.issueFamily
                      ? "bg-blue-900/20"
                      : "bg-transparent hover:bg-slate-800/30"
                  }`}
                >
                  <p className="text-sm font-bold text-white">
                    {row.issueFamily}
                  </p>
                  <p className="text-right text-sm font-bold text-white">
                    {row.mentionCount}
                  </p>
                  <p className="text-right text-sm font-bold text-white">
                    {(data.summary?.mentionCount ?? 0) > 0
                      ? Math.round(
                          (row.mentionCount / (data.summary?.mentionCount ?? 1)) * 100,
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-right text-sm font-bold text-rose-700">
                    {Math.round(row.negativeShare * 100)}%
                  </p>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-700">
                      {row.avgConfidence}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {row.documentCount} docs
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
