"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import { GovernedMetric, ConfidenceRating } from "@/lib/reporting-schema";
import { Database, AlertCircle, Info } from "lucide-react";

interface ChartProps {
  title: string;
  metric?: GovernedMetric<any>;
  option: any;
  isLoading?: boolean;
  className?: string;
  height?: string;
}

const ChartSafetyState = ({
  rating,
  note,
}: {
  rating: ConfidenceRating;
  note?: string;
}) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-[2px] z-10 p-8 text-center">
    <AlertCircle className="w-8 h-8 text-slate-300 mb-4" />
    <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">
      {rating === "INSUFFICIENT"
        ? "Awaiting Source Integration"
        : "Partial Coverage Detected"}
    </h4>
    <p className="text-[10px] font-bold text-slate-400 mt-2 max-w-[200px] leading-relaxed uppercase italic">
      {note ||
        "Minimum data threshold not met for high-fidelity visualization."}
    </p>
  </div>
);

const ChartHeader = ({
  title,
  metric,
}: {
  title: string;
  metric?: GovernedMetric<any>;
}) => (
  <div className="flex items-center justify-between mb-6 px-4">
    <div className="space-y-1">
      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
        {title}
      </h3>
      {metric && (
        <div className="flex items-center gap-2">
          <div
            className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
              metric.rating === "HIGH"
                ? "border-emerald-500 text-emerald-500"
                : metric.rating === "PARTIAL"
                  ? "border-amber-500 text-amber-500"
                  : "border-rose-500 text-rose-500"
            }`}
          >
            {metric.rating} CONFIDENCE
          </div>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
            <Database className="w-2.5 h-2.5" /> n=
            {(metric.trace || []).reduce(
              (acc, t) => acc + (t?.sourceCount || 0),
              0,
            )}
          </span>
        </div>
      )}
    </div>
    <button className="text-slate-300 hover:text-slate-900 transition-colors">
      <Info className="w-4 h-4" />
    </button>
  </div>
);

export function GovernedChart({
  title,
  metric,
  option,
  isLoading,
  className = "",
  height = "350px",
}: ChartProps) {
  const isInsufficient = !metric || metric.rating === "INSUFFICIENT";

  return (
    <div
      className={`relative bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden ${className}`}
    >
      <ChartHeader title={title} metric={metric} />

      <div style={{ height }} className="relative">
        {isInsufficient ? (
          <ChartSafetyState
            rating="INSUFFICIENT"
            note={metric?.governanceNote}
          />
        ) : (
          <>
            {metric.rating === "LOW" && (
              <ChartSafetyState
                rating="LOW"
                note="Confidence score indicates high volatility."
              />
            )}
            {/* @ts-ignore */}
            <ReactECharts
              option={option}
              style={{ height: "100%", width: "100%" }}
              theme="light"
            />
          </>
        )}
      </div>
    </div>
  );
}

// Specialized Config Generators
export const getStackedBarOption = (
  data: { topic: string; mentions: number; percentage: number }[],
) => ({
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  grid: { top: 20, right: 30, bottom: 40, left: 120, containLabel: true },
  xAxis: {
    type: "value",
    splitLine: { show: false },
    axisLabel: { show: false },
  },
  yAxis: {
    type: "category",
    data: data.map((d) => d.topic),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: "#64748b",
      fontWeight: "black",
      fontSize: 10,
      uppercase: true,
    },
  },
  series: [
    {
      name: "Share of Voice",
      type: "bar",
      stack: "total",
      data: data.map((d) => d.mentions),
      itemStyle: { color: "#0F172A", borderRadius: [0, 8, 8, 0] },
      barWidth: 20,
      label: {
        show: true,
        position: "right",
        formatter: "{c}",
        color: "#94a3b8",
        fontSize: 10,
        fontWeight: "bold",
      },
    },
  ],
});

export const getTrendOption = (data: any[]) => ({
  tooltip: {
    trigger: "axis",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 0,
    textStyle: { fontWeight: "bold" },
  },
  grid: { top: 30, right: 20, bottom: 20, left: 40, containLabel: true },
  xAxis: {
    type: "category",
    data: data.map((d) => d.date),
    axisLine: { lineStyle: { color: "#f1f5f9" } },
    axisLabel: { color: "#94a3b8", fontSize: 9 },
  },
  yAxis: {
    type: "value",
    splitLine: { lineStyle: { color: "#f8fafc" } },
    axisLabel: { color: "#94a3b8", fontSize: 9 },
  },
  series: [
    {
      name: "Volume",
      type: "line",
      data: data.map((d) => d.count),
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 3, color: "#D0A700" },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(208, 167, 0, 0.15)" },
            { offset: 1, color: "rgba(208, 167, 0, 0)" },
          ],
        },
      },
      emphasis: {
        lineStyle: { width: 4, color: "#FFD700" },
      },
    },
  ],
});

export const getScatterOption = (data: any[]) => ({
  tooltip: {
    formatter: (params: any) => {
      const d = params.data;
      if (!d || d.length < 3) return "";
      return `<div class="p-2 font-black uppercase text-[10px]">
        <div class="mb-1">${d[2]}</div>
        <div class="text-slate-400">Concern: ${(d[0] * 100).toFixed(0)}%</div>
        <div class="text-slate-400">Budget: ${(d[1] * 100).toFixed(0)}%</div>
      </div>`;
    },
  },
  xAxis: {
    name: "CITIZEN CONCERN %",
    nameLocation: "center",
    nameGap: 35,
    nameTextStyle: {
      color: "#64748b",
      fontWeight: "black",
      fontSize: 9,
      tracking: "0.1em",
    },
    splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
    axisLabel: {
      formatter: (val: any) => `${(val * 100).toFixed(0)}%`,
      color: "#94a3b8",
      fontSize: 9,
    },
  },
  yAxis: {
    name: "BUDGET ALLOCATION %",
    nameRotate: 90,
    nameLocation: "center",
    nameGap: 45,
    nameTextStyle: {
      color: "#64748b",
      fontWeight: "black",
      fontSize: 9,
      tracking: "0.1em",
    },
    splitLine: { lineStyle: { color: "#f1f5f9", type: "dashed" } },
    axisLabel: {
      formatter: (val: any) => `${(val * 100).toFixed(0)}%`,
      color: "#94a3b8",
      fontSize: 9,
    },
  },
  series: [
    {
      type: "scatter",
      symbolSize: (val: any) => {
        if (!val || val.length === 0) return 10;
        return Math.sqrt(val[0] * 100) * 10 + 10;
      },
      data: data.map((d) => [d.citizenPerc / 100, d.budgetPerc / 100, d.topic]),
      itemStyle: {
        color: (params: any) => {
          if (!params.data) return "#94a3b8"; // Safe fallback for Legend rendering
          const citizen = params.data[0];
          const budget = params.data[1];
          if (citizen > budget * 1.5) return "#rose-500"; // Underfunded
          if (budget > citizen * 1.5) return "#0F172A"; // High spend
          return "#D0A700"; // Aligned
        },
        opacity: 0.8,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: {
        show: true,
        position: "top",
        formatter: (params: any) => params.data[2],
        fontSize: 10,
        fontWeight: "black",
        color: "#0f172a",
        backgroundColor: "rgba(255,255,255,0.7)",
        padding: [4, 8],
        borderRadius: 4,
      },
    },
  ],
});

export const getRankedMuniOption = (
  data: { name: string; value: number }[],
) => ({
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  grid: { top: 20, right: 30, bottom: 40, left: 150, containLabel: true },
  xAxis: {
    type: "value",
    splitLine: { lineStyle: { color: "#f1f5f9" } },
    axisLabel: { color: "#94a3b8", fontSize: 9 },
  },
  yAxis: {
    type: "category",
    data: data.map((d) => d.name),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: "#64748b",
      fontWeight: "black",
      fontSize: 10,
      uppercase: true,
    },
  },
  series: [
    {
      name: "Validated Issues",
      type: "bar",
      data: data.map((d) => d.value),
      itemStyle: {
        color: (params: any) =>
          params.dataIndex % 2 === 0 ? "#0F172A" : "#D0A700",
        borderRadius: [0, 4, 4, 0],
      },
      barWidth: 15,
      label: {
        show: true,
        position: "right",
        formatter: "{c}",
        color: "#94a3b8",
        fontSize: 10,
        fontWeight: "bold",
      },
    },
  ],
});
