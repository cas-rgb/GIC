"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Building2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import {
  InvestorExecutiveSummaryResponse,
  InvestorProvinceOpportunityRow,
} from "@/lib/analytics/types";

type LoadState =
  | { status: "idle" | "loading" }
  | { status: "loaded"; data: InvestorExecutiveSummaryResponse }
  | { status: "error"; message: string };

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    notation: value >= 1_000_000_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function getReadinessTone(score: number): string {
  if (score >= 75) return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (score >= 55) return "border-amber-100 bg-amber-50 text-amber-700";
  return "border-rose-100 bg-rose-50 text-rose-700";
}

interface InvestorExecutiveSummaryPanelProps {
  province?: string | null;
}

export default function InvestorExecutiveSummaryPanel({
  province,
}: InvestorExecutiveSummaryPanelProps) {
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

    async function load() {
      setState({ status: "loading" });

      try {
        const params = new URLSearchParams();
        if (province) {
          params.set("province", province);
        }

        const response = await fetch(
          `/api/analytics/investor-executive-summary?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            await parseError(response, `request failed with status ${response.status}`)
          );
        }

        const data = (await response.json()) as InvestorExecutiveSummaryResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load investor executive summary",
        });
      }
    }

    void load();
  }, [province]);

  if (state.status === "idle" || state.status === "loading") {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Building investor executive summary...
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
            Investor summary unavailable
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">{state.message}</p>
        </div>
      </div>
    );
  }

  if (state.status !== "loaded") {
    return null;
  }

  const { data } = state;
  const leadProvince = data.provinces[0] ?? null;
  const weakestProvince =
    [...data.provinces].sort(
      (left, right) => left.dataQualityOkShare - right.dataQualityOkShare || left.province.localeCompare(right.province)
    )[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.45fr_1fr_1fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Command Readout
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {leadProvince
              ? `${leadProvince.province} leads the current opportunity view, driven by ${leadProvince.dominantSector ?? "mixed infrastructure"} and ${leadProvince.highValueOpportunityCount} high-value projects.`
              : "No province currently dominates the investor opportunity picture."}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Coverage
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.summary.provinceCount} provinces
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {data.summary.opportunityCount} ranked projects
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Priority Capital
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {formatCurrency(data.summary.totalKnownExpenditure)}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            {data.summary.highValueOpportunityCount} high-value projects
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Lead Province
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.summary.topProvince ?? "Unavailable"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Dominant sector {data.summary.topSector ?? "Unavailable"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Lead Opportunity
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-display font-bold text-slate-900">
            {data.summary.leadOpportunityName ?? "Unavailable"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            {data.summary.leadOpportunityProvince ?? "No province"} | score{" "}
            {data.summary.leadOpportunityScore ?? "Unavailable"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Capital Priority
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {data.summary.topProvince ?? "Unavailable"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {data.summary.topSector ?? "mixed sector"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">
            Lead Municipality
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {data.provinces[0]?.leadMunicipality ?? "Province-wide mix"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            top-ranked province hotspot
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">
            Weakest Data Confidence
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {weakestProvince?.province ?? "Unavailable"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            {weakestProvince ? `${weakestProvince.dataQualityOkShare}% data OK` : "no coverage"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.02fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <BriefcaseBusiness className="h-4 w-4" />
            Executive readout
          </div>
          <div className="mt-4 space-y-3">
            {data.narratives.map((narrative: string) => (
              <p key={narrative} className="text-sm font-medium leading-6 text-slate-700">
                {narrative}
              </p>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
              <ShieldAlert className="h-4 w-4" />
              Decision caution
            </div>
            <div className="mt-3 grid gap-2">
              <p className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700">
                Treat this as directional infrastructure opportunity intelligence for government engagement, not a confirmed investor commitment list.
              </p>
              {data.caveats.map((caveat: string) => (
                <p key={caveat} className="rounded-xl border border-amber-100 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700">
                  {caveat}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Building2 className="h-4 w-4" />
            Province ranking
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-[1.3fr_0.8fr_0.9fr_0.9fr_0.9fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <p>Province</p>
              <p className="text-right">Score</p>
              <p className="text-right">Projects</p>
              <p className="text-right">High Value</p>
              <p className="text-right">Data OK</p>
            </div>
            <div className="divide-y divide-slate-100">
            {data.provinces.slice(0, 6).map((row: InvestorProvinceOpportunityRow) => (
              <div key={row.province} className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.3fr_0.8fr_0.9fr_0.9fr_0.9fr] lg:items-start">
                <div>
                  <p className="text-sm font-bold text-slate-900">{row.province}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {row.dominantSector ?? "mixed sector"} | {row.leadMunicipality ?? "province-wide mix"}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] ${getReadinessTone(
                      row.averageInvestmentScore ?? 0
                    )}`}
                  >
                    {row.averageInvestmentScore ?? "NA"}
                  </span>
                </div>
                <p className="text-right text-sm font-bold text-slate-900">{row.opportunityCount}</p>
                <p className="text-right text-sm font-bold text-slate-900">{row.highValueOpportunityCount}</p>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{row.dataQualityOkShare}%</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {formatCurrency(row.totalKnownExpenditure)}
                  </p>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
