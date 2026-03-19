"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Coins,
  Database,
  ExternalLink,
  Landmark,
  RefreshCw,
} from "lucide-react";

import { InvestorOpportunityDetailResponse } from "@/lib/analytics/types";

interface InvestorOpportunityDetailPanelProps {
  projectId: string | null;
}

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; data: InvestorOpportunityDetailResponse }
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

export default function InvestorOpportunityDetailPanel({
  projectId,
}: InvestorOpportunityDetailPanelProps) {
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
      if (!projectId) {
        setState({ status: "idle" });
        return;
      }

      setState({ status: "loading" });

      try {
        const response = await fetch(
          `/api/analytics/investor-opportunity-detail?projectId=${encodeURIComponent(projectId)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error(
            await parseError(
              response,
              `request failed with status ${response.status}`,
            ),
          );
        }

        const data =
          (await response.json()) as InvestorOpportunityDetailResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load opportunity detail",
        });
      }
    }

    void load();
  }, [projectId]);

  if (state.status === "idle") {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-center rounded-2xl border border-slate-800 border-dashed bg-slate-900/50 shadow-gic-premium">
        <div>
          <Landmark className="mx-auto h-10 w-10 text-slate-700" />
          <p className="mt-4 text-sm font-black uppercase tracking-widest text-slate-400">
            Awaiting Asset Selection
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Choose a ranked Treasury project to inspect funding rows, updates,
            and source provenance.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 shadow-gic-premium">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin text-gic-blue" />
          Loading Intelligence...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-center rounded-2xl border border-rose-900/30 bg-slate-900 shadow-gic-premium">
        <div>
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
          <p className="mt-3 text-sm font-black uppercase tracking-widest text-slate-200">
            Project detail unavailable
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  const { data } = state;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-gic-premium">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-sky-400" />
              <p className="text-lg font-bold text-white">
                {data.summary.projectName}
              </p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {[
                data.summary.province,
                data.summary.municipality,
                data.summary.normalizedSector,
                data.summary.normalizedProjectStage,
              ]
                .filter(Boolean)
                .join(" | ")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Match Score
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-white">
            {data.summary.investmentScore}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
            Latest Treasury Flow
          </p>
          <p className="mt-2 text-sm font-bold text-emerald-400">
            {formatCurrency(data.summary.latestAmount)}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
            Known Capital Sync
          </p>
          <p className="mt-2 text-sm font-bold text-blue-400">
            {formatCurrency(data.summary.totalKnownExpenditure)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Budget Cycle Target
          </p>
          <p className="mt-2 text-sm font-bold text-white">
            {data.summary.latestBudgetYear ?? "Unavailable"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Database className="h-3.5 w-3.5" />
            Treasury Verification Track
          </div>
          <div className="space-y-3">
            {(data.fundingRows || []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/50 p-4 text-sm font-medium text-slate-500">
                No normalized lifecycle funding has been audited for this asset yet.
              </div>
            ) : (
              (data.fundingRows || []).map((row) => (
                <div
                  key={`${row.financialYear ?? "none"}-${row.budgetPhase ?? "none"}-${row.amount}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Fiscal Year
                      </p>
                      <p className="mt-2 text-sm font-bold text-white">
                        {row.financialYear ?? "TBA"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Execution Phase
                      </p>
                      <p className="mt-2 text-sm font-bold text-white">
                        {row.budgetPhase ?? "Awaiting Phase"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80">
                        Capital Volume
                      </p>
                      <p className="mt-2 text-sm font-bold text-emerald-400">
                        {formatCurrency(row.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <RefreshCw className="h-3.5 w-3.5" />
            Execution Milestones
          </div>
          <div className="space-y-3">
            {(data.updateRows || []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/50 p-4 text-sm font-medium text-slate-500">
                No formalized execution progress reporting has been indexed for this asset.
              </div>
            ) : (
              (data.updateRows || []).map((row, index) => (
                <div
                  key={`${row.updateType}-${row.effectiveDate ?? index}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500/80">
                    {row.updateType}
                    {row.effectiveDate ? ` | ${row.effectiveDate}` : ""}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-300">
                    {row.updateSummary}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-900/30 bg-amber-950/20 p-4">
        <div className="space-y-2">
          {(data.caveats || []).map((caveat) => (
            <p key={caveat} className="text-sm font-medium text-amber-500/80">
              {caveat}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
