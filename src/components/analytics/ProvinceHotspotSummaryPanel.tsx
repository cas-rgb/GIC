"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, TrendingUp } from "lucide-react";

import {
  ComplaintClustersResponse,
  ProvinceLegacyCommunitySignalsResponse,
} from "@/lib/analytics/types";

interface ProvinceHotspotSummaryPanelProps {
  province: string;
  days?: number;
  highestExposureMunicipality: string | null;
  topPressureDomain: string | null;
  trendDirection: string;
  selectedIssueFamily?: string | null;
  onSelectIssueFamily?: (issueFamily: string) => void;
}

type LoadState =
  | { status: "loading" }
  | {
      status: "loaded";
      data: ComplaintClustersResponse;
      legacySignals: ProvinceLegacyCommunitySignalsResponse;
    }
  | { status: "error"; message: string };

function determineActionPosture(
  trendDirection: string,
  dominantIssueFamily: string | null,
  highestExposureMunicipality: string | null
) {
  if (trendDirection === "Rising" && dominantIssueFamily && highestExposureMunicipality) {
    return `Escalate visible intervention in ${highestExposureMunicipality} around ${dominantIssueFamily.toLowerCase()} before narrative pressure hardens further.`;
  }

  if (dominantIssueFamily && highestExposureMunicipality) {
    return `Stabilize ${dominantIssueFamily.toLowerCase()} pressure in ${highestExposureMunicipality} and keep response visibility high.`;
  }

  if (highestExposureMunicipality) {
    return `Prioritize executive follow-through in ${highestExposureMunicipality} while public pressure remains concentrated there.`;
  }

  return "Maintain a monitored posture until complaint concentration strengthens enough to justify a sharper intervention.";
}

export default function ProvinceHotspotSummaryPanel({
  province,
  days = 30,
  highestExposureMunicipality,
  topPressureDomain,
  trendDirection,
  selectedIssueFamily = null,
  onSelectIssueFamily,
}: ProvinceHotspotSummaryPanelProps) {
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

    async function load(): Promise<void> {
      setState({ status: "loading" });

      try {
        const params = new URLSearchParams({
          province,
          days: String(days),
        });

        const [response, legacyResponse] = await Promise.all([
          fetch(`/api/analytics/complaint-clusters?${params.toString()}`, {
            cache: "no-store",
          }),
          fetch(`/api/analytics/province-legacy-community-signals?${params.toString()}`, {
            cache: "no-store",
          }),
        ]);

        if (!response.ok) {
          throw new Error(
            await parseError(response, `request failed with status ${response.status}`)
          );
        }

        if (!legacyResponse.ok) {
          throw new Error(
            await parseError(
              legacyResponse,
              `request failed with status ${legacyResponse.status}`
            )
          );
        }

        const [data, legacySignals] = (await Promise.all([
          response.json(),
          legacyResponse.json(),
        ])) as [ComplaintClustersResponse, ProvinceLegacyCommunitySignalsResponse];
        setState({ status: "loaded", data, legacySignals });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Failed to load province hotspot summary",
        });
      }
    }

    void load();
  }, [province, days]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading hotspot summary...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">{state.message}</p>
        </div>
      </div>
    );
  }

  const { data, legacySignals } = state;
  const dominantCluster = data.rows[0] ?? null;
  const dominantLegacyIssue = legacySignals.issues[0]?.issue ?? null;
  const actionPosture = determineActionPosture(
    trendDirection,
    dominantCluster?.issueFamily ?? null,
    highestExposureMunicipality
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_1fr_1fr_1fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Command Readout
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {highestExposureMunicipality
              ? `${highestExposureMunicipality} is the operational hotspot, while ${dominantCluster?.issueFamily ?? topPressureDomain ?? "mixed complaints"} is driving the strongest province pressure.`
              : "No single municipality currently dominates the hotspot view."}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Operational Hotspot
          </p>
          <p className="mt-1 text-sm font-display font-bold text-slate-900">
            {highestExposureMunicipality ?? "No clear municipality"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            {topPressureDomain ?? "mixed service pressure"}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
            Public Complaint Hotspot
          </p>
          <p className="mt-1 text-sm font-display font-bold text-slate-900">
            {dominantCluster?.issueFamily ?? "No clear complaint family"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
            {dominantCluster ? `intensity ${Math.round(dominantCluster.intensityScore)}` : "insufficient public voice"}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">
            Trend Posture
          </p>
          <p className="mt-1 text-sm font-display font-bold text-slate-900">
            {trendDirection}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">
            complaint intensity + spread
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">
            Legacy Pulse
          </p>
          <p className="mt-1 text-sm font-display font-bold text-slate-900">
            {dominantLegacyIssue ?? "No imported cluster"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">
            {legacySignals.summary.documentCount} docs | urgency {legacySignals.summary.avgUrgency.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          <TrendingUp className="h-4 w-4" />
          Executive action posture
        </div>
        <p className="mt-3 text-sm font-medium leading-6 text-slate-700">{actionPosture}</p>
        {legacySignals.summary.documentCount > 0 ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">
            Imported community history reinforces this hotspot with {legacySignals.summary.documentCount} governed legacy docs.
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.9fr_0.8fr_0.8fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          <p>Issue Family</p>
          <p className="text-right">Mentions</p>
          <p className="text-right">Spread</p>
          <p className="text-right">Intensity</p>
          <p className="text-right">Negative</p>
        </div>
        <div className="divide-y divide-slate-100">
        {data.rows.slice(0, 4).map((row) => (
          <button
            key={row.issueFamily}
            type="button"
            onClick={() => onSelectIssueFamily?.(row.issueFamily)}
            className={`grid w-full grid-cols-1 gap-3 px-4 py-3 text-left lg:grid-cols-[1.2fr_0.8fr_0.9fr_0.8fr_0.8fr] lg:items-start ${
              selectedIssueFamily === row.issueFamily
                ? "bg-blue-50"
                : "bg-white hover:bg-slate-50"
            }`}
          >
            <div>
              <p className="text-sm font-bold text-slate-900">{row.issueFamily}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                hotspot complaint family
              </p>
            </div>
            <p className="text-right text-sm font-bold text-slate-900">{row.mentionCount}</p>
            <p className="text-right text-sm font-bold text-slate-900">{row.municipalityCount} municipalities</p>
            <p className="text-right text-sm font-bold text-blue-700">{Math.round(row.intensityScore)}</p>
            <p className="text-right text-sm font-bold text-rose-700">
              {Math.round(row.avgNegativeShare * 100)}%
            </p>
          </button>
        ))}
        </div>
      </div>
    </div>
  );
}
