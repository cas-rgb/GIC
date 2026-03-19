"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Database, RefreshCw } from "lucide-react";

import { MunicipalityLegacyCommunitySignalsResponse } from "@/lib/analytics/types";

interface MunicipalityLegacyCommunitySignalsPanelProps {
  province: string;
  municipality: string;
  days?: number;
  selectedIssue?: string | null;
  onSelectIssue?: (issue: string) => void;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: MunicipalityLegacyCommunitySignalsResponse }
  | { status: "error"; message: string };

export default function MunicipalityLegacyCommunitySignalsPanel({
  province,
  municipality,
  days = 30,
  selectedIssue = null,
  onSelectIssue,
}: MunicipalityLegacyCommunitySignalsPanelProps) {
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
          `/api/analytics/municipality-legacy-community-signals?province=${encodeURIComponent(
            province,
          )}&municipality=${encodeURIComponent(municipality)}&days=${days}`,
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

        const data =
          (await response.json()) as MunicipalityLegacyCommunitySignalsResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load legacy community signals",
        });
      }
    }

    void load();
  }, [province, municipality, days]);

  useEffect(() => {
    if (
      state.status === "loaded" &&
      !selectedIssue &&
      (state.data.issues || []).length > 0 &&
      onSelectIssue
    ) {
      onSelectIssue(state.data.issues[0].issue);
    }
  }, [onSelectIssue, selectedIssue, state]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading legacy community signals...
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Legacy Docs
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-slate-900">
            {data.summary.documentCount}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Sources
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-blue-700">
            {data.summary.sourceCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Avg Urgency
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-amber-700">
            {Math.round(data.summary.avgUrgency)}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            Negative Share
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-rose-700">
            {Math.round(data.summary.negativeShare * 100)}%
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Database className="h-4 w-4" />
          Imported legacy community issues
        </div>
        <div className="space-y-3">
          {(data.issues || []).length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-500">
              No imported legacy community issues are mapped to this
              municipality yet.
            </div>
          ) : (
            (data.issues || []).map((issue) => (
              <button
                key={issue.issue}
                type="button"
                onClick={() => onSelectIssue?.(issue.issue)}
                className={`grid w-full gap-3 rounded-2xl border p-4 text-left md:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))] ${
                  selectedIssue === issue.issue
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-100 bg-slate-50 hover:bg-white"
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {issue.issue}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    imported firebase community signal
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Docs
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {issue.documentCount}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Avg Urgency
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {Math.round(issue.avgUrgency)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Sentiment
                  </p>
                  <p className="mt-2 text-sm font-bold capitalize text-slate-900">
                    {issue.dominantSentiment ?? "Unknown"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        {(data.caveats || []).map((caveat) => (
          <p key={caveat} className="text-sm font-medium text-slate-700">
            {caveat}
          </p>
        ))}
      </div>
    </div>
  );
}
