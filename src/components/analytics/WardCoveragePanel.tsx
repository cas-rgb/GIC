"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, MapPinned, RefreshCw } from "lucide-react";

import { WardCoverageResponse } from "@/lib/analytics/types";
import { formatWardDisplayLabel } from "@/lib/analytics/ward-label";

interface WardCoveragePanelProps {
  province: string;
  municipality: string;
  selectedWard?: string | null;
  onSelectWard?: (ward: string | null) => void;
}

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; data: WardCoverageResponse }
  | { status: "error"; message: string };

export default function WardCoveragePanel({
  province,
  municipality,
  selectedWard = null,
  onSelectWard,
}: WardCoveragePanelProps) {
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
          `/api/analytics/ward-coverage?province=${encodeURIComponent(
            province,
          )}&municipality=${encodeURIComponent(municipality)}`,
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

        const data = (await response.json()) as WardCoverageResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load ward coverage",
        });
      }
    }

    void load();
  }, [province, municipality]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading ward coverage...
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

  const { data } = state;
  const readinessTone =
    data.summary.wardReadinessLabel === "Operational"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : data.summary.wardReadinessLabel === "Partial"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : data.summary.wardReadinessLabel === "Registry Only"
          ? "border-blue-100 bg-blue-50 text-blue-700"
          : "border-slate-100 bg-slate-50 text-slate-700";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 text-center md:grid-cols-6">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-lg font-bold text-slate-900">
            {data.summary.registryWardCount}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Wards Known
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-lg font-bold text-slate-900">
            {data.summary.evidenceBackedWardCount}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Evidence-backed
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-lg font-bold text-slate-900">
            {data.summary.documentCount}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Documents
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-lg font-bold text-slate-900">
            {data.summary.pressureCaseCount}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Pressure
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-lg font-bold text-slate-900">
            {data.summary.sentimentMentionCount}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Sentiment
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <span
            className={`inline-flex rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${readinessTone}`}
          >
            {data.summary.wardReadinessLabel}
          </span>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            Readiness
          </p>
        </div>
      </div>

      {data.summary.wardReadinessLabel === "Registry Only" ? (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            This municipality has known ward geography in the governed registry,
            but the current issue and evidence metrics are not yet
            ward-resolved. Use ward names for orientation only and rely on
            municipality-level KPIs plus evidence rows for decision-making.
          </p>
        </div>
      ) : null}

      {(data.rows || []).length === 0 && (data.communityRows || []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
          <p className="text-sm font-medium text-slate-500">
            No governed ward-level rows are available yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <p>Ward</p>
              <p className="text-right">Docs</p>
              <p className="text-right">Pressure</p>
              <p className="text-right">Sentiment</p>
            </div>
            <div className="max-h-[32rem] divide-y divide-slate-100 overflow-y-auto">
              {(data.rows || []).length === 0 ? (
                <div className="bg-slate-50 px-4 py-4 text-sm font-medium text-slate-500">
                  No formal ward-coded rows are available yet.
                </div>
              ) : (
                (data.rows || []).map((row) => (
                  <div
                    key={row.ward}
                    className={`grid cursor-pointer grid-cols-1 gap-3 px-4 py-4 transition-colors lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:items-start ${
                      selectedWard === row.ward
                        ? "bg-blue-50"
                        : "bg-white hover:bg-slate-50"
                    }`}
                    onClick={() =>
                      onSelectWard?.(
                        selectedWard === row.ward ? null : row.ward,
                      )
                    }
                  >
                    <div className="flex items-center gap-2">
                      <MapPinned className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-bold text-slate-900">
                        {formatWardDisplayLabel(row.ward)}
                      </p>
                    </div>
                    <p className="text-right text-sm font-bold text-slate-900">
                      {row.documentCount}
                    </p>
                    <p className="text-right text-sm font-bold text-slate-900">
                      {row.pressureCaseCount}
                    </p>
                    <p className="text-right text-sm font-bold text-slate-900">
                      {row.sentimentMentionCount}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_1fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <p>Community</p>
              <p className="text-right">Docs</p>
              <p className="text-right">Urgency</p>
              <p>Dominant Issue</p>
            </div>
            <div className="max-h-[32rem] divide-y divide-slate-100 overflow-y-auto">
              {(data.communityRows || []).length === 0 ? (
                <div className="bg-slate-50 px-4 py-4 text-sm font-medium text-slate-500">
                  No ward-ready community fallback rows are available yet.
                </div>
              ) : (
                (data.communityRows || []).map((row) => (
                  <div
                    key={row.community}
                    className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:items-start"
                  >
                    <p className="text-sm font-bold text-slate-900">
                      {row.community}
                    </p>
                    <p className="text-right text-sm font-bold text-slate-900">
                      {row.documentCount}
                    </p>
                    <p className="text-right text-sm font-bold text-amber-700">
                      {row.avgUrgency.toFixed(1)}
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {row.dominantIssue ?? "Mixed local complaints"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {data.summary.wardReadyCommunityCount > 0 ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            Formal ward mapping is still incomplete here, so the dashboard is
            also using {data.summary.wardReadyCommunityCount} ward-ready
            community rows from imported local evidence to preserve local
            visibility.
          </p>
        </div>
      ) : null}

      {(data.caveats || []).map((caveat) => (
        <p key={caveat} className="text-sm font-medium text-slate-500">
          {caveat}
        </p>
      ))}
    </div>
  );
}
