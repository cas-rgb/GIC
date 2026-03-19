"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import SafeChartWrapper from "@/components/ui/SafeChartWrapper";
import ChartTooltip from "@/components/ui/ChartTooltip";
import { WardCoverageRow } from "@/lib/analytics/types";
import { formatWardDisplayLabel } from "@/lib/analytics/ward-label";

interface ResourceNeedBarChartProps {
  wards: WardCoverageRow[];
  onSelectWard?: (ward: string | null) => void;
}

export default function ResourceNeedBarChart({
  wards,
  onSelectWard,
}: ResourceNeedBarChartProps) {
  // Synthesize a dataset comparing "Service Demand (Pressure)" against "Administrative Bandwidth"
  const chartData = wards
    .map(w => {
      // Proxy 'Bandwidth/Allocation' as general document count minus pressure cases
      // Proxy 'Need/Pressure' as sentiment mentions + pressure cases
      const genericAdminVolume = Math.max(0, w.documentCount - w.pressureCaseCount);
      const acutePressure = w.pressureCaseCount + w.sentimentMentionCount;
      return {
        name: formatWardDisplayLabel(w.ward),
        originalId: w.ward,
        administrativeFocus: Math.max(10, genericAdminVolume),
        serviceNeed: Math.max(5, acutePressure),
        totalSort: genericAdminVolume + acutePressure
      };
    })
    // Sort by largest total volume
    .sort((a, b) => b.totalSort - a.totalSort)
    // Only show top 15 wards to avoid unreadable charts if a muni has 100 wards
    .slice(0, 15);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-slate-50 border border-dashed border-slate-200">
        <p className="text-sm font-bold text-slate-500">No ward data available for comparison.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] relative">
      <SafeChartWrapper minHeight="100%" fallbackMessage="Bar Chart Layout Error">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0 && onSelectWard) {
                onSelectWard(state.activePayload[0].payload.originalId);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
              width={80}
            />
            <Tooltip
              cursor={{ fill: '#1e293b', opacity: 0.2 }}
              content={<ChartTooltip />}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
            <Bar
              dataKey="administrativeFocus"
              name="Routine Admin & Allocation"
              stackId="a"
              fill="#94a3b8"
              radius={[4, 0, 0, 4]}
              barSize={16}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
            <Bar
              dataKey="serviceNeed"
              name="Acute Need & Complaints"
              stackId="a"
              fill="#f43f5e"
              radius={[0, 4, 4, 0]}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </SafeChartWrapper>
    </div>
  );
}
