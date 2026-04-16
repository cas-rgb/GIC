"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  FileText,
  MessageSquareQuote,
  RefreshCw,
} from "lucide-react";

import { ProvinceEvidenceResponse } from "@/lib/analytics/types";

interface ProvinceEvidencePanelProps {
  province: string;
  topic?: string | null;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: ProvinceEvidenceResponse }
  | { status: "error"; message: string };

export default function ProvinceEvidencePanel({
  province,
  topic,
}: ProvinceEvidencePanelProps) {
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
        const query = new URLSearchParams({ province });
        if (topic) {
          query.set("topic", topic);
        }

        const response = await fetch(
          `/api/analytics/province-evidence?${query}`,
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

        const data = (await response.json()) as ProvinceEvidenceResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load province evidence",
        });
      }
    }

    void load();
  }, [province, topic]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading province evidence...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[280px] items-center justify-center text-center">
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Filter
          </p>
          <p className="mt-2 text-base font-bold text-slate-900">
            {data.topic ?? "All province evidence"}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            Documents
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.summary.documentCount}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Mentions
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.summary.mentionCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Sources
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.summary.sourceCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Municipalities
          </p>
          <p className="mt-2 text-2xl font-display font-bold text-slate-900">
            {data.summary.municipalityCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Supporting Documents
          </p>
          {(data.documents || []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm font-medium text-slate-500">
              No governed province documents match this filter yet.
            </div>
          ) : (
            (data.documents || []).map((document) => {
              const hasUrl = Boolean(document.url && document.url.trim() !== "");
              const CardWrapper = hasUrl ? 'a' : 'div';
              const linkProps = hasUrl ? { href: document.url, target: "_blank", rel: "noreferrer" } : {};
              
              return (
              <CardWrapper
                key={document.documentId}
                {...linkProps}
                className={`block rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors ${hasUrl ? "hover:bg-slate-50 cursor-pointer" : "opacity-80 cursor-default"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {document.title}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {document.sourceName} · {document.sourceType}
                        {document.municipality
                          ? ` · ${document.municipality}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-300" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">
                  {document.excerpt}...
                </p>
                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {document.mentionCount} sentiment mentions linked
                </p>
              </CardWrapper>
            )})
          )}
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Sentiment Mentions
          </p>
          {(data.mentions || []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm font-medium text-slate-500">
              No governed sentiment mentions match this province filter yet.
            </div>
          ) : (
            (data.mentions || []).map((mention, index) => (
              <div
                key={`${mention.title}-${mention.topic}-${index}`}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <MessageSquareQuote className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {mention.topic}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {mention.sourceName} · {mention.title}
                        {mention.municipality
                          ? ` · ${mention.municipality}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${
                      mention.sentimentLabel === "negative"
                        ? "bg-rose-50 text-rose-600"
                        : mention.sentimentLabel === "positive"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {mention.sentimentLabel}
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">
                  {mention.evidenceText}
                </p>
                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Score {mention.sentimentScore} · Confidence{" "}
                  {Math.round(mention.confidence * 100)}%
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 p-4">
        {(data.caveats || []).map((caveat) => (
          <p key={caveat} className="text-sm font-medium text-slate-500">
            {caveat}
          </p>
        ))}
      </div>
    </div>
  );
}
