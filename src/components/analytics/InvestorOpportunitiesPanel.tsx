"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Coins, RefreshCw, TrendingUp } from "lucide-react";

import { InvestorOpportunitiesResponse, InvestorOpportunityRow } from "@/lib/analytics/types";

interface InvestorOpportunitiesPanelProps {
  province?: string;
  municipality?: string | null;
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
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }
  if (flag === "MEDIUM") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }
  return "border-slate-100 bg-slate-50 text-slate-700";
}

export default function InvestorOpportunitiesPanel({
  province,
  municipality,
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
        if (province) {
          params.set("province", province);
        }
        if (municipality) {
          params.set("municipality", municipality);
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
  }, [province, municipality, limit]);

  useEffect(() => {
    if (
      state.status === "loaded" &&
      !selectedProjectId &&
      state.data.rows.length > 0 &&
      onSelectProject
    ) {
      onSelectProject(state.data.rows[0].projectId);
    }
  }, [onSelectProject, selectedProjectId, state]);

  if (state.status === "idle" || state.status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading investor opportunities...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <p className="mt-3 text-sm font-black uppercase tracking-widest text-slate-900">
            Opportunity ranking unavailable
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
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Opportunities
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.summary.opportunityCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            High Value
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.summary.highValueOpportunityCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Avg. Score
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.summary.averageInvestmentScore ?? "Unavailable"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Top Sector
          </p>
          <p className="mt-1 text-sm font-display font-bold text-slate-900">
            {data.summary.topSector ?? "Unavailable"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <TrendingUp className="h-3.5 w-3.5" />
          Opportunity logic
        </div>
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium text-slate-700">
            These rows are ranked opportunity signals, not confirmed investor commitments.
          </p>
          {data.caveats.map((caveat: string) => (
            <p key={caveat} className="text-sm font-medium text-slate-700">
              {caveat}
            </p>
          ))}
        </div>
      </div>

      {data.rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <p className="text-sm font-bold text-slate-700">
            No directional opportunities are currently in scope for this geography filter.
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Try a broader province selection or remove the municipality filter to reopen the Treasury project universe.
          </p>
        </div>
      ) : null}

      {data.rows.length > 0 ? (
      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <div className="grid grid-cols-[1.5fr_0.8fr_1fr_0.9fr_0.9fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <p>Project</p>
          <p className="text-right">Score</p>
          <p className="text-right">Spend</p>
          <p className="text-right">Quality</p>
          <p className="text-right">Action</p>
        </div>
        <div className="divide-y divide-slate-100">
          {data.rows.map((row: InvestorOpportunityRow) => (
            <div
              key={row.projectId}
              className={`grid grid-cols-1 gap-3 px-4 py-4 transition-colors lg:grid-cols-[1.5fr_0.8fr_1fr_0.9fr_0.9fr] lg:items-start ${
                selectedProjectId === row.projectId ? "bg-blue-50/50" : "bg-white"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Coins className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-bold text-slate-900">
                    {row.projectName}
                  </p>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {[row.province, row.municipality, row.normalizedSector, row.normalizedProjectStage]
                    .filter(Boolean)
                    .join(" | ")}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  {row.latestBudgetYear ?? "No budget year"} | {row.latestBudgetPhase ?? "No budget phase"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">{row.investmentScore}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Opportunity score
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(row.totalKnownExpenditure)}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Known spend
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Latest {formatCurrency(row.latestAmount)}
                </p>
              </div>

              <div className="text-right">
                <span className={`inline-flex rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${confidenceTone(row.dataQualityFlag)}`}>
                  {row.dataQualityFlag}
                </span>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  confidence tier
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => onSelectProject?.(row.projectId)}
                  className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${
                    selectedProjectId === row.projectId
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {selectedProjectId === row.projectId ? "Selected" : "Open Detail"}
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
