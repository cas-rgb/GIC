"use client";

import { useEffect, useState } from "react";

import { BudgetAllocationResponse } from "@/lib/analytics/types";

type State =
  | { status: "loading" }
  | { status: "loaded"; data: BudgetAllocationResponse }
  | { status: "error"; message: string };

export default function BudgetAllocationPanel(props: {
  province: string;
  municipality?: string | null;
  ward?: string | null;
}) {
  const { province, municipality = null, ward = null } = props;
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    async function load() {
      setState({ status: "loading" });
      const params = new URLSearchParams({ province });
      if (municipality) params.set("municipality", municipality);
      if (ward) params.set("ward", ward);

      try {
        const response = await fetch(
          `/api/analytics/place-budget-allocations?${params.toString()}`,
          {
            cache: "no-store",
          },
        );
        if (!response.ok) {
          throw new Error(`request failed with status ${response.status}`);
        }
        const data = (await response.json()) as BudgetAllocationResponse;
        setState({ status: "loaded", data });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load budget allocations",
        });
      }
    }

    void load();
  }, [municipality, province, ward]);

  if (state.status === "loading") {
    return (
      <p className="text-sm text-slate-500">
        Loading budget and allocation records...
      </p>
    );
  }

  if (state.status === "error") {
    return <p className="text-sm text-slate-500">{state.message}</p>;
  }

  if ((state.data.rows || []).length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No structured budget or allocation records have been loaded for this
        geography yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {state.data.rows.slice(0, 8).map((row, index) => (
        <div
          key={`${row.projectName ?? row.summaryText}-${index}`}
          className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {row.periodYear ?? "Allocation record"}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {row.projectName ?? row.summaryText}
              </p>
            </div>
            {row.budgetAmount !== null ? (
              <p className="text-sm font-bold text-emerald-700">
                R {row.budgetAmount.toLocaleString()}
              </p>
            ) : null}
          </div>
          {row.projectName ? (
            <p className="mt-2 text-sm text-slate-700">{row.summaryText}</p>
          ) : null}
          <p className="mt-2 text-xs text-slate-500">
            {[
              row.issueFamily,
              row.serviceDomain,
              row.projectStatus,
              row.sourceName,
            ]
              .filter(Boolean)
              .join(" | ")}
          </p>
        </div>
      ))}
    </div>
  );
}
