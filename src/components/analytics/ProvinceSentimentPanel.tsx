"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, MessageSquareQuote, RefreshCw } from "lucide-react";

import {
  ProvinceSentimentResponse,
  ProvinceSentimentTopicRow,
} from "@/lib/analytics/types";

interface ProvinceSentimentPanelProps {
  province: string;
  municipality?: string | null;
  serviceDomain?: string | null;
  days?: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ProvinceSentimentResponse }
  | { status: "error"; message: string };

export default function ProvinceSentimentPanel({
  province,
  days = 30,
}: ProvinceSentimentPanelProps) {
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
          `/api/analytics/province-sentiment?province=${encodeURIComponent(
            province,
          )}&days=${days}`,
          {
            cache: "no-store",
          },
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
              : "Failed to load province sentiment",
        });
      }
    }

    void load();
  }, [province, days]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading public sentiment...
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

  const { data } = state;
  const trendMax = Math.max(
    ...(data.trend || []).map((point) => point.mentionCount),
    1,
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Current Sentiment
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.summary.currentSentimentScore ?? "N/A"}
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
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Positive Share
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-emerald-700">
            {Math.round(data.summary.positiveShare * 100)}%
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Top Complaint Topic
          </p>
          <p className="mt-2 text-lg font-display font-bold text-slate-900">
            {data.summary.topComplaintTopic ?? "Unavailable"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
              Sentiment Trend
            </h4>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Daily mention volume with sentiment scoring
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex h-44 items-end gap-2">
              {(data.trend || []).length === 0 ? (
                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-500">
                  No sentiment rows available yet.
                </div>
              ) : (
                (data.trend || []).map((point) => (
                  <div
                    key={point.date}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-xl bg-slate-900"
                        style={{
                          height: `${Math.max(
                            10,
                            Math.round((point.mentionCount / trendMax) * 100),
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

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
              Topic Mood
            </h4>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Most discussed topics in the province narrative
            </p>
          </div>

          <div className="space-y-3">
            {data.topics.slice(0, 5).map((row: ProvinceSentimentTopicRow) => (
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
                        {row.mentionCount} mentions ·{" "}
                        {Math.round(row.shareOfVoice * 100)}% share
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {row.sentimentScore}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Score
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-rose-50 p-3">
                    <p className="text-sm font-bold text-rose-700">
                      {Math.round(row.negativeShare * 100)}%
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500">
                      Negative
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <p className="text-sm font-bold text-emerald-700">
                      {Math.round(row.positiveShare * 100)}%
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
                      Positive
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm font-bold text-slate-900">
                      {Math.round(row.avgConfidence * 100)}%
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Confidence
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(data.caveats || []).length > 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-4">
          {(data.caveats || []).map((caveat: string) => (
            <p key={caveat} className="text-sm font-medium text-slate-500">
              {caveat}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
