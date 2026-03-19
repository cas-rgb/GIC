"use client";
import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceArea,
} from "recharts";
import SafeChartWrapper from "@/components/ui/SafeChartWrapper";
import ChartTooltip from "@/components/ui/ChartTooltip";

interface TreasuryOpportunityMapProps {
  geographyRows: any[];
  onNodeClick?: (geographyName: string) => void;
}

export default function TreasuryOpportunityMap({
  geographyRows,
  onNodeClick,
}: TreasuryOpportunityMapProps) {
  // Create a pseudo-geographic scatter plot mapping "Geography" names to abstract X/Y coordinates
  // to represent a stylized heat map of the province
  const chartData = useMemo(() => {
    if (!geographyRows || geographyRows.length === 0) return [];
    return geographyRows.map((geo, idx) => {
      // Synthesize abstract coordinates for plotting (0-100 grid)
      // We'll deterministically scatter them based on index so it looks consistent
      const hash = idx * 137;
      const x = 20 + (hash % 60); // Keep away from extreme edges
      const y = 20 + ((hash * 7) % 60);
      return {
        name: geo.geography || "Regional Area",
        x,
        y,
        value: geo.totalKnownExpenditure || 5000000,
        projectCount: geo.projectCount || 1,
        highValue: geo.highValueProjectCount || 0,
        dominantSector: geo.dominantSector || "Mixed Infrastructure",
      };
    });
  }, [geographyRows]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-slate-50 border border-dashed border-slate-200">
        <p className="text-sm font-bold text-slate-500">
          Awaiting geographic project data...
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <ChartTooltip className="p-4 min-w-[200px] text-white">
          <p className="font-black text-sm uppercase tracking-wider mb-3 border-b border-slate-700 pb-2">
            {data.name}
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold">Total Capital:</span>
              <span className="font-black text-blue-400">
                {new Intl.NumberFormat("en-ZA", {
                  style: "currency",
                  currency: "ZAR",
                  notation: "compact",
                }).format(data.value)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold">Treasury Projects:</span>
              <span className="font-black text-white">{data.projectCount} active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold">High Value:</span>
              <span className="font-black text-emerald-400">
                {data.highValue} flagged
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700">
            <span className="text-[9px] px-2 py-1 font-black uppercase tracking-widest bg-slate-800 text-slate-300">
              {data.dominantSector}
            </span>
          </div>
        </ChartTooltip>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full relative min-h-[400px] bg-[#f8fafc] border border-slate-200 overflow-hidden">
      {/* Decorative background mapping elements */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="absolute top-4 left-4 pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Spatial Focus
        </p>
      </div>
      <SafeChartWrapper minHeight="100%" fallbackMessage="Opportunity Map Error">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
            {/* Draw abstract zones */}
            <ReferenceArea
              x1={0}
              x2={50}
              y1={50}
              y2={100}
              fill="#3b82f6"
              fillOpacity={0.02}
            />
            <ReferenceArea
              x1={50}
              x2={100}
              y1={50}
              y2={100}
              fill="#10b981"
              fillOpacity={0.02}
            />
            <XAxis type="number" dataKey="x" domain={[0, 100]} hide />
            <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
            <ZAxis type="number" dataKey="value" range={[400, 4000]} />
            <Tooltip cursor={{ strokeDasharray: "3 3", stroke: "#cbd5e1" }} content={<CustomTooltip />} />
            <Scatter name="Opportunities" data={chartData} animationDuration={1000}>
              {chartData.map((entry, index) => {
                // Color intensity based on highValue count
                const isHot = entry.highValue > 2;
                const fill = isHot ? "#f59e0b" : "#3b82f6";
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fill}
                    fillOpacity={0.6}
                    stroke={fill}
                    strokeWidth={2}
                    onClick={() => onNodeClick && onNodeClick(entry.name)}
                    style={{ cursor: onNodeClick ? "pointer" : "default" }}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </SafeChartWrapper>
    </div>
  );
}
