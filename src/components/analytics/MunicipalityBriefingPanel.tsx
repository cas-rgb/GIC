"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  FileText,
  RefreshCw,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

import { MunicipalityBriefingResponse } from "@/lib/intelligence/municipality-briefing";

interface MunicipalityBriefingPanelProps {
  province: string;
  municipality: string;
  days?: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: MunicipalityBriefingResponse }
  | { status: "error"; message: string };

export default function MunicipalityBriefingPanel({
  province,
  municipality,
  days = 30,
}: MunicipalityBriefingPanelProps) {
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
          `/api/intelligence/municipality-briefing?province=${encodeURIComponent(
            province,
          )}&municipality=${encodeURIComponent(municipality)}&days=${days}`,
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

        const data = (await response.json()) as MunicipalityBriefingResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load municipality briefing",
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
          Building municipality briefing...
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
    <div className="space-y-5">
      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <FileText className="mt-1 h-5 w-5 text-blue-600" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
              Local Briefing
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

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          What This Answers
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          This local view answers where issue pressure is highest, what concern
          dominates, how fast pressure is escalating, and whether ward
          visibility is operational, partial, or still registry-only.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Briefing Scope
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          This briefing is grounded in governed local data for{" "}
          <span className="font-bold">{municipality}</span>,{" "}
          <span className="font-bold">{province}</span> over the last{" "}
          <span className="font-bold">{days} days</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Healthy
          </div>
          <p className="mt-2 text-2xl font-display font-bold text-emerald-700">
            {data.freshness.healthyConnectorCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
            <TimerReset className="h-3.5 w-3.5" />
            Stale
          </div>
          <p className="mt-2 text-2xl font-display font-bold text-amber-700">
            {data.freshness.staleConnectorCount}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            Failing
          </div>
          <p className="mt-2 text-2xl font-display font-bold text-rose-700">
            {data.freshness.failingConnectorCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Latest Source Success
          </p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {data.freshness.latestSourceSuccessAt ?? "Unavailable"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Citizen Mentions
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.publicPressure.citizenMentions}
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
            Legacy Community Docs
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-indigo-700">
            {data.publicPressure.legacyDocumentCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
            Legacy Urgency
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-amber-700">
            {data.publicPressure.legacyAvgUrgency.toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Citizen Risk
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.publicPressure.citizenRiskLevel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Key Findings
          </p>
          <div className="mt-4 space-y-3">
            {data.briefing.keyFindings.map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Situation
          </p>
          <div className="mt-4 space-y-3">
            {(data.summary || []).map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Interventions
          </p>
          <div className="mt-4 space-y-3">
            {(data.interventions || []).map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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
