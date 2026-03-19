"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { ProvinceIssueHeatmapResponse } from "@/lib/analytics/types";

interface ProvinceIssueHeatmapPanelProps {
  province: string;
  days?: number;
  serviceDomain?: string | null;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ProvinceIssueHeatmapResponse }
  | { status: "error"; message: string };

function getIntensityClass(value: number, maxValue: number): string {
  if (maxValue <= 0 || value <= 0) {
    return "bg-slate-50 text-slate-400";
  }

  const ratio = value / maxValue;

  if (ratio >= 0.8) {
    return "bg-rose-600 text-white";
  }
  if (ratio >= 0.6) {
    return "bg-rose-400 text-white";
  }
  if (ratio >= 0.4) {
    return "bg-amber-300 text-slate-900";
  }
  if (ratio >= 0.2) {
    return "bg-emerald-200 text-slate-900";
  }

  return "bg-slate-100 text-slate-700";
}

export default function ProvinceIssueHeatmapPanel({
  province,
  days = 30,
  serviceDomain = null,
}: ProvinceIssueHeatmapPanelProps) {
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

    async function load() {
      setState({ status: "loading" });

      try {
        const response = await fetch(
          `/api/analytics/province-issue-heatmap?province=${encodeURIComponent(province)}&days=${days}${serviceDomain ? `&serviceDomain=${encodeURIComponent(serviceDomain)}` : ""}`,
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

        const data = (await response.json()) as ProvinceIssueHeatmapResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load province issue heatmap",
        });
      }
    }

    void load();
  }, [province, days, serviceDomain]);

  const matrix = useMemo(() => {
    if (state.status !== "loaded") {
      return {
        rows: [] as string[],
        columns: [] as string[],
        valueMap: new Map<string, number>(),
        maxValue: 0,
      };
    }

    const valueMap = new Map<string, number>();
    let maxValue = 0;

    for (const cell of state.data.cells) {
      const key = `${cell.municipality}::${cell.serviceDomain}`;
      valueMap.set(key, cell.pressureCaseCount);
      maxValue = Math.max(maxValue, cell.pressureCaseCount);
    }

    return {
      rows: state.data.municipalities.slice(0, 10),
      columns: state.data.serviceDomains.slice(0, 8),
      valueMap,
      maxValue,
    };
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[260px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading issue heatmap...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[260px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  if (matrix.rows.length === 0 || matrix.columns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
        <p className="text-sm font-bold text-slate-500">
          No municipality issue heatmap rows available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
          Municipality x Issue Intensity
        </h4>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
          Heatmap of concern intensity by municipality and service category
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <div
          className="grid min-w-[780px] gap-px bg-slate-100"
          style={{
            gridTemplateColumns: `220px repeat(${matrix.columns.length}, minmax(84px, 1fr))`,
          }}
        >
          <div className="bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Municipality
          </div>
          {matrix.columns.map((column) => (
            <div
              key={column}
              className="bg-slate-50 px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.15em] text-slate-400"
            >
              {column}
            </div>
          ))}

          {matrix.rows.map((municipality) => (
            <Fragment key={municipality}>
              <div
                key={`${municipality}-label`}
                className="bg-white px-4 py-3 text-sm font-bold text-slate-900"
              >
                {municipality}
              </div>
              {matrix.columns.map((column) => {
                const value =
                  matrix.valueMap.get(`${municipality}::${column}`) ?? 0;
                return (
                  <div
                    key={`${municipality}-${column}`}
                    className={`px-2 py-3 text-center text-sm font-bold ${getIntensityClass(
                      value,
                      matrix.maxValue,
                    )}`}
                    title={`${municipality} / ${column}: ${value}`}
                  >
                    {value}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
        <span className="rounded-full bg-slate-100 px-3 py-1">Low</span>
        <span className="rounded-full bg-emerald-200 px-3 py-1 text-slate-900">
          Moderate
        </span>
        <span className="rounded-full bg-amber-300 px-3 py-1 text-slate-900">
          Elevated
        </span>
        <span className="rounded-full bg-rose-400 px-3 py-1 text-white">
          High
        </span>
        <span className="rounded-full bg-rose-600 px-3 py-1 text-white">
          Critical
        </span>
      </div>
    </div>
  );
}
