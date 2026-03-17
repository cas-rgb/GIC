"use client";

import { ReactNode } from "react";

interface DashboardToolbarProps {
  label?: string;
  title: string;
  description?: string;
  controls?: ReactNode;
}

export default function DashboardToolbar({
  label = "Dashboard Controls",
  title,
  description,
  controls,
}: DashboardToolbarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-sm font-display font-bold text-slate-900 md:text-base">{title}</p>
          {description ? (
            <p className="mt-1 max-w-3xl text-[13px] font-medium leading-relaxed text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
        {controls ? <div className="flex flex-wrap items-end gap-2 xl:justify-end">{controls}</div> : null}
      </div>
    </div>
  );
}
