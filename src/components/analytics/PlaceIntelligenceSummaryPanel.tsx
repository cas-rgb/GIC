"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  ElectionHistoryResponse,
  HistoricalInfrastructureResponse,
  PlaceContextResponse,
  PlaceProfileResponse,
  WardCouncillorResponse,
} from "@/lib/analytics/types";
import { formatWardDisplayLabel } from "@/lib/analytics/ward-label";

type SummaryState =
  | { status: "loading" }
  | {
      status: "loaded";
      context: PlaceContextResponse | null;
      profile: PlaceProfileResponse | null;
      election: ElectionHistoryResponse | null;
      history: HistoricalInfrastructureResponse | null;
      councillor: WardCouncillorResponse | null;
    }
  | { status: "error"; message: string };

interface PlaceIntelligenceSummaryPanelProps {
  province: string;
  municipality?: string | null;
  ward?: string | null;
}

const COALITION_SENSITIVE_MUNICIPALITIES = new Set([
  "City of Johannesburg",
  "City of Tshwane",
  "Ekurhuleni",
  "Nelson Mandela Bay",
]);

export default function PlaceIntelligenceSummaryPanel({
  province,
  municipality = null,
  ward = null,
}: PlaceIntelligenceSummaryPanelProps) {
  const [state, setState] = useState<SummaryState>({ status: "loading" });

  useEffect(() => {
    async function parseJson<T>(response: Response): Promise<T | null> {
      if (!response.ok) {
        return null;
      }

      return (await response.json()) as T;
    }

    async function load() {
      setState({ status: "loading" });

      const params = new URLSearchParams({ province });
      if (municipality) {
        params.set("municipality", municipality);
      }
      if (ward) {
        params.set("ward", ward);
      }

      try {
        const requests: Promise<Response>[] = [
          fetch(`/api/analytics/place-profile?${params.toString()}`, {
            cache: "no-store",
          }),
          fetch(`/api/analytics/place-election-history?${params.toString()}`, {
            cache: "no-store",
          }),
          fetch(
            `/api/analytics/place-infrastructure-history?${params.toString()}`,
            { cache: "no-store" },
          ),
        ];

        if (!ward) {
          requests.push(
            fetch(`/api/analytics/place-context?${params.toString()}`, {
              cache: "no-store",
            }),
          );
        }

        if (ward && municipality) {
          requests.push(
            fetch(`/api/analytics/ward-councillor?${params.toString()}`, {
              cache: "no-store",
            }),
          );
        }

        const responses = await Promise.all(requests);
        let index = 0;

        const profile = await parseJson<PlaceProfileResponse>(
          responses[index++],
        );
        const election = await parseJson<ElectionHistoryResponse>(
          responses[index++],
        );
        const history = await parseJson<HistoricalInfrastructureResponse>(
          responses[index++],
        );
        const context = !ward
          ? await parseJson<PlaceContextResponse>(responses[index++])
          : null;
        const councillor =
          ward && municipality
            ? await parseJson<WardCouncillorResponse>(responses[index++])
            : null;

        setState({
          status: "loaded",
          context,
          profile,
          election,
          history,
          councillor,
        });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load place intelligence summary",
        });
      }
    }

    void load();
  }, [municipality, province, ward]);

  if (state.status === "loading") {
    return (
      <p className="text-sm text-slate-500">
        Loading place intelligence summary...
      </p>
    );
  }

  if (state.status === "error") {
    return <p className="text-sm text-slate-500">{state.message}</p>;
  }

  const context = state.context;
  const demographics = state.profile?.demographics;
  const electionRows = state.election?.rows ?? [];
  const historyRows = state.history?.rows ?? [];
  const councillor = state.councillor;
  const scopeLabel = buildScopeLabel(
    ward,
    councillor?.wardNumber ?? null,
    municipality,
    province,
  );

  const winningRow =
    electionRows.find((row) => row.winnerFlag) ?? electionRows[0] ?? null;
  const recentHistory = historyRows[0] ?? null;
  const serviceAccessSignals = [
    {
      label: "Water",
      value: formatPercent(demographics?.serviceAccessWater ?? null),
    },
    {
      label: "Electricity",
      value: formatPercent(demographics?.serviceAccessElectricity ?? null),
    },
    {
      label: "Sanitation",
      value: formatPercent(demographics?.serviceAccessSanitation ?? null),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="gic-card-blue bg-blue-50/50 p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
          Place Intelligence Summary
        </p>
        <p className="mt-2 text-lg font-display font-bold text-slate-900">
          {scopeLabel}
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          This panel combines place identity, political context, and historical
          infrastructure patterns so the active geography can be read as more
          than a live pressure score.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="gic-card">
          <div className="flex items-start gap-3">
            <Users className="mt-1 h-5 w-5 text-slate-500" />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Who This Place Is
              </p>
              <p className="mt-3 text-sm font-medium text-slate-700">
                {buildIdentityLine(scopeLabel, demographics, context)}
              </p>
              {serviceAccessSignals.some((signal) => signal.value !== "N/A") ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {serviceAccessSignals.map((signal) => (
                    <span
                      key={signal.label}
                      className="gic-badge gic-badge-neutral"
                    >
                      {signal.label}: {signal.value}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="gic-card">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-slate-500" />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Political Context
              </p>
              <p className="mt-3 text-sm font-medium text-slate-700">
                {buildPoliticalLine(
                  scopeLabel,
                  municipality,
                  ward,
                  winningRow,
                  councillor,
                )}
              </p>
              {winningRow ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="gic-badge gic-badge-neutral">
                    {winningRow.electionYear} {winningRow.electionType}
                  </span>
                  <span className="gic-badge gic-badge-info bg-blue-50 text-blue-700">
                    {winningRow.partyName}
                  </span>
                  {winningRow.voteShare !== null ? (
                    <span className="gic-badge gic-badge-success">
                      {winningRow.voteShare}% share
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="gic-card">
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-1 h-5 w-5 text-slate-500" />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Historical Pattern
              </p>
              <p className="mt-3 text-sm font-medium text-slate-700">
                {buildHistoryLine(
                  scopeLabel,
                  recentHistory,
                  historyRows.length,
                )}
              </p>
              {recentHistory ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    recentHistory.issueFamily,
                    recentHistory.serviceDomain,
                    recentHistory.severity,
                  ]
                    .filter(Boolean)
                    .map((value) => (
                      <span
                        key={value}
                        className="gic-badge gic-badge-warning"
                      >
                        {value}
                      </span>
                    ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="gic-card">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-slate-500" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Current Readiness
              </p>
              <p className="mt-3 text-sm font-medium text-slate-700">
                {buildReadinessLine(
                  scopeLabel,
                  context,
                  historyRows.length,
                  ward,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="gic-card border-t-4 border-t-amber-400 bg-amber-50/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 text-amber-600" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                Coverage Note
              </p>
              <p className="mt-3 text-sm font-medium text-slate-700">
                {buildCoverageLine(
                  context,
                  demographics !== null && demographics !== undefined,
                  electionRows.length,
                  historyRows.length,
                  ward,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildIdentityLine(
  scopeLabel: string,
  demographics: PlaceProfileResponse["demographics"] | undefined,
  context: PlaceContextResponse | null,
) {
  if (demographics) {
    const parts = [
      demographics.populationTotal !== null
        ? `${scopeLabel} has an estimated population of ${demographics.populationTotal.toLocaleString()}`
        : `${scopeLabel} has a loaded demographic profile`,
      demographics.householdsTotal !== null
        ? `${demographics.householdsTotal.toLocaleString()} households`
        : null,
      demographics.unemploymentRate !== null
        ? `${demographics.unemploymentRate}% unemployment`
        : null,
    ].filter(Boolean);

    return `${parts.join(", ")}.`;
  }

  if (context?.wikipediaDescription || context?.wikipediaExtract) {
    return (
      context.wikipediaDescription ??
      context.wikipediaExtract ??
      `${scopeLabel} has partial contextual enrichment loaded.`
    );
  }

  return `${scopeLabel} does not yet have a structured demographic baseline loaded, so this view currently relies on contextual reference and live issue evidence.`;
}

function buildScopeLabel(
  ward: string | null,
  wardNumber: number | null,
  municipality: string | null,
  province: string,
) {
  if (ward) {
    return formatWardDisplayLabel(ward, wardNumber);
  }

  return municipality ?? province;
}

function buildPoliticalLine(
  scopeLabel: string,
  municipality: string | null,
  ward: string | null,
  winningRow: ElectionHistoryResponse["rows"][number] | null,
  councillor: WardCouncillorResponse | null,
) {
  if (winningRow && councillor?.councillorName) {
    const share =
      winningRow.voteShare !== null
        ? ` with ${winningRow.voteShare}% vote share`
        : "";

    return `${scopeLabel} currently has ward leadership reference for ${councillor.councillorName}, while the latest loaded election result shows ${winningRow.partyName} leading${share}.`;
  }

  if (winningRow) {
    const turnout =
      winningRow.turnout !== null ? ` on ${winningRow.turnout}% turnout` : "";

    return `${scopeLabel} currently shows ${winningRow.partyName} as the strongest loaded election result in ${winningRow.electionYear}${turnout}.`;
  }

  if (
    !ward &&
    municipality &&
    COALITION_SENSITIVE_MUNICIPALITIES.has(municipality)
  ) {
    return `${scopeLabel} is treated as politically complex. A simple single-party municipality winner has not been loaded because coalition-sensitive council control would be easy to overstate.`;
  }

  if (councillor?.councillorName) {
    return `${scopeLabel} currently has verified ward leadership reference for ${councillor.councillorName}, but election history has not yet been loaded for this view.`;
  }

  return `${scopeLabel} still needs a fuller election and leadership backfill before political context can be read confidently at this level.`;
}

function buildHistoryLine(
  scopeLabel: string,
  recentHistory: HistoricalInfrastructureResponse["rows"][number] | null,
  historyCount: number,
) {
  if (recentHistory) {
    const issue =
      recentHistory.issueFamily ??
      recentHistory.serviceDomain ??
      "infrastructure";
    const period =
      recentHistory.periodYear ??
      recentHistory.eventDate ??
      "the recorded period";

    return `${scopeLabel} already has ${historyCount} structured historical issue records, with recent evidence pointing to ${issue} pressure around ${period}.`;
  }

  return `${scopeLabel} does not yet have enough structured historical infrastructure records loaded to describe a reliable long-run pattern.`;
}

function buildReadinessLine(
  scopeLabel: string,
  context: PlaceContextResponse | null,
  historyCount: number,
  ward: string | null,
) {
  if (ward) {
    return `${scopeLabel} is being read as a ward-focused operating view. Current readiness depends on whether that ward has evidence-backed issue history rather than registry-only coverage.`;
  }

  if (context && context.knownWardCount > 0) {
    return `${scopeLabel} currently has ${context.knownWardCount} known wards, of which ${context.evidenceBackedWardCount} are already backed by governed evidence. Historical context is based on ${historyCount} structured issue records for this geography.`;
  }

  return `${scopeLabel} can already be read through current issue evidence, but ward-depth and historical readiness are still being expanded.`;
}

function buildCoverageLine(
  context: PlaceContextResponse | null,
  hasDemographics: boolean,
  electionCount: number,
  historyCount: number,
  ward: string | null,
) {
  const gaps: string[] = [];

  if (!hasDemographics) {
    gaps.push("demographics");
  }
  if (electionCount === 0) {
    gaps.push("election history");
  }
  if (historyCount === 0) {
    gaps.push("historical infrastructure");
  }
  if (
    !ward &&
    context &&
    context.knownWardCount > 0 &&
    context.evidenceBackedWardCount < context.knownWardCount
  ) {
    gaps.push("full ward evidence coverage");
  }

  if (gaps.length === 0) {
    return "This place already has context, history, and political reference data loaded. Continue using the supporting panels below for the detailed breakdown.";
  }

  return `This summary is still constrained by missing ${gaps.join(", ")}. It is suitable for a directional readout, but not yet a complete place profile.`;
}

function formatPercent(value: number | null) {
  return value === null ? "N/A" : `${value}%`;
}
