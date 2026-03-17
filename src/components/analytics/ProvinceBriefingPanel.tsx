"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, FileText, RefreshCw, ShieldCheck, TimerReset } from "lucide-react";

import { ProvinceBriefingResponse } from "@/lib/intelligence/province-briefing";

interface ProvinceBriefingPanelProps {
  province: string;
  days?: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ProvinceBriefingResponse }
  | { status: "error"; message: string };

export default function ProvinceBriefingPanel({
  province,
  days = 30,
}: ProvinceBriefingPanelProps) {
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
          `/api/intelligence/province-briefing?province=${encodeURIComponent(
            province
          )}&days=${days}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            await parseError(
              response,
              `request failed with status ${response.status}`
            )
          );
        }

        const data = (await response.json()) as ProvinceBriefingResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load province briefing",
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
          Building province briefing...
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

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
        <div className="flex items-start gap-3">
          <FileText className="mt-1 h-5 w-5 text-blue-600" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
              Executive Briefing
            </p>
            <p className="mt-2 text-lg font-display font-bold text-slate-900">
              {data.briefing.headline}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-700">
              {data.briefing.summary}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          What This Answers
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          This province view answers four things first: what people care about most, whether concern is rising or falling, which municipalities are under the most pressure, and whether government focus is aligned strongly enough with public need.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Briefing Scope
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          This briefing is grounded in governed province-wide data for{" "}
          <span className="font-bold">{province}</span> over the last{" "}
          <span className="font-bold">{days} days</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Healthy
          </div>
          <p className="mt-1 text-xl font-display font-bold text-emerald-700">
            {data.freshness.healthyConnectorCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
            <TimerReset className="h-3.5 w-3.5" />
            Stale
          </div>
          <p className="mt-1 text-xl font-display font-bold text-amber-700">
            {data.freshness.staleConnectorCount}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            Failing
          </div>
          <p className="mt-1 text-xl font-display font-bold text-rose-700">
            {data.freshness.failingConnectorCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Latest Source Success
          </p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {data.freshness.latestSourceSuccessAt ?? "Unavailable"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Citizen Mentions
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.publicPressure.citizenMentions}
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
            Legacy Community Docs
          </p>
          <p className="mt-1 text-xl font-display font-bold text-indigo-700">
            {data.publicPressure.legacyDocumentCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
            Legacy Urgency
          </p>
          <p className="mt-1 text-xl font-display font-bold text-amber-700">
            {data.publicPressure.legacyAvgUrgency.toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Citizen Risk
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {data.publicPressure.citizenRiskLevel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            AI Key Findings
          </p>
          <div className="mt-4 space-y-3">
            {data.briefing.keyFindings.map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Situation Summary
          </p>
          <div className="mt-4 space-y-3">
            {data.summary.map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Hotspots
          </p>
          <div className="mt-4 space-y-3">
            {data.hotspots.map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Recommended Actions
          </p>
          <div className="mt-4 space-y-3">
            {data.briefing.actions.map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Priority Interventions
          </p>
          <div className="mt-4 space-y-3">
            {data.interventions.map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Decision Risks
          </p>
          <div className="mt-4 space-y-3">
            {[...data.briefing.risks, ...data.risks].map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </section>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Confidence Note
        </p>
        <p className="mt-3 text-sm font-medium text-slate-700">
          {data.briefing.confidenceNote}
        </p>
      </div>
    </div>
  );
}
