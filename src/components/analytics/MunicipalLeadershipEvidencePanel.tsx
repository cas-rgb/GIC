"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";

import { MunicipalLeadershipEvidenceResponse } from "@/lib/analytics/types";

interface MunicipalLeadershipEvidencePanelProps {
  province: string;
  municipality: string;
  leaderName?: string | null;
  office?: string | null;
  days?: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: MunicipalLeadershipEvidenceResponse }
  | { status: "error"; message: string };

export default function MunicipalLeadershipEvidencePanel({
  province,
  municipality,
  leaderName,
  office,
  days = 30,
}: MunicipalLeadershipEvidencePanelProps) {
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
      params.set("province", province);
      params.set("municipality", municipality);
      params.set("days", String(days));
      if (leaderName) {
        params.set("leaderName", leaderName);
      }
      if (office) {
        params.set("office", office);
      }

      try {
        const response = await fetch(
          `/api/analytics/municipal-leadership-evidence?${params.toString()}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(
            await parseError(response, `request failed with status ${response.status}`)
          );
        }

        const data = (await response.json()) as MunicipalLeadershipEvidenceResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load municipal leadership evidence",
        });
      }
    }

    void load();
  }, [province, municipality, leaderName, office, days]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[180px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading local leadership evidence...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[180px] items-center justify-center text-center">
        <div>
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <p className="mt-3 text-sm font-medium text-slate-500">{state.message}</p>
        </div>
      </div>
    );
  }

  const rows = state.data.documents.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Active Leader
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {state.data.leaderName ?? "All local political leadership"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">
            Evidence Docs
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {state.data.summary.documentCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">
            Sources
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {state.data.summary.sourceCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-500 xl:col-span-3">
            No governed local PR evidence highlights matched this subject yet.
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.documentId}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{row.title}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {[province, municipality, row.sourceName].filter(Boolean).join(" | ")}
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
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
                  {row.sourceType}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
                  {row.mentionCount} mentions
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
