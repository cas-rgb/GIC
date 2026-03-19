"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import SafeChartWrapper from "@/components/ui/SafeChartWrapper";

interface VitalSignGaugesProps {
  data: {
    waterStress: number;
    powerStress: number;
    roadsStress: number;
  };
}

const GAUGE_COLORS: Record<string, string> = {
  high: "#ef4444",   /* rose-500 */
  medium: "#f59e0b", /* amber-500 */
  low: "#10b981",    /* emerald-500 */
};

export default function VitalSignGauges({ data }: VitalSignGaugesProps) {
  const renderGauge = (title: string, score: number, index: number) => {
    /* Score is 0-100 where higher is worse (more stress) */
    const color =
      score > 70
        ? GAUGE_COLORS.high
        : score > 40
        ? GAUGE_COLORS.medium
        : GAUGE_COLORS.low;
    
    const chartData = [
      { name: "Stress", value: score },
      { name: "Remaining", value: 100 - score },
    ];

    return (
      <div className="flex flex-col items-center p-4 bg-slate-50 border border-slate-100 w-full">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
          {title}
        </h4>
        <div className="h-28 w-full relative">
          <SafeChartWrapper minHeight="100%" fallbackMessage={`${title} Layout Error`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius="75%"
                  outerRadius="100%"
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={true}
                  animationBegin={index * 200}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  <Cell fill={color} />
                  <Cell fill="#e2e8f0" /> {/* slate-200 */}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </SafeChartWrapper>
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-2">
            <span
              className={`text-2xl font-black ${
                color === GAUGE_COLORS.low
                  ? "text-emerald-500"
                  : color === GAUGE_COLORS.medium
                  ? "text-amber-500"
                  : "text-rose-500"
              }`}
            >
              {score}%
            </span>
            <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
              Stress Level
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {renderGauge("Water / Sanitation", data.waterStress, 0)}
      {renderGauge("Power / Grid", data.powerStress, 1)}
      {renderGauge("Roads / Transport", data.roadsStress, 2)}
    </div>
  );
}
