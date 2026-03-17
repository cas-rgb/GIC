"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";

import { LeadershipEvidenceResponse } from "@/lib/analytics/types";

interface LeadershipEvidencePanelProps {
  province: string;
  leaderName?: string | null;
  office?: string | null;
  days?: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: LeadershipEvidenceResponse }
  | { status: "error"; message: string };

export default function LeadershipEvidencePanel({
  province,
  leaderName,
  office,
  days = 30,
}: LeadershipEvidencePanelProps) {
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
      params.set("days", String(days));
      if (leaderName) {
        params.set("leaderName", leaderName);
      }
      if (office) {
        params.set("office", office);
      }

      try {
        const response = await fetch(`/api/analytics/leadership-evidence?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            await parseError(response, `request failed with status ${response.status}`)
          );
        }

        const data = (await response.json()) as LeadershipEvidenceResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Failed to load leadership evidence",
        });
      }
    }

    void load();
  }, [province, leaderName, office, days]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[180px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading leadership evidence...
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
  const hasLeaderFilter = Boolean(leaderName || office);
  const activeSubject = leaderName ?? office ?? "All political leadership";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          What This Answers
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          This evidence pack shows the governed documents currently shaping the public-relations
          narrative for <span className="font-bold">{activeSubject}</span> in{" "}
          <span className="font-bold">{province}</span> over the last{" "}
          <span className="font-bold">{days} days</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Active PR Subject
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {state.data.leaderName ?? "All political leadership"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">
            PR Evidence Docs
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">{state.data.summary.documentCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">
            Narrative Reach
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">{state.data.summary.municipalityCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-500 xl:col-span-3">
            {hasLeaderFilter ? (
              <>
                No governed PR evidence highlights matched{" "}
                <span className="font-bold text-slate-700">{activeSubject}</span> in{" "}
                <span className="font-bold text-slate-700">{province}</span> for the last{" "}
                <span className="font-bold text-slate-700">{days} days</span>. Clear the current
                leader filter to return to the wider province leadership evidence pack.
              </>
            ) : (
              <>
                No governed PR evidence highlights matched the current province and time window yet.
                This usually means the leadership evidence layer is still thin for this slice rather
                than that no political narrative exists.
              </>
            )}
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.documentId} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">{row.title}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {[province, row.municipality, row.sourceName].filter(Boolean).join(" | ")}
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
              <p className="mt-3 text-sm font-medium leading-6 text-slate-700">{row.excerpt}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
