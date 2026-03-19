"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";

import { CitizenVoiceEvidenceResponse } from "@/lib/analytics/types";

interface CitizenVoiceEvidencePanelProps {
  province?: string;
  municipality?: string | null;
  serviceDomain?: string | null;
  ward?: string | null;
  issueFamily?: string | null;
  sourceType?: string | null;
  days?: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: CitizenVoiceEvidenceResponse }
  | { status: "error"; message: string };

function sentimentTone(label: string): string {
  if (label === "negative") return "bg-rose-50 text-rose-700 border-rose-100";
  if (label === "positive")
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  return "bg-slate-50 text-slate-700 border-slate-100";
}

export default function CitizenVoiceEvidencePanel({
  province,
  municipality,
  ward = null,
  issueFamily,
  sourceType = null,
  days = 30,
}: CitizenVoiceEvidencePanelProps) {
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
      params.set("days", String(days));
      if (province) {
        params.set("province", province);
      }
      if (municipality) {
        params.set("municipality", municipality);
      }
      if (ward) {
        params.set("ward", ward);
      }
      if (issueFamily) {
        params.set("issueFamily", issueFamily);
      }
      if (sourceType) {
        params.set("sourceType", sourceType);
      }

      try {
        const response = await fetch(
          `/api/analytics/citizen-voice-evidence?${params.toString()}`,
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

        const data = (await response.json()) as CitizenVoiceEvidenceResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load citizen voice evidence",
        });
      }
    }

    void load();
  }, [province, municipality, ward, issueFamily, sourceType, days]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[220px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading governed public evidence...
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
  const scopeLabel = ward ?? municipality ?? province ?? "all provinces";
  const filterBits = [
    issueFamily ? `${issueFamily} issue focus` : null,
    sourceType ? `${sourceType} evidence source` : null,
    ward ? `ward-level view` : municipality ? `municipality-level view` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          What This Answers
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          This evidence layer shows the governed posts, articles, and public
          documents behind the active narrative in{" "}
          <span className="font-bold">{scopeLabel}</span> over the last{" "}
          <span className="font-bold">{days} days</span>
          {filterBits.length > 0 ? (
            <>
              , currently narrowed by{" "}
              <span className="font-bold">{filterBits.join(" and ")}</span>.
            </>
          ) : (
            "."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Evidence docs
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-slate-900">
            {data.summary.documentCount}
          </p>
          {data.ward ? (
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {data.ward}
            </p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Sources
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-blue-700">
            {data.summary.sourceCount}
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
            Legacy Docs
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-indigo-700">
            {data.summary.legacyDocumentCount}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            Avg Negative Score
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-rose-700">
            {Math.round(data.summary.avgNegativeScore)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Dominant source
          </p>
          <p className="mt-2 text-lg font-display font-bold text-slate-900">
            {data.summary.dominantSourceType ?? "Unavailable"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {(data.documents || []).length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-500">
            No governed public-evidence documents matched the current filter set
            for <span className="font-bold text-slate-700">{scopeLabel}</span>.
            If this view is narrowed by issue family or evidence source, broaden
            those filters first. A narrow empty state here usually means the
            evidence layer is sparse for this slice, not that the issue is
            absent.
          </div>
        ) : (
          (data.documents || []).map((row) => (
            <div
              key={row.documentId}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {row.title}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {row.province}
                    {row.municipality ? ` | ${row.municipality}` : ""}
                    {` | ${row.sourceName} | ${row.sourceType}`}
                  </p>
                </div>
                <a
                  href={row.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600"
                >
                  Open
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${sentimentTone(
                    row.sentimentLabel,
                  )}`}
                >
                  {row.sentimentLabel}
                </span>
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">
                  {row.issueFamily}
                </span>
                <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
                  score {Math.round(row.sentimentScore)}
                </span>
                <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
                  confidence {Math.round(row.confidence * 100)}%
                </span>
              </div>

              <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
                {row.excerpt}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
