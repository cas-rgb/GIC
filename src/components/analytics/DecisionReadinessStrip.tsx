"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";

import {
  MunicipalityCitizenVoiceSummaryResponse,
  MunicipalityLegacyCommunitySignalsResponse,
  SocialTrendsExecutiveSummaryResponse,
} from "@/lib/analytics/types";
import { SourceHealthSummaryResponse } from "@/lib/source-registry/types";
import { ProvinceRecommendationsResponse } from "@/lib/recommendations/types";

interface DecisionReadinessStripProps {
  province: string;
  evidenceConfidenceScore: number;
  officialEvidenceShare: number;
  days?: number;
  municipality?: string;
}

type LoadState =
  | { status: "loading" }
  | {
      status: "loaded";
      sourceHealth: SourceHealthSummaryResponse;
      recommendations: ProvinceRecommendationsResponse;
      publicPressure:
        | {
            citizenMentions: number;
            citizenRiskLevel: "Low" | "Elevated" | "High";
            legacyDocumentCount: number;
          }
        | null;
    }
  | { status: "error"; message: string };

export default function DecisionReadinessStrip({
  province,
  evidenceConfidenceScore,
  officialEvidenceShare,
  days = 30,
  municipality,
}: DecisionReadinessStripProps) {
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
        const sourceHealthPromise = fetch(
          `/api/analytics/source-health-summary?province=${encodeURIComponent(province)}`,
          { cache: "no-store" }
        );

        const recommendationsUrl = municipality
          ? `/api/intelligence/municipality-recommendations?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(municipality)}&days=${days}`
          : `/api/intelligence/province-recommendations?province=${encodeURIComponent(province)}&days=${days}`;

        const recommendationsPromise = fetch(recommendationsUrl, {
          cache: "no-store",
        });
        const publicPressurePromise = municipality
          ? Promise.all([
              fetch(
                `/api/analytics/municipality-citizen-voice-summary?province=${encodeURIComponent(
                  province
                )}&municipality=${encodeURIComponent(municipality)}&days=${days}`,
                { cache: "no-store" }
              ),
              fetch(
                `/api/analytics/municipality-legacy-community-signals?province=${encodeURIComponent(
                  province
                )}&municipality=${encodeURIComponent(municipality)}&days=${days}`,
                { cache: "no-store" }
              ),
            ])
          : Promise.all([
              fetch(
                `/api/analytics/social-trends-executive-summary?province=${encodeURIComponent(
                  province
                )}&days=${days}`,
                { cache: "no-store" }
              ),
            ]);

        const [sourceHealthResponse, recommendationsResponse, publicPressureResponses] = await Promise.all([
          sourceHealthPromise,
          recommendationsPromise,
          publicPressurePromise,
        ]);

        if (!sourceHealthResponse.ok) {
          throw new Error(
            await parseError(
              sourceHealthResponse,
              `source health failed with status ${sourceHealthResponse.status}`
            )
          );
        }

        if (!recommendationsResponse.ok) {
          throw new Error(
            await parseError(
              recommendationsResponse,
              `recommendations failed with status ${recommendationsResponse.status}`
            )
          );
        }

        for (const response of publicPressureResponses) {
          if (!response.ok) {
            throw new Error(
              await parseError(
                response,
                `public pressure failed with status ${response.status}`
              )
            );
          }
        }

        const [sourceHealth, recommendations, ...publicPressurePayloads] = (await Promise.all([
          sourceHealthResponse.json(),
          recommendationsResponse.json(),
          ...publicPressureResponses.map((response) => response.json()),
        ])) as [
          SourceHealthSummaryResponse,
          ProvinceRecommendationsResponse,
          ...Array<
            | SocialTrendsExecutiveSummaryResponse
            | MunicipalityCitizenVoiceSummaryResponse
            | MunicipalityLegacyCommunitySignalsResponse
          >
        ];

        const publicPressure = municipality
          ? {
              citizenMentions:
                (publicPressurePayloads[0] as MunicipalityCitizenVoiceSummaryResponse).summary
                  .totalCitizenMentions,
              citizenRiskLevel:
                (publicPressurePayloads[0] as MunicipalityCitizenVoiceSummaryResponse).summary
                  .narrativeRiskLevel,
              legacyDocumentCount:
                (publicPressurePayloads[1] as MunicipalityLegacyCommunitySignalsResponse).summary
                  .documentCount,
            }
          : {
              citizenMentions:
                (publicPressurePayloads[0] as SocialTrendsExecutiveSummaryResponse).summary
                  .totalCitizenMentions,
              citizenRiskLevel:
                (publicPressurePayloads[0] as SocialTrendsExecutiveSummaryResponse).summary
                  .narrativeRiskLevel,
              legacyDocumentCount:
                (publicPressurePayloads[0] as SocialTrendsExecutiveSummaryResponse).summary
                  .totalLegacyCommunityDocuments,
            };

        setState({ status: "loaded", sourceHealth, recommendations, publicPressure });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Failed to load decision readiness",
        });
      }
    }

    void load();
  }, [province, municipality, days]);

  const readiness = useMemo(() => {
    if (state.status !== "loaded") {
      return null;
    }

    const healthyRatio =
      state.sourceHealth.totals.activeSourceCount > 0
        ? state.sourceHealth.totals.healthyCount / state.sourceHealth.totals.activeSourceCount
        : 0;
    const recommendationStrength =
      (state.recommendations.recommendations[0]?.confidence ?? 0) * 100;
    const publicPressureStrength = state.publicPressure
      ? Math.min(
          100,
          state.publicPressure.citizenMentions * 2 +
            state.publicPressure.legacyDocumentCount * 1.5 +
            (state.publicPressure.citizenRiskLevel === "High"
              ? 25
              : state.publicPressure.citizenRiskLevel === "Elevated"
                ? 12
                : 0)
        )
      : 0;
    const score = Math.round(
      (
        evidenceConfidenceScore * 0.25 +
        officialEvidenceShare * 0.25 +
        healthyRatio * 100 * 0.2 +
        recommendationStrength * 0.15 +
        publicPressureStrength * 0.15
      ) * 10
    ) / 10;

    return {
      healthyRatio,
      recommendationStrength,
      publicPressureStrength,
      score,
    };
  }, [evidenceConfidenceScore, officialEvidenceShare, state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading decision readiness...
        </div>
      </div>
    );
  }

  if (state.status === "error" || !readiness) {
    return (
      <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
          <p className="text-sm font-medium text-slate-700">
            {state.status === "error" ? state.message : "Decision readiness is unavailable."}
          </p>
        </div>
      </div>
    );
  }

  const label =
    readiness.score >= 75 ? "High readiness" : readiness.score >= 55 ? "Moderate readiness" : "Constrained readiness";

  return (
    <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-600" />
        <div className="w-full space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
              Decision Readiness
            </p>
            <p className="mt-2 text-sm font-medium text-slate-700">
              {municipality ?? province} is currently at <span className="font-bold text-slate-900">{label}</span>, blending evidence confidence, official share, source health, recommendation strength, and persistent public-pressure intensity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Readiness Score
              </p>
              <p className="mt-2 text-2xl font-display font-bold text-slate-900">
                {readiness.score}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Evidence Confidence
              </p>
              <p className="mt-2 text-2xl font-display font-bold text-slate-900">
                {evidenceConfidenceScore}%
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Official Share
              </p>
              <p className="mt-2 text-2xl font-display font-bold text-slate-900">
                {officialEvidenceShare}%
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Top Recommendation
              </p>
              <p className="mt-2 text-2xl font-display font-bold text-slate-900">
                {Math.round(readiness.recommendationStrength)}%
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">
                Public Pressure
              </p>
              <p className="mt-2 text-2xl font-display font-bold text-indigo-700">
                {Math.round(readiness.publicPressureStrength)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
