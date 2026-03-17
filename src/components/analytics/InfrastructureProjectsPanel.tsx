"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BadgeAlert, Database, Landmark, RefreshCw } from "lucide-react";

import {
  InfrastructureProjectGeographyRow,
  InfrastructureProjectsSummaryResponse,
  InfrastructureProjectSectorRow,
} from "@/lib/analytics/types";

interface InfrastructureProjectsPanelProps {
  province?: string;
}

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "loaded"; data: InfrastructureProjectsSummaryResponse }
  | { status: "error"; message: string };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function InfrastructureProjectsPanel({
  province,
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
        if (province) {
          params.set("province", province);
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
  }, [province]);

  if (state.status === "idle" || state.status === "loading") {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading governed infrastructure project data...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <p className="mt-3 text-sm font-black uppercase tracking-widest text-slate-900">
            Project summary unavailable
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
          (data.summary.projectsWithBudgetCount / data.summary.screenedProjectCount) *
            100
        )
      : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <BadgeAlert className="mt-0.5 h-5 w-5 text-amber-600" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
              Coverage Caveat
            </p>
            <div className="mt-2 space-y-2">
              {data.caveats.map((caveat: string) => (
                <p key={caveat} className="text-sm font-medium text-slate-700">
                  {caveat}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Scope
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.province ?? "All Provinces"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Snapshot {data.snapshotDate ?? "Unavailable"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Screened Projects
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.summary.screenedProjectCount}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {data.summary.screenedOutProjectCount} screened out
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            High Value Projects
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.summary.highValueProjectCount}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Budget coverage {budgetCoverage}%
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Known Expenditure
          </p>
          <p className="mt-1 text-lg font-display font-bold text-slate-900">
            {formatCurrency(data.summary.totalKnownExpenditure)}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Top sector {data.summary.topSector ?? "Unavailable"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.03fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
                Sector Opportunity Mix
              </h4>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Treasury-screened infrastructure projects by normalized sector
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Database className="h-3.5 w-3.5" />
              {data.trace.tables[0]}
            </div>
          </div>

          <div className="space-y-3">
            {data.sectorBreakdown.slice(0, 6).map((row: InfrastructureProjectSectorRow) => {
              const width =
                data.summary.screenedProjectCount > 0
                  ? Math.max(
                      8,
                      Math.round(
                        (row.projectCount / data.summary.screenedProjectCount) * 100
                      )
                    )
                  : 8;

              return (
                <div key={row.normalizedSector} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {row.normalizedSector}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {row.highValueProjectCount} high value
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-display font-bold text-slate-900">
                        {row.projectCount}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Projects
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>{row.projectsWithBudgetCount} with budget rows</span>
                    <span>{formatCurrency(row.totalKnownExpenditure)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
              Geography Ranking
            </h4>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Highest screened project concentrations by geography
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-[1.3fr_0.8fr_0.9fr_1fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <p>Geography</p>
              <p className="text-right">Projects</p>
              <p className="text-right">High Value</p>
              <p className="text-right">Known Spend</p>
            </div>
            <div className="divide-y divide-slate-100">
            {data.geographyRows.map((row: InfrastructureProjectGeographyRow) => (
              <div key={row.geography} className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1fr] lg:items-start">
                <div className="flex items-start gap-3">
                    <Landmark className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {row.geography}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Dominant sector {row.dominantSector ?? "Unavailable"}
                      </p>
                    </div>
                </div>
                <p className="text-right text-sm font-bold text-slate-900">{row.projectCount}</p>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{row.highValueProjectCount}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {row.projectsWithBudgetCount} budgeted
                  </p>
                </div>
                <p className="text-right text-sm font-bold text-slate-900">
                  {formatCurrency(row.totalKnownExpenditure)}
                </p>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
