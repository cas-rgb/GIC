"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, RefreshCw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  MunicipalityComparisonResponse,
  MunicipalityComparisonRow,
} from "@/lib/analytics/types";

interface MunicipalityComparisonPanelProps {
  province: string;
  days?: number;
}

type RankBy = "pressure" | "escalation" | "sentiment" | "evidence" | "official";
type FilterMode = "all" | "watchlist";
type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: MunicipalityComparisonResponse }
  | { status: "error"; message: string };

export default function MunicipalityComparisonPanel({
  province,
  days = 30,
}: MunicipalityComparisonPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryRankBy = searchParams.get("rankBy");
  const queryFilterMode = searchParams.get("filterMode");
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [rankBy, setRankBy] = useState<RankBy>("pressure");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  useEffect(() => {
    if (
      queryRankBy &&
      ["pressure", "escalation", "sentiment", "evidence", "official"].includes(
        queryRankBy,
      ) &&
      queryRankBy !== rankBy
    ) {
      setRankBy(queryRankBy as RankBy);
    }

    if (
      queryFilterMode &&
      ["all", "watchlist"].includes(queryFilterMode) &&
      queryFilterMode !== filterMode
    ) {
      setFilterMode(queryFilterMode as FilterMode);
    }
  }, [filterMode, queryFilterMode, queryRankBy, rankBy]);

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
        const response = await fetch(
          `/api/analytics/municipality-comparison?province=${encodeURIComponent(province)}&days=${days}`,
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

        const data = (await response.json()) as MunicipalityComparisonResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load municipality comparison",
        });
      }
    }

    void load();
  }, [province, days]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("rankBy", rankBy);
    nextParams.set("filterMode", filterMode);

    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }
  }, [filterMode, pathname, rankBy, router, searchParams]);

  const rows = useMemo(() => {
    if (state.status !== "loaded") {
      return [];
    }

    let sorted = [...state.data.rows];

    if (filterMode === "watchlist") {
      const highPressure = [...sorted]
        .sort((left, right) => right.pressureScore - left.pressureScore)
        .slice(0, 5);
      const worstSentiment = [...sorted]
        .sort(
          (left, right) =>
            (left.sentimentScore ?? -999) - (right.sentimentScore ?? -999),
        )
        .slice(0, 5);
      const weakestOfficial = [...sorted]
        .sort(
          (left, right) =>
            left.officialEvidenceShare - right.officialEvidenceShare,
        )
        .slice(0, 5);
      const byMunicipality = new Map<string, MunicipalityComparisonRow>();

      [...highPressure, ...worstSentiment, ...weakestOfficial].forEach(
        (row) => {
          byMunicipality.set(row.municipality, row);
        },
      );

      sorted = [...byMunicipality.values()];
    }

    sorted.sort((left, right) => {
      switch (rankBy) {
        case "escalation":
          return right.escalationScore - left.escalationScore;
        case "sentiment":
          return (left.sentimentScore ?? -999) - (right.sentimentScore ?? -999);
        case "evidence":
          return right.evidenceConfidenceScore - left.evidenceConfidenceScore;
        case "official":
          return right.officialEvidenceShare - left.officialEvidenceShare;
        default:
          return right.pressureScore - left.pressureScore;
      }
    });
    return sorted;
  }, [filterMode, rankBy, state]);

  const summary = useMemo(() => {
    if (rows.length === 0) {
      return {
        avgPressure: 0,
        avgEvidence: 0,
        lowOfficialCount: 0,
        negativeSentimentCount: 0,
      };
    }

    return {
      avgPressure:
        Math.round(
          (rows.reduce((sum, row) => sum + row.pressureScore, 0) /
            rows.length) *
            10,
        ) / 10,
      avgEvidence:
        Math.round(
          (rows.reduce((sum, row) => sum + row.evidenceConfidenceScore, 0) /
            rows.length) *
            10,
        ) / 10,
      lowOfficialCount: rows.filter((row) => row.officialEvidenceShare < 50)
        .length,
      negativeSentimentCount: rows.filter(
        (row) => (row.sentimentScore ?? 100) < 45,
      ).length,
    };
  }, [rows]);

  const narrative = useMemo(() => {
    if (rows.length === 0) {
      return `No municipalities in ${province} currently match the selected comparison mode.`;
    }

    const leader = rows[0];
    const weakestOfficial = [...rows].sort(
      (left, right) => left.officialEvidenceShare - right.officialEvidenceShare,
    )[0];

    if (filterMode === "watchlist") {
      return `${leader.municipality} currently anchors the municipal watchlist, driven by ${leader.topPressureDomain ?? "mixed pressure"}${leader.topComplaintTopic ? ` and complaint intensity around ${leader.topComplaintTopic}` : ""}. This watchlist isolates municipalities with the highest pressure, the weakest sentiment, or the lowest official share. ${summary.lowOfficialCount} municipalities in ${province} remain below 50% official share, with ${weakestOfficial.municipality} currently weakest at ${weakestOfficial.officialEvidenceShare}%.`;
    }

    return `${leader.municipality} is currently leading the selected municipality comparison, driven by ${leader.topPressureDomain ?? "mixed pressure"}${leader.topComplaintTopic ? ` and complaint intensity around ${leader.topComplaintTopic}` : ""}. ${summary.lowOfficialCount} municipalities in ${province} remain below 50% official share, with ${weakestOfficial.municipality} currently the weakest on official weighting at ${weakestOfficial.officialEvidenceShare}%.`;
  }, [filterMode, province, rows, summary.lowOfficialCount]);

  function exportRows() {
    const header = [
      "municipality",
      "pressure_score",
      "escalation_score",
      "sentiment_score",
      "evidence_confidence_score",
      "official_evidence_share",
      "top_pressure_domain",
      "top_complaint_topic",
    ];

    const lines = rows.map((row) =>
      [
        row.municipality,
        row.pressureScore,
        row.escalationScore,
        row.sentimentScore ?? "",
        row.evidenceConfidenceScore,
        row.officialEvidenceShare,
        row.topPressureDomain ?? "",
        row.topComplaintTopic ?? "",
      ].join(","),
    );

    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${province.toLowerCase().replace(/\s+/g, "-")}-municipality-comparison.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function buildReturnTo() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("province", province);
    params.set("rankBy", rankBy);
    params.set("filterMode", filterMode);
    return `${pathname}?${params.toString()}`;
  }

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading municipality comparison...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Rank municipalities by
          </p>
          <select
            value={rankBy}
            onChange={(event) => setRankBy(event.target.value as RankBy)}
            className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900"
          >
            <option value="pressure">Pressure Score</option>
            <option value="escalation">Escalation Score</option>
            <option value="sentiment">Worst Sentiment</option>
            <option value="evidence">Evidence Confidence</option>
            <option value="official">Official Share</option>
          </select>
          <select
            value={filterMode}
            onChange={(event) =>
              setFilterMode(event.target.value as FilterMode)
            }
            className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900"
          >
            <option value="all">All Municipalities</option>
            <option value="watchlist">
              Watchlist: High Pressure / Weak Sentiment / Low Official
            </option>
          </select>
        </div>
        <button
          type="button"
          onClick={exportRows}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Avg Pressure
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {summary.avgPressure}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Avg Evidence
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-emerald-700">
            {summary.avgEvidence}%
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Low Official
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-amber-700">
            {summary.lowOfficialCount}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            Negative Sentiment
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-rose-700">
            {summary.negativeSentimentCount}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-600/10 blur-[90px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-blue-900 text-lg leading-relaxed font-bold border-l-4 border-blue-500 pl-4 py-1 mb-6">
            At the municipal level, issue concentration is highest in a small number of areas, with water and road infrastructure dominating local concerns. Several municipalities show rising issue volumes over recent weeks, suggesting increasing service delivery pressure. Ward-level visibility remains partial, but available signals indicate recurring issues rather than isolated incidents.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 border-t border-blue-200/50 pt-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                Who
              </span>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                Municipality and Ward-level (where supported).
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                What
              </span>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                Top local issues and specific issue volumes.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                Why
              </span>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                Issue categories (e.g. water, roads) linking to broader infrastructure failure signals.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                When
              </span>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                Issue trend tracking local volumes over time.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                How
              </span>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                Escalation patterns emphasizing repeated complaints or long-term systemic issues.
              </p>
            </div>
          </div>
        </div>
        {rows[0] ? (
          <div className="mt-6 flex flex-wrap gap-3 relative z-10">
            <button
              type="button"
              onClick={() => {
                window.location.assign(
                  `/municipality-wards?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(rows[0].municipality)}&days=${days}&from=${encodeURIComponent(buildReturnTo())}`,
                );
              }}
              className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700"
            >
              Open Lead Municipality Dashboard
            </button>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {rows.map((row: MunicipalityComparisonRow) => (
          <div
            key={row.municipality}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-base font-bold text-slate-900">
                  {row.municipality}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {row.topPressureDomain ?? "No dominant domain"}
                  {row.topComplaintTopic ? ` · ${row.topComplaintTopic}` : ""}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 xl:min-w-[360px]">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">
                    {row.pressureScore}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Pressure
                  </p>
                </div>
                <div className="rounded-xl bg-rose-50 p-3 text-center">
                  <p className="text-lg font-bold text-rose-700">
                    {row.escalationScore}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">
                    Escalation
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-center">
                  <p className="text-lg font-bold text-emerald-700">
                    {row.evidenceConfidenceScore}%
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
                    Evidence
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Sentiment
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {row.sentimentScore ?? "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Official Share
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {row.officialEvidenceShare}%
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Top Topic
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  {row.topComplaintTopic ?? "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  window.location.assign(
                    `/municipality-wards?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(row.municipality)}&days=${days}&from=${encodeURIComponent(buildReturnTo())}`,
                  );
                }}
                className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700"
              >
                Open Municipality View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
