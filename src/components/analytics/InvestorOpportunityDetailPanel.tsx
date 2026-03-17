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
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }
  if (flag === "MEDIUM") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }
  return "border-slate-100 bg-slate-50 text-slate-700";
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
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            await parseError(response, `request failed with status ${response.status}`)
          );
        }

        const data = (await response.json()) as InvestorOpportunityDetailResponse;
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
      <div className="flex min-h-[320px] items-center justify-center text-center">
        <div>
          <Landmark className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-sm font-black uppercase tracking-widest text-slate-900">
            Select an opportunity
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Choose a ranked Treasury project to inspect funding rows, updates, and source provenance.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading project detail...
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
            Project detail unavailable
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">{state.message}</p>
        </div>
      </div>
    );
  }

  const { data } = state;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-600" />
              <p className="text-lg font-bold text-slate-900">{data.summary.projectName}</p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
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
          {data.summary.sourceUrl ? (
            <a
              href={data.summary.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-600"
            >
              Source
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Opportunity Score
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.summary.investmentScore}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Latest Amount
          </p>
          <p className="mt-2 text-sm font-bold text-emerald-700">
            {formatCurrency(data.summary.latestAmount)}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Known Spend
          </p>
          <p className="mt-2 text-sm font-bold text-blue-700">
            {formatCurrency(data.summary.totalKnownExpenditure)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Budget Year
          </p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {data.summary.latestBudgetYear ?? "Unavailable"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Confidence Tier
          </p>
          <span className={`mt-2 inline-flex rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${confidenceTone(data.summary.dataQualityFlag)}`}>
            {data.summary.dataQualityFlag}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
          Directional Readiness Note
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          This detail view shows normalized Treasury project evidence and confidence tiering. It supports opportunity positioning and government engagement, not confirmation of investor commitment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Database className="h-3.5 w-3.5" />
            Funding rows
          </div>
          <div className="space-y-3">
            {data.fundingRows.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                No funding rows were normalized for this project yet.
              </div>
            ) : (
              data.fundingRows.map((row) => (
                <div
                  key={`${row.financialYear ?? "none"}-${row.budgetPhase ?? "none"}-${row.amount}`}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Financial Year
                      </p>
                      <p className="mt-2 text-sm font-bold text-slate-900">
                        {row.financialYear ?? "Unavailable"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Budget Phase
                      </p>
                      <p className="mt-2 text-sm font-bold text-slate-900">
                        {row.budgetPhase ?? "Unavailable"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Amount
                      </p>
                      <p className="mt-2 text-sm font-bold text-slate-900">
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
            Project updates
          </div>
          <div className="space-y-3">
            {data.updateRows.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                No normalized project updates were found for this opportunity.
              </div>
            ) : (
              data.updateRows.map((row, index) => (
                <div
                  key={`${row.updateType}-${row.effectiveDate ?? index}`}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {row.updateType}
                    {row.effectiveDate ? ` | ${row.effectiveDate}` : ""}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {row.updateSummary}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="space-y-2">
          {data.caveats.map((caveat) => (
            <p key={caveat} className="text-sm font-medium text-slate-700">
              {caveat}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
