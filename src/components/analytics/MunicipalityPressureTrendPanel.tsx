"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { MunicipalityPressureTrendResponse } from "@/lib/analytics/types";

interface MunicipalityPressureTrendPanelProps {
  province: string;
  municipality: string;
  days?: number;
  serviceDomain?: string | null;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: MunicipalityPressureTrendResponse }
  | { status: "error"; message: string };

export default function MunicipalityPressureTrendPanel({
  province,
  municipality,
  days = 30,
  serviceDomain = null,
}: MunicipalityPressureTrendPanelProps) {
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
        const response = await fetch(
          `/api/analytics/municipality-pressure-trend?province=${encodeURIComponent(
            province
          )}&municipality=${encodeURIComponent(municipality)}&days=${days}${serviceDomain ? `&serviceDomain=${encodeURIComponent(serviceDomain)}` : ""}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            await parseError(response, `request failed with status ${response.status}`)
          );
        }

        const data = (await response.json()) as MunicipalityPressureTrendResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load municipality pressure trend",
        });
      }
    }

    void load();
  }, [province, municipality, days, serviceDomain]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[260px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading municipality pressure trend...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[260px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">{state.message}</p>
        </div>
      </div>
    );
  }

  const { data } = state;
  const maxValue = Math.max(...data.series.map((point) => point.pressureCaseCount), 1);

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
          Pressure Trend
        </h4>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
          Daily municipality pressure volume{serviceDomain ? ` for ${serviceDomain}` : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex h-44 items-end gap-2">
          {data.series.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-500">
              No municipality pressure rows available yet.
            </div>
          ) : (
            data.series.map((point) => (
              <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full rounded-t-xl bg-slate-900"
                    style={{
                      height: `${Math.max(
                        10,
                        Math.round((point.pressureCaseCount / maxValue) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  {point.date.slice(5)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
