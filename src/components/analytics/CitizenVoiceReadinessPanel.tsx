"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, MessageSquare, RefreshCw } from "lucide-react";

import { CitizenVoiceReadinessResponse } from "@/lib/source-registry/types";

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: CitizenVoiceReadinessResponse }
  | { status: "error"; message: string };

export default function CitizenVoiceReadinessPanel() {
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
        const response = await fetch("/api/analytics/citizen-voice-readiness", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            await parseError(
              response,
              `request failed with status ${response.status}`,
            ),
          );
        }

        const data = (await response.json()) as CitizenVoiceReadinessResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load citizen voice readiness",
        });
      }
    }

    void load();
  }, []);

  const provinceRows = useMemo(() => {
    if (state.status !== "loaded") {
      return [];
    }

    return state.data.byScope.reduce<
      Array<{ scopeName: string; packCount: number }>
    >((rows, row) => {
      const existing = rows.find((entry) => entry.scopeName === row.scopeName);
      if (existing) {
        existing.packCount += row.packCount;
      } else {
        rows.push({ scopeName: row.scopeName, packCount: row.packCount });
      }
      return rows;
    }, []);
  }, [state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading citizen voice readiness...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  const { data } = state;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Query Packs
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-slate-900">
            {data.totals.packCount}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Provinces Covered
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-blue-700">
            {data.totals.provinceCoverageCount}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Verified Packs
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-emerald-700">
            {data.totals.verifiedCount}
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-4 w-4 text-gic-blue" />
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
              Province Listening Packs
            </p>
          </div>
          <div className="mt-4 space-y-3">
            {provinceRows.map((row) => (
              <div
                key={row.scopeName}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-bold text-slate-900">
                  {row.scopeName}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {row.packCount} packs
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
            Issue Family Coverage
          </p>
          <div className="mt-4 space-y-3">
            {(data.byIssue || []).map((row) => (
              <div
                key={row.issueFamily}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-bold text-slate-900">
                  {row.issueFamily}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {row.packCount} packs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
