"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Database, RefreshCw } from "lucide-react";

import { ServicePressureResponse } from "@/lib/analytics/types";

interface ServicePressurePanelProps {
  province?: string;
  days?: number;
  serviceDomain?: string | null;
}

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "loaded"; data: ServicePressureResponse }
  | { status: "error"; message: string };

function summarizeSeries(data: ServicePressureResponse) {
  const grouped = new Map<
    string,
    {
      serviceDomain: string;
      pressureCaseCount: number;
      highSeverityCount: number;
      protestCount: number;
      responseCount: number;
      confidenceTotal: number;
      points: number;
    }
  >();

  for (const point of data.series) {
    const current = grouped.get(point.serviceDomain) ?? {
      serviceDomain: point.serviceDomain,
      pressureCaseCount: 0,
      highSeverityCount: 0,
      protestCount: 0,
      responseCount: 0,
      confidenceTotal: 0,
      points: 0,
    };

    current.pressureCaseCount += point.pressureCaseCount;
    current.highSeverityCount += point.highSeverityCount;
    current.protestCount += point.protestCount;
    current.responseCount += point.responseCount;
    current.confidenceTotal += point.confidence;
    current.points += 1;
    grouped.set(point.serviceDomain, current);
  }

  const rows = Array.from(grouped.values())
    .map((row) => ({
      ...row,
      confidence:
        row.points > 0
          ? Number((row.confidenceTotal / row.points).toFixed(2))
          : 0,
    }))
    .sort((left, right) => right.pressureCaseCount - left.pressureCaseCount);

  const maxPressure = rows[0]?.pressureCaseCount ?? 1;

  return {
    rows,
    maxPressure,
  };
}

