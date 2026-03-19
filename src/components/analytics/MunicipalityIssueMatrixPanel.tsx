"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { MunicipalityIssueMatrixResponse } from "@/lib/analytics/types";

interface MunicipalityIssueMatrixPanelProps {
  province: string;
  municipality: string;
  days?: number;
  serviceDomain?: string | null;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: MunicipalityIssueMatrixResponse }
  | { status: "error"; message: string };

function getCellClass(value: number, maxValue: number): string {
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

export default function MunicipalityIssueMatrixPanel({
  province,
  municipality,
  days = 30,
  serviceDomain = null,
}: MunicipalityIssueMatrixPanelProps) {
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
          `/api/analytics/municipality-issue-matrix?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(municipality)}&days=${days}${serviceDomain ? `&serviceDomain=${encodeURIComponent(serviceDomain)}` : ""}`,
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

        const data = (await response.json()) as MunicipalityIssueMatrixResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load municipality issue matrix",
        });
      }
    }

    void load();
  }, [province, municipality, days, serviceDomain]);

  const maxValues = useMemo(() => {
    if (state.status !== "loaded") {
      return { volume: 1, severity: 1, protests: 1, responses: 1 };
    }

    return {
      volume: Math.max(
        ...(state.data.rows || []).map((row) => row.pressureCaseCount),
        1,
      ),
      severity: Math.max(
        ...(state.data.rows || []).map((row) => row.highSeverityCount),
        1,
      ),
      protests: Math.max(...(state.data.rows || []).map((row) => row.protestCount), 1),
      responses: Math.max(
        ...(state.data.rows || []).map((row) => row.responseCount),
        1,
      ),
    };
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[260px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading municipality issue matrix...
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

  if ((state.data.rows || []).length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
        <p className="text-sm font-bold text-slate-500">
          No local issue-category rows available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
          Issue Category Matrix
        </h4>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
          Local issue intensity across concern volume, severity, protest
          pressure, and responses
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <div
          className="grid min-w-[720px] gap-px bg-slate-100"
          style={{ gridTemplateColumns: "220px repeat(4, minmax(90px, 1fr))" }}
        >
          <div className="bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Issue Category
          </div>
          <div className="bg-slate-50 px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Volume
          </div>
          <div className="bg-slate-50 px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Severe
          </div>
          <div className="bg-slate-50 px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Protests
          </div>
          <div className="bg-slate-50 px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Responses
          </div>

          {(state.data.rows || []).map((row) => (
            <Fragment key={row.serviceDomain}>
              <div
                key={`${row.serviceDomain}-label`}
                className="bg-white px-4 py-3 text-sm font-bold text-slate-900"
              >
                {row.serviceDomain}
              </div>
              <div
                key={`${row.serviceDomain}-volume`}
                className={`px-3 py-3 text-center text-sm font-bold ${getCellClass(
                  row.pressureCaseCount,
                  maxValues.volume,
                )}`}
              >
                {row.pressureCaseCount}
              </div>
              <div
                key={`${row.serviceDomain}-severity`}
                className={`px-3 py-3 text-center text-sm font-bold ${getCellClass(
                  row.highSeverityCount,
                  maxValues.severity,
                )}`}
              >
                {row.highSeverityCount}
              </div>
              <div
                key={`${row.serviceDomain}-protests`}
                className={`px-3 py-3 text-center text-sm font-bold ${getCellClass(
                  row.protestCount,
                  maxValues.protests,
                )}`}
              >
                {row.protestCount}
              </div>
              <div
                key={`${row.serviceDomain}-responses`}
                className={`px-3 py-3 text-center text-sm font-bold ${getCellClass(
                  row.responseCount,
                  maxValues.responses,
                )}`}
              >
                {row.responseCount}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
