"use client";

import { useEffect, useState } from "react";
import { Database, ShieldCheck } from "lucide-react";

import { SourceReliabilityResponse } from "@/lib/analytics/source-reliability";

interface SourceReliabilityPanelProps {
  province?: string;
}

export default function SourceReliabilityPanel({
  province = "Gauteng",
}: SourceReliabilityPanelProps) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "loaded"; data: SourceReliabilityResponse }
    | { status: "error"; message: string }
  >({ status: "loading" });

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
      try {
        const response = await fetch(
          `/api/analytics/source-reliability?province=${encodeURIComponent(
            province,
          )}`,
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

        const data = (await response.json()) as SourceReliabilityResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load source reliability",
        });
      }
    }

    void load();
  }, [province]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-sm font-bold text-slate-400">
        Loading source reliability...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-500">{state.message}</p>
      </div>
    );
  }

  const { data } = state;
  const totalDocuments = data.rows.reduce(
    (sum, row) => sum + row.documentCount,
    0,
  );
  const topSource = data.rows[0];

  if ((data.rows || []).length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-500">
          No source reliability rows available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topSource ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Dominant Evidence Base
          </p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-display font-bold capitalize text-slate-900">
                {topSource.sourceType}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {topSource.documentCount} of {totalDocuments} documents
              </p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2">
              <p className="text-lg font-bold text-emerald-600">
                {Math.round(topSource.avgReliabilityScore * 100)}%
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Avg. score
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Evidence Quality Mix
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {data.province}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Database className="h-3.5 w-3.5" />
          {data.trace.table}
        </div>
      </div>

      <div className="space-y-3">
        {(data.rows || []).map((row) => {
          const width = Math.max(8, Math.round(row.avgReliabilityScore * 100));
          const coverage =
            totalDocuments > 0
              ? Math.round((row.documentCount / totalDocuments) * 100)
              : 0;

          return (
            <div
              key={row.sourceType}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-bold capitalize text-slate-900">
                    {row.sourceType}
                  </span>
                </div>
                <span className="text-sm font-display font-bold text-slate-900">
                  {row.avgReliabilityScore.toFixed(2)}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${width}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <span>{row.documentCount} documents</span>
                <span>{coverage}% coverage</span>
                <span>{row.sourceCount} sources</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