function summarizeTrend(data: ServicePressureResponse) {
  const grouped = new Map<string, number>();

  for (const point of data.series) {
    grouped.set(
      point.date,
      (grouped.get(point.date) ?? 0) + point.pressureCaseCount,
    );
  }

  return Array.from(grouped.entries())
    .map(([date, pressureCaseCount]) => ({ date, pressureCaseCount }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function summarizeTopicTrends(data: ServicePressureResponse) {
  const allDates = Array.from(
    new Set((data.series || []).map((point) => point.date)),
  ).sort((left, right) => left.localeCompare(right));
  const grouped = new Map<string, Map<string, number>>();

  for (const point of data.series) {
    const current =
      grouped.get(point.serviceDomain) ?? new Map<string, number>();
    current.set(
      point.date,
      (current.get(point.date) ?? 0) + point.pressureCaseCount,
    );
    grouped.set(point.serviceDomain, current);
  }

  const rows = Array.from(grouped.entries())
    .map(([serviceDomain, values]) => ({
      serviceDomain,
      total: Array.from(values.values()).reduce((sum, value) => sum + value, 0),
      points: allDates.map((date) => ({
        date,
        pressureCaseCount: values.get(date) ?? 0,
      })),
    }))
    .sort((left, right) => right.total - left.total)
    .slice(0, 4);

  return {
    dates: allDates,
    rows,
    maxValue: Math.max(
      ...rows.flatMap((row) =>
        row.points.map((point) => point.pressureCaseCount),
      ),
      1,
    ),
  };
}

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

export default function ServicePressurePanel({
  province = "Gauteng",
  days = 30,
  serviceDomain = null,
}: ServicePressurePanelProps) {
  const [state, setState] = useState<LoadState>({ status: "idle" });

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
        `/api/analytics/service-pressure?province=${encodeURIComponent(
          province,
        )}&days=${days}${serviceDomain ? `&serviceDomain=${encodeURIComponent(serviceDomain)}` : ""}`,
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

      const data = (await response.json()) as ServicePressureResponse;
      setState({ status: "loaded", data });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load service pressure",
      });
    }
  }

  useEffect(() => {
    void load();
  }, [province, days, serviceDomain]);

  const summary = useMemo(() => {
    if (state.status !== "loaded") {
      return { rows: [], maxPressure: 1 };
    }

    return summarizeSeries(state.data);
  }, [state]);

  const trend = useMemo(() => {
    if (state.status !== "loaded") {
      return [];
    }

    return summarizeTrend(state.data);
  }, [state]);

  const topicTrends = useMemo(() => {
    if (state.status !== "loaded") {
      return { dates: [], rows: [], maxValue: 1 };
    }

    return summarizeTopicTrends(state.data);
  }, [state]);

  if (state.status === "loading" || state.status === "idle") {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading governed pressure data...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-slate-900">
            Service pressure unavailable
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  if (state.status !== "loaded") {
    return null;
  }

  const { data } = state;
  const topDomain = summary.rows[0];
  const severityRate =
    data.totals.pressureCaseCount > 0
      ? Math.round(
          (data.totals.highSeverityCount / data.totals.pressureCaseCount) * 100,
        )
      : 0;
  const responseCoverage =
    data.totals.pressureCaseCount > 0
      ? Math.round(
          (data.totals.responseCount / data.totals.pressureCaseCount) * 100,
        )
      : 0;
  const protestShare =
    data.totals.pressureCaseCount > 0
      ? Math.round(
          (data.totals.protestCount / data.totals.pressureCaseCount) * 100,
        )
      : 0;
  const peakDay = trend.reduce<{
    date: string;
    pressureCaseCount: number;
  } | null>((current, point) => {
    if (!current || point.pressureCaseCount > current.pressureCaseCount) {
      return point;
    }

    return current;
  }, null);
  const maxTrendValue = Math.max(
    ...trend.map((point) => point.pressureCaseCount),
    1,
  );
  const lineColors = ["#0f172a", "#2563eb", "#d97706", "#dc2626"];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Province
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.province}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Concern Volume
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.totals.pressureCaseCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Top Concern Topic
          </p>
          <p className="mt-2 text-lg font-display font-bold text-slate-900">
            {topDomain?.serviceDomain || "No data"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {topDomain?.pressureCaseCount ?? 0} cases
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Response Coverage
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-emerald-600">
            {responseCoverage}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
                Issue Volume Over Time
              </h4>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Daily concern volume across the selected province window
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Peak Day
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {peakDay
                  ? `${peakDay.date} · ${peakDay.pressureCaseCount}`
                  : "No data"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex h-48 items-end gap-2">
              {trend.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-500">
                  No trend rows available yet.
                </div>
              ) : (
                trend.map((point) => (
                  <div
                    key={point.date}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-xl bg-slate-900"
                        style={{
                          height: `${Math.max(10, Math.round((point.pressureCaseCount / maxTrendValue) * 100))}%`,
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                      {point.date.slice(5)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
              Province Risk Readout
            </h4>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Severity, protest pressure, and response posture
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">
                High Severity Rate
              </p>
              <p className="mt-2 text-2xl font-display font-bold text-rose-600">
                {severityRate}%
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                Protest Share
              </p>
              <p className="mt-2 text-2xl font-display font-bold text-amber-600">
                {protestShare}%
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                Responses Logged
              </p>
              <p className="mt-2 text-2xl font-display font-bold text-emerald-600">
                {data.totals.responseCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
              Top Topic Trends
            </h4>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              How the top concern topics are changing over time
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          {topicTrends.rows.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm font-medium text-slate-500">
              No topic trend rows available yet.
            </div>
          ) : (
            <div className="space-y-4">
              <svg viewBox="0 0 640 240" className="h-56 w-full">
                {[0, 1, 2, 3].map((step) => {
                  const y = 20 + step * 55;
                  return (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="640"
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  );
                })}
                {topicTrends.rows.map((row, index) => (
                  <polyline
                    key={row.serviceDomain}
                    fill="none"
                    stroke={lineColors[index % lineColors.length]}
                    strokeWidth="4"
                    points={buildPolylinePoints(
                      row.points.map((point) => point.pressureCaseCount),
                      640,
                      220,
                      topicTrends.maxValue,
                    )}
                  />
                ))}
              </svg>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {topicTrends.rows.map((row, index) => (
                  <div
                    key={row.serviceDomain}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            lineColors[index % lineColors.length],
                        }}
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {row.serviceDomain}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                          {row.total} total concern volume
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {row.points[row.points.length - 1]?.pressureCaseCount ??
                        0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
              Top Issue Categories
            </h4>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Ranked issue categories by total province concern volume
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Database className="h-3.5 w-3.5" />
            {data.trace.table}
          </div>
        </div>

        <div className="space-y-3">
          {summary.rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm font-bold text-slate-500">
                No governed service pressure rows yet.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Run the v2 ingestion and worker flow, then refresh this page.
              </p>
            </div>
          ) : (
            summary.rows.map((row) => {
              const width = Math.max(
                8,
                Math.round((row.pressureCaseCount / summary.maxPressure) * 100),
              );

              return (
                <div
                  key={row.serviceDomain}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {row.serviceDomain}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Confidence {row.confidence}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-display font-bold text-slate-900">
                        {row.pressureCaseCount}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Concern volume
                      </p>
                    </div>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-rose-50 p-3">
                      <p className="text-lg font-bold text-rose-600">
                        {row.highSeverityCount}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-400">
                        High severity
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3">
                      <p className="text-lg font-bold text-amber-600">
                        {row.protestCount}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">
                        Protests
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-lg font-bold text-emerald-600">
                        {row.responseCount}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                        Responses
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
