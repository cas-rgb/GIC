"use client";

import React from "react";
import {
  Filter,
  ChevronDown,
  DollarSign,
  Globe,
  ShieldAlert,
} from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface StrategicFilterBarProps {
  filters: {
    label: string;
    icon: React.ReactNode;
    options: FilterOption[];
    currentValue: string;
    onChange: (value: string) => void;
  }[];
}

export default function StrategicFilterBar({
  filters,
}: StrategicFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white/40 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-xl">
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/5 rounded-2xl border border-slate-900/5">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Filter Strategy
        </span>
      </div>

      <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />

      {filters.map((filter, i) => (
        <div key={i} className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            {React.isValidElement(filter.icon) &&
              React.cloneElement(filter.icon as React.ReactElement<any>, {
                className: "w-3.5 h-3.5 text-slate-400",
              })}
          </div>
          <select
            value={filter.currentValue}
            onChange={(e) => filter.onChange(e.target.value)}
            className="appearance-none bg-white/60 hover:bg-white border border-white/60 rounded-2xl py-2.5 pl-10 pr-10 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-gic-blue/20 transition-all cursor-pointer min-w-[160px]"
          >
            <option value="" disabled className="text-slate-400">
              {filter.label}
            </option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover:text-gic-blue transition-colors" />
        </div>
      ))}

      <button className="ml-auto text-[10px] font-black text-gic-blue uppercase tracking-widest hover:text-gic-dark transition-colors px-4">
        Reset All
      </button>
    </div>
  );
}
