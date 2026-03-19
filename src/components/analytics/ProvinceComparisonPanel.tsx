"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, RefreshCw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  ProvinceComparisonResponse,
  ProvinceComparisonRow,
} from "@/lib/analytics/types";

interface ProvinceComparisonPanelProps {
  days?: number;
}

type RankBy = "pressure" | "escalation" | "sentiment" | "evidence" | "official";
type FilterMode =
  | "all"
  | "stressed"
  | "strong-evidence"
  | "low-official"
  | "watchlist";

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ProvinceComparisonResponse }
  | { status: "error"; message: string };

export default function ProvinceComparisonPanel({
  days = 30,
}: ProvinceComparisonPanelProps) {
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
      [
        "all",
        "stressed",
        "strong-evidence",
        "low-official",
        "watchlist",
      ].includes(queryFilterMode) &&
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
          `/api/analytics/province-comparison?days=${days}`,
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

        const data = (await response.json()) as ProvinceComparisonResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load province comparison",
        });
      }
    }

    void load();
  }, [days]);

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

    let nextRows = [...state.data.rows];

    if (filterMode === "stressed") {
      nextRows = nextRows.filter(
        (row) => row.pressureScore >= 45 || row.escalationScore >= 45,
      );
    }

    if (filterMode === "strong-evidence") {
      nextRows = nextRows.filter((row) => row.evidenceConfidenceScore >= 70);
    }

    if (filterMode === "low-official") {
      nextRows = nextRows.filter((row) => row.officialEvidenceShare < 50);
    }

    if (filterMode === "watchlist") {
      const topPressure = [...nextRows]
        .sort((left, right) => right.pressureScore - left.pressureScore)
        .slice(0, 3);
      const weakestOfficial = [...nextRows]
        .sort(
          (left, right) =>
            left.officialEvidenceShare - right.officialEvidenceShare,
        )
        .slice(0, 3);
      const failing = nextRows.filter((row) => row.failingConnectorCount > 0);
      const byProvince = new Map<string, ProvinceComparisonRow>();

      [...topPressure, ...weakestOfficial, ...failing].forEach((row) => {
        byProvince.set(row.province, row);
      });

      nextRows = [...byProvince.values()];
    }

    nextRows.sort((left, right) => {
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

    return nextRows;
  }, [filterMode, rankBy, state]);

  const summary = useMemo(() => {
    if (rows.length === 0) {
      return {
        avgPressure: 0,
        avgEvidence: 0,
        lowOfficialCount: 0,
        failingCount: 0,
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
      failingCount: rows.filter((row) => row.failingConnectorCount > 0).length,
    };
  }, [rows]);

  const narrative = useMemo(() => {
    if (rows.length === 0) {
      return "No provinces currently match the selected comparison filter.";
    }

    const leader = rows[0];
    const weakestOfficial = [...rows].sort(
      (left, right) => left.officialEvidenceShare - right.officialEvidenceShare,
    )[0];

    if (filterMode === "watchlist") {
      return `${leader.province} currently anchors the watchlist, driven by ${leader.topPressureDomain ?? "mixed pressure"}${leader.highestExposureMunicipality ? ` in ${leader.highestExposureMunicipality}` : ""}. This watchlist isolates provinces with the highest pressure, the weakest official share, or active connector failures. ${summary.lowOfficialCount} provinces in the watchlist remain below 50% official share, with ${weakestOfficial.province} currently weakest at ${weakestOfficial.officialEvidenceShare}%.`;
    }

    return `${leader.province} is currently leading the selected comparison view, driven by ${leader.topPressureDomain ?? "mixed pressure"}${leader.highestExposureMunicipality ? ` in ${leader.highestExposureMunicipality}` : ""}. ${summary.lowOfficialCount} provinces remain below 50% official share, with ${weakestOfficial.province} currently the weakest on official weighting at ${weakestOfficial.officialEvidenceShare}%.`;
  }, [filterMode, rows, summary.lowOfficialCount]);

  function exportRows() {
    const header = [
      "province",
      "pressure_score",
      "escalation_score",
      "sentiment_score",
      "evidence_confidence_score",
      "official_evidence_share",
      "top_pressure_domain",
      "highest_exposure_municipality",
      "healthy_connectors",
      "stale_connectors",
      "failing_connectors",
    ];

    const lines = rows.map((row) =>
      [
        row.province,
        row.pressureScore,
        row.escalationScore,
        row.sentimentScore ?? "",
        row.evidenceConfidenceScore,
        row.officialEvidenceShare,
        row.topPressureDomain ?? "",
        row.highestExposureMunicipality ?? "",
        row.healthyConnectorCount,
        row.staleConnectorCount,
        row.failingConnectorCount,
      ].join(","),
    );

    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "province-comparison.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function buildReturnTo() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("rankBy", rankBy);
    params.set("filterMode", filterMode);
    return `${pathname}?${params.toString()}`;
  }

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading province comparison...
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
          <select
            value={rankBy}
            onChange={(event) => setRankBy(event.target.value as RankBy)}
            className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900"
          >
            <option value="pressure">Rank by Pressure</option>
            <option value="escalation">Rank by Escalation</option>
            <option value="sentiment">Rank by Worst Sentiment</option>
            <option value="evidence">Rank by Evidence Confidence</option>
            <option value="official">Rank by Official Share</option>
          </select>
          <select
            value={filterMode}
            onChange={(event) =>
              setFilterMode(event.target.value as FilterMode)
            }
            className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-900"
          >
            <option value="all">All Provinces</option>
            <option value="stressed">Operationally Stressed</option>
            <option value="strong-evidence">Strong Evidence</option>
            <option value="low-official">Low Official Share</option>
            <option value="watchlist">
              Watchlist: High Pressure / Low Official
            </option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {rows.length} provinces in view
          </p>
          <button
            type="button"
            onClick={exportRows}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
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
            Failing Connectors
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-rose-700">
            {summary.failingCount}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
          Comparison Readout
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">{narrative}</p>
        {rows[0] ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.assign(
                  `/executive/province?province=${encodeURIComponent(rows[0].province)}&days=${days}&from=${encodeURIComponent(buildReturnTo())}`,
                );
              }}
              className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700"
            >
              Open Lead Province
            </button>
            {rows[0].highestExposureMunicipality ? (
              <button
                type="button"
                onClick={() => {
                  window.location.assign(
                    `/municipality-wards?province=${encodeURIComponent(rows[0].province)}&municipality=${encodeURIComponent(rows[0].highestExposureMunicipality ?? "")}&days=${days}&from=${encodeURIComponent(buildReturnTo())}`,
                  );
                }}
                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700"
              >
                Open Lead Hotspot
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {rows.map((row: ProvinceComparisonRow) => (
          <div
            key={row.province}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-base font-bold text-slate-900">
                  {row.province}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {row.topPressureDomain ?? "No dominant domain"}
                  {row.highestExposureMunicipality
                    ? ` · ${row.highestExposureMunicipality}`
                    : ""}
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

            <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-5">
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
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
                  Healthy
                </p>
                <p className="mt-2 text-sm font-bold text-emerald-700">
                  {row.healthyConnectorCount}
                </p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">
                  Stale
                </p>
                <p className="mt-2 text-sm font-bold text-amber-700">
                  {row.staleConnectorCount}
                </p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">
                  Failing
                </p>
                <p className="mt-2 text-sm font-bold text-rose-700">
                  {row.failingConnectorCount}
                </p>
              </div>
            </div>

            {row.highestExposureMunicipality ? (
              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    window.location.assign(
                      `/executive/province?province=${encodeURIComponent(row.province)}&days=${days}&from=${encodeURIComponent(buildReturnTo())}`,
                    );
                  }}
                  className="rounded-xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700"
                >
                  Open Province View
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.location.assign(
                      `/municipality-wards?province=${encodeURIComponent(row.province)}&municipality=${encodeURIComponent(row.highestExposureMunicipality ?? "")}&days=${days}&from=${encodeURIComponent(buildReturnTo())}`,
                    );
                  }}
                  className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700"
                >
                  Open Municipality View
                </button>
              </div>
            ) : (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    window.location.assign(
                      `/executive/province?province=${encodeURIComponent(row.province)}&days=${days}&from=${encodeURIComponent(buildReturnTo())}`,
                    );
                  }}
                  className="rounded-xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700"
                >
                  Open Province View
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
