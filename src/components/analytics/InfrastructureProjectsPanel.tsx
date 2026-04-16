"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeAlert,
  Database,
  Landmark,
  RefreshCw,
} from "lucide-react";

import {
  InfrastructureProjectGeographyRow,
  InfrastructureProjectsSummaryResponse,
  InfrastructureProjectSectorRow,
} from "@/lib/analytics/types";

interface InfrastructureProjectsPanelProps {
  province?: string | null;
  municipality?: string | null;
  serviceDomain?: string | null;
}

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "loaded"; data: InfrastructureProjectsSummaryResponse }
  | { status: "error"; message: string };

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "[ VALUATION PENDING ]";
  }
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function InfrastructureProjectsPanel({
  province,
  municipality,
  serviceDomain,
}: InfrastructureProjectsPanelProps) {
  const [state, setState] = useState<LoadState>({ status: "idle" });

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
        const params = new URLSearchParams();
        if (province && province !== "All Provinces") {
          params.set("province", province);
        }
        if (municipality && municipality !== "All Municipalities") {
          params.set("municipality", municipality);
        }
        if (serviceDomain && serviceDomain !== "all") {
          params.set("serviceDomain", serviceDomain);
        }

        const response = await fetch(
          `/api/analytics/infrastructure-projects-summary?${params.toString()}`,
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
          (await response.json()) as InfrastructureProjectsSummaryResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load infrastructure project data",
        });
      }
    }

    void load();
  }, [province, municipality, serviceDomain]);

  if (state.status === "idle" || state.status === "loading") {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 shadow-gic-premium">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin text-gic-blue" />
          Querying Municipal Money Infrastructure Baseline...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-rose-900/30 bg-slate-900 text-center shadow-gic-premium">
        <div>
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
          <p className="mt-3 text-sm font-black uppercase tracking-widest text-slate-200">
            Treasury Feed Unavailable
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
  const budgetCoverage =
    data.summary.screenedProjectCount > 0
      ? Math.round(
          (data.summary.projectsWithBudgetCount /
            data.summary.screenedProjectCount) *
            100
        )
      : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-sky-900/40 bg-sky-950/20 p-4">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 h-5 w-5 text-sky-500" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
              Treasury Extraction Alignment
            </p>
            <div className="mt-2 space-y-2">
              {(data.caveats || []).map((caveat: string) => (
                <p key={caveat} className="text-xs font-medium text-slate-300">
                  {caveat}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Scope
          </p>
          <p className="mt-1 text-xl font-display font-bold text-white">
            {municipality && municipality !== "All Municipalities"
              ? municipality
              : data.province ?? "All Provinces"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Snapshot {data.snapshotDate ?? "Unavailable"}
          </p>
        </div>
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Treasury Screened Projects
          </p>
          <p className="mt-1 text-xl font-display font-bold text-white">
            {data.summary.screenedProjectCount}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {data.summary.screenedOutProjectCount} screened out
          </p>
        </div>
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
            High Value Pipeline
          </p>
          <p className="mt-1 text-xl font-display font-bold text-white">
            {data.summary.highValueProjectCount}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/70">
            Budget coverage {budgetCoverage}%
          </p>
        </div>
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
            Known Capital Exposure
          </p>
          <p className="mt-1 text-lg font-display font-bold text-white">
            {formatCurrency(data.summary.totalKnownExpenditure)}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/70">
            Top pressure {data.summary.topSector ?? "Unavailable"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.03fr_1fr]">
        <div className="gic-card-premium space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.25em] text-white">
                Sector Execution Heatmap
              </h4>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Capital intensity across normalized service delivery lines
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Database className="h-3.5 w-3.5" />
              {data.trace.tables[0]}
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {data.sectorBreakdown
              .slice(0, 6)
              .map((row: InfrastructureProjectSectorRow) => {
                const width =
                  data.summary.screenedProjectCount > 0
                    ? Math.max(
                        8,
                        Math.round(
                          (row.projectCount /
                            data.summary.screenedProjectCount) *
                            100
                        )
                      )
                    : 8;

                return (
                  <div
                    key={row.normalizedSector}
                    className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {row.normalizedSector}
                        </p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80">
                          {row.highValueProjectCount} strategic
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display font-bold text-white">
                          {row.projectCount}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          Projects
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <span>
                        {row.projectsWithBudgetCount} transparent rows
                      </span>
                      <span className="text-white/80">{formatCurrency(row.totalKnownExpenditure)}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="gic-card-premium space-y-4 p-5">
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.25em] text-white">
              Geographic Spread
            </h4>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Localized execution metrics isolating capital bottlenecks
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-700/50">
            <div className="grid grid-cols-[1.3fr_0.8fr_0.9fr_1fr] gap-3 border-b border-slate-700/50 bg-slate-800/30 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <p>Node</p>
              <p className="text-right">Lines</p>
              <p className="text-right">Strategic</p>
              <p className="text-right">Spend</p>
            </div>
            <div className="divide-y divide-slate-700/50 bg-slate-800/20">
              {(data.geographyRows || []).map(
                (row: InfrastructureProjectGeographyRow) => (
                  <div
                    key={row.geography}
                    className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1fr] lg:items-center hover:bg-slate-700/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Landmark className="h-3 w-3 text-sky-400" />
                      <div>
                        <p className="text-xs font-bold text-white">
                          {row.geography}
                        </p>
                        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                          Lead: {row.dominantSector ?? "N/A"}
                        </p>
                      </div>
                    </div>
                    <p className="text-right text-xs font-bold text-white">
                      {row.projectCount}
                    </p>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">
                        {row.highValueProjectCount} 
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">
                        {Math.round((row.projectsWithBudgetCount / Math.max(row.projectCount, 1)) * 100)}% trans
                      </p>
                    </div>
                    <p className="text-right text-[10px] font-bold text-white">
                      {formatCurrency(row.totalKnownExpenditure)}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
