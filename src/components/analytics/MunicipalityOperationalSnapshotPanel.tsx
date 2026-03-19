"use client";

import {
  MunicipalitySummaryResponse,
  WardCoverageResponse,
} from "@/lib/analytics/types";

interface MunicipalityOperationalSnapshotPanelProps {
  summary: MunicipalitySummaryResponse;
  wardCoverage: WardCoverageResponse | null;
}

function toneClass(
  value: number,
  highCutoff: number,
  mediumCutoff: number,
): string {
  if (value >= highCutoff) {
    return "border-rose-100 bg-rose-50 text-rose-700";
  }
  if (value >= mediumCutoff) {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }
  return "border-emerald-100 bg-emerald-50 text-emerald-700";
}

export default function MunicipalityOperationalSnapshotPanel({
  summary,
  wardCoverage,
}: MunicipalityOperationalSnapshotPanelProps) {
  const readiness = wardCoverage?.summary.wardReadinessLabel ?? "Unavailable";
  const rows = [
    {
      label: "Issue volume",
      value: String(summary.summary.pressureCaseCount),
      note: "Governed pressure cases in scope",
      tone: toneClass(summary.summary.pressureCaseCount, 25, 10),
    },
    {
      label: "Top concern",
      value:
        summary.summary.topComplaintTopic ??
        summary.summary.topPressureDomain ??
        "Unavailable",
      note: "Strongest local issue theme",
      tone: "border-slate-100 bg-slate-50 text-slate-700",
    },
    {
      label: "Pressure index",
      value: String(summary.summary.pressureScore),
      note: "Local delivery pressure",
      tone: toneClass(summary.summary.pressureScore, 70, 45),
    },
    {
      label: "Escalation",
      value: String(summary.summary.escalationScore),
      note: "Severity and protest lift",
      tone: toneClass(summary.summary.escalationScore, 65, 35),
    },
    {
      label: "Official share",
      value: `${Math.round(summary.summary.officialEvidenceShare)}%`,
      note: "Official evidence in current mix",
      tone:
        summary.summary.officialEvidenceShare >= 50
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-amber-100 bg-amber-50 text-amber-700",
    },
    {
      label: "Evidence confidence",
      value: `${Math.round(summary.summary.evidenceConfidenceScore)}%`,
      note: "Source reliability weighted confidence",
      tone:
        summary.summary.evidenceConfidenceScore >= 60
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-amber-100 bg-amber-50 text-amber-700",
    },
    {
      label: "Known wards",
      value: String(wardCoverage?.summary.registryWardCount ?? 0),
      note: "Registry-backed ward footprint",
      tone: "border-slate-100 bg-slate-50 text-slate-700",
    },
    {
      label: "Ward readiness",
      value: wardCoverage?.summary.wardReadinessLabel ?? "Unavailable",
      note: `${wardCoverage?.summary.evidenceBackedWardCount ?? 0} evidence-backed wards`,
      tone:
        wardCoverage?.summary.wardReadinessLabel === "Operational"
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : wardCoverage?.summary.wardReadinessLabel === "Partial"
            ? "border-amber-100 bg-amber-50 text-amber-700"
            : "border-slate-100 bg-slate-50 text-slate-700",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Snapshot Use
        </p>
        <p className="mt-2 text-sm font-medium text-slate-700">
          Use this table to read the municipality operating position at a
          glance. Treat ward-linked panels as operational intelligence only when
          ward readiness is <span className="font-bold">{readiness}</span>;
          otherwise the ward layer is still partial or registry-only.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <div className="grid grid-cols-[1fr_1fr_1.2fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <p>Metric</p>
          <p>Current Readout</p>
          <p>Interpretation</p>
        </div>
        <div className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1fr_1fr_1.2fr] lg:items-center"
            >
              <p className="text-sm font-bold text-slate-900">{row.label}</p>
              <div>
                <span
                  className={`inline-flex rounded-xl border px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] ${row.tone}`}
                >
                  {row.value}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600">{row.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
