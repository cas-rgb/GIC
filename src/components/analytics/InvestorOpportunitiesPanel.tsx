"use client";
import ProgressSpinner from "@/components/ui/ProgressSpinner";

import { useEffect, useState } from "react";
import { AlertTriangle, Coins, RefreshCw, TrendingUp } from "lucide-react";

import {
  InvestorOpportunitiesResponse,
  InvestorOpportunityRow,
} from "@/lib/analytics/types";

interface InvestorOpportunitiesPanelProps {
  province?: string | null;
  municipality?: string | null;
  serviceDomain?: string | null;
  limit?: number;
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string) => void;
}

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "loaded"; data: InvestorOpportunitiesResponse }
  | { status: "error"; message: string };

function formatCurrency(value: number | null): string {
  if (value === null) {
    return "Unavailable";
  }

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function confidenceTone(flag: string): string {
  if (flag === "OK") {
    return "border-emerald-900/40 bg-emerald-900/20 text-emerald-400";
  }
  if (flag === "MEDIUM") {
    return "border-amber-900/40 bg-amber-900/20 text-amber-400";
  }
  return "border-slate-800 bg-slate-800/50 text-slate-400";
}

export default function InvestorOpportunitiesPanel({
  province,
  municipality,
  serviceDomain,
  limit = 8,
  selectedProjectId = null,
  onSelectProject,
}: InvestorOpportunitiesPanelProps) {
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
        params.set("limit", String(limit));
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
          `/api/analytics/investor-opportunities?${params.toString()}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            await parseError(
              response,
              `request failed with status ${response.status}`
            )
          );
        }

        const data = (await response.json()) as InvestorOpportunitiesResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load investor opportunities",
        });
      }
    }

    void load();
  }, [province, municipality, serviceDomain, limit]);

  useEffect(() => {
    if (
      state.status === "loaded" &&
      !selectedProjectId &&
      (state.data.rows || []).length > 0 &&
      onSelectProject
    ) {
      onSelectProject(state.data.rows[0].projectId);
    }
  }, [onSelectProject, selectedProjectId, state]);

  if (state.status === "idle" || state.status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 shadow-gic-premium">
        <ProgressSpinner message="Ranking 5D Strategic Asset Pipeline..." />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-rose-900/30 bg-slate-900 text-center shadow-gic-premium">
        <div>
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
          <p className="mt-3 text-sm font-black uppercase tracking-widest text-slate-200">
            Profiling Unavailable
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Pipeline Scope
          </p>
          <p className="mt-1 text-xl font-display font-bold text-white">
            {data.summary.opportunityCount}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Open Strategic Matches
          </p>
        </div>
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
            Elite Capital Tier
          </p>
          <p className="mt-1 text-xl font-display font-bold text-white">
            {data.summary.highValueOpportunityCount}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/70">
            Mega-projects tracked
          </p>
        </div>
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
            Investor Match Score
          </p>
          <p className="mt-1 text-xl font-display font-bold text-white">
            {data.summary.averageInvestmentScore ?? "Unavailable"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/70">
            Average deal confidence
          </p>
        </div>
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Surging Sector
          </p>
          <p className="mt-1 text-sm font-display font-bold text-white">
            {data.summary.topSector ?? "Unavailable"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70">
            Primary asset class
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-900/40 bg-sky-950/20 px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
          <TrendingUp className="h-3.5 w-3.5" />
          Synthesis Caveats
        </div>
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium text-slate-300">
            These ranks fuse deterministic Treasury data with inferred strategic signals.
          </p>
          {(data.caveats || []).map((caveat: string) => (
            <p key={caveat} className="text-xs font-medium text-slate-400">
              {caveat}
            </p>
          ))}
        </div>
      </div>

      {(data.rows || []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/20 px-5 py-8 text-center">
          <p className="text-sm font-bold text-slate-300">
            No pipeline assets match the exact 5-dimensional footprint.
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Refine the global dashboard filters upward to access the strategic pipeline.
          </p>
        </div>
      ) : null}

      {(data.rows || []).length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-gic-premium">
          <div className="grid grid-cols-[1.5fr_0.8fr_1fr_0.8fr] gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <p>Strategic Asset</p>
            <p className="text-right">Match</p>
            <p className="text-right">Allocation</p>
            <p className="text-right"></p>
          </div>
          <div className="divide-y divide-slate-800/50 bg-slate-900 border-x border-b border-slate-800 rounded-b-2xl">
            {(data.rows || []).map((row: InvestorOpportunityRow) => (
              <div
                key={row.projectId}
                className={`grid grid-cols-1 gap-3 px-4 py-4 transition-colors lg:grid-cols-[1.5fr_0.8fr_1fr_0.8fr] lg:items-start ${
                  selectedProjectId === row.projectId
                    ? "bg-slate-800/80"
                    : "hover:bg-slate-800/40"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Coins className="h-4 w-4 text-sky-400" />
                    <p className="text-sm font-bold text-white">
                      {row.projectName}
                    </p>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {[
                      row.province,
                      row.municipality,
                      row.normalizedSector,
                      row.normalizedProjectStage,
                    ]
                      .filter(Boolean)
                      .join(" | ")}
                  </p>
                  <p className="text-xs font-medium text-slate-400">
                    Cycle {row.latestBudgetYear ?? "TBA"} |{" "}
                    Phase {row.latestBudgetPhase ?? "TBA"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {row.investmentScore}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-500/80">
                    Index Score
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-white">
                    {formatCurrency(row.totalKnownExpenditure)}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Lifetime Exposure
                  </p>
                  <p className="mt-2 text-[10px] font-black tracking-[0.1em] text-emerald-400">
                    {row.latestAmount && row.latestAmount > 0 ? "ACTIONABLE: " + formatCurrency(row.latestAmount) : "N/A"}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onSelectProject?.(row.projectId)}
                    className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                      selectedProjectId === row.projectId
                        ? "bg-gic-blue text-white shadow-lg shadow-gic-blue/20"
                        : "border border-slate-700 bg-transparent text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {selectedProjectId === row.projectId
                      ? "Analyzing"
                      : "Engage"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
