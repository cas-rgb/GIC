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
  if (score >= 75) return "border-emerald-900/40 bg-emerald-900/20 text-emerald-400";
  if (score >= 55) return "border-amber-900/40 bg-amber-900/20 text-amber-400";
  return "border-rose-900/40 bg-rose-900/20 text-rose-400";
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
        if (province && province !== "all" && province !== "All Provinces") {
          params.set("province", province);
        }

        const response = await fetch(
          `/api/analytics/investor-executive-summary?${params.toString()}`,
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

        const data =
          (await response.json()) as InvestorExecutiveSummaryResponse;
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
      <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 shadow-gic-premium">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin text-gic-blue" />
          Building executive capital summary...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-rose-900/30 bg-slate-900 text-center shadow-gic-premium">
        <div>
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
          <p className="mt-3 text-sm font-black uppercase tracking-widest text-slate-200">
            Investor summary unavailable
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
  const leadProvince = data.provinces?.[0] ?? null;
  const weakestProvince =
    [...data.provinces].sort(
      (left, right) =>
        left.dataQualityOkShare - right.dataQualityOkShare ||
        left.province.localeCompare(right.province),
    )[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.45fr_1fr_1fr_1fr]">
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Macro Strategy Readout
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {leadProvince
              ? `${leadProvince.province} leads the current opportunity view, driven by ${leadProvince.dominantSector ?? "mixed infrastructure"} and ${leadProvince.highValueOpportunityCount} high-value projects.`
              : "No province currently dominates the investor opportunity picture."}
          </p>
        </div>
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            National Coverage
          </p>
          <p className="mt-1 text-xl font-display font-bold text-white">
            {data.summary.provinceCount} provinces
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {data.summary.opportunityCount} ranked projects
          </p>
        </div>
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
            Priority Deal Volume
          </p>
          <p className="mt-1 text-xl font-display font-bold text-white">
            {formatCurrency(data.summary.totalKnownExpenditure)}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/70">
            {data.summary.highValueOpportunityCount} high-value projects
          </p>
        </div>
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
            Anchor Region
          </p>
          <p className="mt-1 text-xl font-display font-bold text-white">
            {data.summary.topProvince ?? "Unavailable"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/70">
            Dominant sector {data.summary.topSector ?? "Unavailable"}
          </p>
        </div>
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Lead Strategic Asset
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-display font-bold text-white">
            {data.summary.leadOpportunityName ?? "Unavailable"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70">
            {data.summary.leadOpportunityProvince ?? "No province"} | score{" "}
            {data.summary.leadOpportunityScore ?? "Unavailable"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            Capital Priority Target
          </p>
          <p className="mt-1 text-sm font-bold text-white">
            {data.summary.topProvince ?? "Unavailable"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {data.summary.topSector ?? "mixed sector"}
          </p>
        </div>
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">
            Lead Executing Municipality
          </p>
          <p className="mt-1 text-sm font-bold text-white">
            {data.provinces?.[0]?.leadMunicipality ?? "Province-wide mix"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/70">
            top-ranked province hotspot
          </p>
        </div>
        <div className="gic-card bg-slate-900 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-400">
            High Risk: Weak Data
          </p>
          <p className="mt-1 text-sm font-bold text-white">
            {weakestProvince?.province ?? "Unavailable"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/70">
            {weakestProvince
              ? `${weakestProvince.dataQualityOkShare}% data Treasury OK`
              : "no coverage"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.02fr_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 shadow-gic-premium">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <BriefcaseBusiness className="h-4 w-4 text-gic-blue" />
            Executive Deal Synthesis
          </div>
          <div className="mt-4 space-y-3">
            {(data.narratives || []).map((narrative: string) => (
              <p
                key={narrative}
                className="text-sm font-medium leading-6 text-slate-300"
              >
                {narrative}
              </p>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-amber-900/30 bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
              <ShieldAlert className="h-4 w-4" />
              Due Diligence Caution
            </div>
            <div className="mt-3 grid gap-2">
              <p className="rounded-xl border border-amber-900/40 bg-amber-950/40 px-3 py-2 text-sm font-medium text-slate-300">
                Treat this as directional infrastructure opportunity
                intelligence for government engagement, not a confirmed investor
                commitment list.
              </p>
              {(data.caveats || []).map((caveat: string) => (
                <p
                  key={caveat}
                  className="rounded-xl border border-amber-900/40 bg-amber-950/40 px-3 py-2 text-sm font-medium text-slate-300"
                >
                  {caveat}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 shadow-gic-premium">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Building2 className="h-4 w-4 text-gic-blue" />
            Regional Alignment
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
            <div className="grid grid-cols-[1.3fr_0.8fr_0.9fr_0.9fr_0.9fr] gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <p>Geography</p>
              <p className="text-right">Match</p>
              <p className="text-right">Assets</p>
              <p className="text-right">Elite</p>
              <p className="text-right">Audit OK</p>
            </div>
            <div className="divide-y divide-slate-800/80 bg-slate-950">
              {data.provinces
                .slice(0, 6)
                .map((row: InvestorProvinceOpportunityRow) => (
                  <div
                    key={row.province}
                    className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.3fr_0.8fr_0.9fr_0.9fr_0.9fr] lg:items-start"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">
                        {row.province}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {row.dominantSector ?? "mixed sector"} |{" "}
                        {row.leadMunicipality ?? "province-wide mix"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] ${getReadinessTone(
                          row.averageInvestmentScore ?? 0,
                        )}`}
                      >
                        {row.averageInvestmentScore ?? "NA"}
                      </span>
                    </div>
                    <p className="text-right text-sm font-bold text-white">
                      {row.opportunityCount}
                    </p>
                    <p className="text-right text-sm font-bold text-white">
                      {row.highValueOpportunityCount}
                    </p>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {row.dataQualityOkShare}%
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
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
