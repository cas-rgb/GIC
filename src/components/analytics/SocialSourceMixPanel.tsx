"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, PieChart, RefreshCw } from "lucide-react";

import { SocialSourceMixResponse } from "@/lib/analytics/types";

interface SocialSourceMixPanelProps {
  province?: string;
  municipality?: string | null;
  serviceDomain?: string | null;
  days?: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: SocialSourceMixResponse }
  | { status: "error"; message: string };

const COLORS = [
  "#0f172a",
  "#2563eb",
  "#d97706",
  "#dc2626",
  "#0f766e",
  "#7c3aed",
];

function labelForSourceType(sourceType: string): string {
  switch (sourceType) {
    case "news":
      return "News";
    case "social":
      return "Social";
    case "gov":
      return "Public Statement";
    case "ngo":
      return "Civic / NGO";
    case "treasury":
      return "Treasury";
    default:
      return sourceType;
  }
}

export default function SocialSourceMixPanel({
  province,
  days = 30,
}: SocialSourceMixPanelProps) {
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

      const params = new URLSearchParams();
      if (province) {
        params.set("province", province);
      }
      params.set("days", String(days));

      try {
        const response = await fetch(
          `/api/analytics/social-source-mix?${params.toString()}`,
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

        const data = (await response.json()) as SocialSourceMixResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load social source mix",
        });
      }
    }

    void load();
  }, [province, days]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading source mix...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-center">
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
          No source-mix rows available yet.
        </p>
      </div>
    );
  }

  let cumulative = 0;
  const segments = (state.data.rows || []).map((row) => {
    const start = cumulative;
    cumulative += row.share;
    return {
      ...row,
      start,
      end: cumulative,
    };
  });

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
          Source Mix
        </h4>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
          News, social, public statement, and civic composition behind the
          current signal layer
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <div className="flex items-center justify-center rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <svg viewBox="0 0 220 220" className="h-56 w-56">
            <circle
              cx="110"
              cy="110"
              r="70"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="28"
            />
            {segments.map((segment, index) => {
              const circumference = 2 * Math.PI * 70;
              const dash = (segment.share / 100) * circumference;
              const offset =
                circumference - (segment.start / 100) * circumference;
              return (
                <circle
                  key={segment.sourceType}
                  cx="110"
                  cy="110"
                  r="70"
                  fill="none"
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth="28"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                  transform="rotate(-90 110 110)"
                />
              );
            })}
            <circle cx="110" cy="110" r="48" fill="white" />
            <g>
              <PieChart x="98" y="84" className="h-6 w-6 text-slate-400" />
            </g>
            <text
              x="110"
              y="118"
              textAnchor="middle"
              className="fill-slate-900 text-[14px] font-bold"
            >
              {(state.data.rows || []).length}
            </text>
            <text
              x="110"
              y="136"
              textAnchor="middle"
              className="fill-slate-400 text-[9px] font-black uppercase tracking-[0.18em]"
            >
              source types
            </text>
          </svg>
        </div>

        <div className="space-y-3">
          {(state.data.rows || []).map((row, index) => (
            <div
              key={row.sourceType}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {labelForSourceType(row.sourceType)}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                    {row.documentCount} docs | {row.mentionCount} mentions
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-900">{row.share}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
