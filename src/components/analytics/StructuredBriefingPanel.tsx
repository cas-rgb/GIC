"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, FileText, RefreshCw, ShieldCheck } from "lucide-react";

import { BriefingOutput } from "@/lib/intelligence/briefing-contract";

interface StructuredBriefingResponse extends BriefingOutput {
  trace?: {
    sources?: string[];
    query?: string;
  };
}

interface StructuredBriefingPanelProps {
  url: string;
  loadingLabel: string;
  headlineLabel?: string;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: StructuredBriefingResponse }
  | { status: "error"; message: string };

export default function StructuredBriefingPanel({
  url,
  loadingLabel,
  headlineLabel = "AI Briefing",
}: StructuredBriefingPanelProps) {
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
        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(await parseError(response, `request failed with status ${response.status}`));
        }

        const data = (await response.json()) as StructuredBriefingResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to load briefing",
        });
      }
    }

    void load();
  }, [url]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[220px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">{state.message}</p>
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
              {headlineLabel}
            </p>
            <p className="mt-2 text-lg font-display font-bold text-slate-900">{data.headline}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">{data.summary}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Briefing Use
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          This AI briefing is grounded in filtered governed metrics and evidence for the current dashboard view. Use it as a fast executive readout, then validate the detail in the charts and evidence panels below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Key Findings</p>
          <div className="mt-4 space-y-3">
            {data.keyFindings.map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Risks</p>
          <div className="mt-4 space-y-3">
            {data.risks.map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</p>
          <div className="mt-4 space-y-3">
            {data.actions.map((line) => (
              <p key={line} className="text-sm font-medium text-slate-700">
                {line}
              </p>
            ))}
          </div>
        </section>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
          <p className="text-sm font-medium text-slate-700">{data.confidenceNote}</p>
        </div>
      </div>
    </div>
  );
}
