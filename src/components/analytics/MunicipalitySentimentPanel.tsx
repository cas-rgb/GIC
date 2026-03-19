"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, MessageSquareQuote, RefreshCw } from "lucide-react";

import {
  ProvinceSentimentResponse,
  ProvinceSentimentTopicRow,
} from "@/lib/analytics/types";

interface MunicipalitySentimentPanelProps {
  province: string;
  municipality: string;
  days?: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ProvinceSentimentResponse }
  | { status: "error"; message: string };

export default function MunicipalitySentimentPanel({
  province,
  municipality,
  days = 30,
}: MunicipalitySentimentPanelProps) {
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
          `/api/analytics/municipality-sentiment?province=${encodeURIComponent(
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

        const data = (await response.json()) as ProvinceSentimentResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load municipality sentiment",
        });
      }
    }

    void load();
  }, [province, municipality, days]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[260px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading municipality sentiment...
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

  const { data } = state;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-lg font-bold text-slate-900">
            {data.summary.currentSentimentScore ?? "N/A"}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Score
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="text-lg font-bold text-rose-700">
            {Math.round(data.summary.negativeShare * 100)}%
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">
            Negative
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-lg font-bold text-emerald-700">
            {Math.round(data.summary.positiveShare * 100)}%
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Positive
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-lg font-bold text-blue-700">
            {data.summary.topComplaintTopic ?? "N/A"}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">
            Top topic
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.topics.slice(0, 4).map((row: ProvinceSentimentTopicRow) => (
          <div
            key={row.topic}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {row.topic}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {row.mentionCount} mentions
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold text-slate-900">
                {row.sentimentScore}
              </p>
            </div>
          </div>
        ))}
      </div>

      {(data.caveats || []).map((caveat: string) => (
        <p key={caveat} className="text-sm font-medium text-slate-500">
          {caveat}
        </p>
      ))}
    </div>
  );
}
