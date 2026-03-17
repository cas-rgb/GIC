"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, TrendingUp } from "lucide-react";

import {
  MunicipalityCitizenVoiceSummaryResponse,
  MunicipalityLegacyCommunitySignalsResponse,
  WardCoverageResponse,
} from "@/lib/analytics/types";

interface MunicipalityHotspotSummaryPanelProps {
  province: string;
  municipality: string;
  days?: number;
  pressureScore: number;
  escalationScore: number;
  topPressureDomain: string | null;
  topComplaintTopic: string | null;
  selectedIssue?: string | null;
  onSelectIssue?: (issue: string) => void;
}

type LoadState =
  | { status: "loading" }
  | {
      status: "loaded";
      citizenVoice: MunicipalityCitizenVoiceSummaryResponse;
      legacySignals: MunicipalityLegacyCommunitySignalsResponse;
      wardCoverage: WardCoverageResponse;
    }
  | { status: "error"; message: string };

function getActionPosture(
  escalationScore: number,
  dominantIssueFamily: string | null,
  municipality: string,
  wardReadinessLabel: string
) {
  if (wardReadinessLabel === "Community-led" && dominantIssueFamily) {
    return `Use community-level fallback evidence to target ${dominantIssueFamily.toLowerCase()} in ${municipality} while formal ward visibility catches up.`;
  }

  if (escalationScore >= 70 && dominantIssueFamily) {
    return `Escalate visible response in ${municipality} around ${dominantIssueFamily.toLowerCase()} before community frustration becomes harder to reverse.`;
  }

  if (dominantIssueFamily) {
    return `Stabilize ${dominantIssueFamily.toLowerCase()} complaints in ${municipality} and keep visible follow-through in public view.`;
  }

  return `Keep ${municipality} under close watch while pressure consolidates into a clearer complaint family.`;
}

export default function MunicipalityHotspotSummaryPanel({
  province,
  municipality,
  days = 30,
  pressureScore,
  escalationScore,
  topPressureDomain,
  topComplaintTopic,
  selectedIssue = null,
  onSelectIssue,
}: MunicipalityHotspotSummaryPanelProps) {
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

      const params = `province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(
        municipality
      )}&days=${days}`;

      try {
        const [citizenVoiceResponse, legacySignalsResponse, wardCoverageResponse] = await Promise.all([
          fetch(`/api/analytics/municipality-citizen-voice-summary?${params}`, {
            cache: "no-store",
          }),
          fetch(`/api/analytics/municipality-legacy-community-signals?${params}`, {
            cache: "no-store",
          }),
          fetch(`/api/analytics/ward-coverage?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(municipality)}`, {
            cache: "no-store",
          }),
        ]);

        if (!citizenVoiceResponse.ok) {
          throw new Error(
            await parseError(
              citizenVoiceResponse,
              `citizen voice failed with status ${citizenVoiceResponse.status}`
            )
          );
        }

        if (!legacySignalsResponse.ok) {
          throw new Error(
            await parseError(
              legacySignalsResponse,
              `legacy community signals failed with status ${legacySignalsResponse.status}`
            )
          );
        }

        if (!wardCoverageResponse.ok) {
          throw new Error(
            await parseError(
              wardCoverageResponse,
              `ward coverage failed with status ${wardCoverageResponse.status}`
            )
          );
        }

        const [citizenVoice, legacySignals, wardCoverage] = (await Promise.all([
          citizenVoiceResponse.json(),
          legacySignalsResponse.json(),
          wardCoverageResponse.json(),
        ])) as [
          MunicipalityCitizenVoiceSummaryResponse,
          MunicipalityLegacyCommunitySignalsResponse,
          WardCoverageResponse,
        ];

        setState({ status: "loaded", citizenVoice, legacySignals, wardCoverage });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Failed to load municipality hotspot summary",
        });
      }
    }

    void load();
  }, [province, municipality, days]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading local hotspot summary...
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

  const { citizenVoice, legacySignals, wardCoverage } = state;
  const dominantCitizenIssue = citizenVoice.summary.dominantIssueFamily;
  const dominantLegacyIssue = legacySignals.issues[0]?.issue ?? null;
  const actionPosture = getActionPosture(
    escalationScore,
    dominantCitizenIssue,
    municipality,
    wardCoverage.summary.wardReadinessLabel
  );
  const spotlightIssues = [
    dominantCitizenIssue,
    dominantLegacyIssue,
    topComplaintTopic,
    topPressureDomain,
  ].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Pressure
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">{pressureScore}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            {topPressureDomain ?? "mixed pressure"}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
            Citizen Hotspot
          </p>
          <p className="mt-2 text-lg font-display font-bold text-slate-900">
            {dominantCitizenIssue ?? "No clear issue"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-rose-500">
            {citizenVoice.issues[0] ? `intensity ${Math.round(citizenVoice.issues[0].intensityScore)}` : `${citizenVoice.summary.totalCitizenMentions} mentions`}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">
            Legacy Hotspot
          </p>
          <p className="mt-2 text-lg font-display font-bold text-slate-900">
            {dominantLegacyIssue ?? "No imported cluster"}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">
            {legacySignals.summary.documentCount} imported docs | urgency {legacySignals.summary.avgUrgency.toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">
            Escalation
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">{escalationScore}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">
            local response posture
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Ward Readiness
          </p>
          <p className="mt-2 text-lg font-display font-bold text-slate-900">
            {wardCoverage.summary.wardReadinessLabel}
          </p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            {wardCoverage.summary.wardCount} wards | {wardCoverage.summary.wardReadyCommunityCount} communities
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          <TrendingUp className="h-4 w-4" />
          Local action posture
        </div>
        <p className="mt-3 text-sm font-medium leading-6 text-slate-700">{actionPosture}</p>
        {legacySignals.summary.documentCount > 0 ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">
            Imported community history reinforces this local hotspot with {legacySignals.summary.documentCount} governed legacy docs.
          </p>
        ) : null}
        {wardCoverage.summary.wardReadinessLabel !== "Operational" ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">
            Local fallback mode: {wardCoverage.summary.wardReadinessLabel.toLowerCase()}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {spotlightIssues.slice(0, 4).map((issue) => (
          <button
            key={issue}
            type="button"
            onClick={() => onSelectIssue?.(issue)}
            className={`rounded-2xl border px-4 py-3 text-left ${
              selectedIssue === issue
                ? "border-blue-200 bg-blue-50"
                : "border-slate-100 bg-slate-50 hover:bg-white"
            }`}
          >
            <p className="text-sm font-bold text-slate-900">{issue}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              open local evidence
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
