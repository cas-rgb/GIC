"use client";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
  Cell,
} from "recharts";
import SafeChartWrapper from "@/components/ui/SafeChartWrapper";
import ChartTooltip from "@/components/ui/ChartTooltip";
import { LeadershipSentimentLeaderRow } from "@/lib/analytics/types";

interface ExecutionTrustScatterPlotProps {
  leaders: LeadershipSentimentLeaderRow[];
  onSelectLeader?: (leader: LeadershipSentimentLeaderRow) => void;
  selectedLeaderName?: string | null;
}

export default function ExecutionTrustScatterPlot({
  leaders,
  onSelectLeader,
  selectedLeaderName,
}: ExecutionTrustScatterPlotProps) {
  // Synthesize an "Execution Score" since the current API only yields "Sentiment" and "Confidence"
  // For the purpose of the 4-quadrant scatter, we map:
  // X-Axis = Public Trust (Sentiment scaled -100 to 100)
  // Y-Axis = Execution/Delivery Score (Synthetic or based on Confidence 0-100)
  const chartData = leaders.map(l => ({
    ...l,
    trust: Math.round(l.sentimentScore * 100),
    execution: Math.round(l.confidence * 10),
    size: l.mentionCount, // Bubble size based on mention volume
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <ChartTooltip className="p-4 min-w-[200px]">
          <p className="font-bold text-sm text-white mb-1">{data.leaderName}</p>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">{data.office}</p>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-300 font-medium">Public Trust:</span>
            <span className={`text-xs font-bold ${data.trust >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.trust}%
            </span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-300 font-medium">Execution:</span>
            <span className="text-xs font-bold text-white">{data.execution}/100</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700">
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 font-bold uppercase tracking-wider">
              {data.mentionCount} Mentions
            </span>
          </div>
        </ChartTooltip>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full relative p-2 min-h-[400px]">
      <div className="hidden md:block absolute top-2 left-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">High Execution / Low Trust</div>
      <div className="hidden md:block absolute top-2 right-6 text-[10px] font-bold uppercase tracking-widest text-emerald-500">High Execution / High Trust</div>
      <div className="hidden md:block absolute bottom-6 left-6 text-[10px] font-bold uppercase tracking-widest text-rose-500">Low Execution / Low Trust</div>
      <div className="hidden md:block absolute bottom-6 right-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Low Execution / High Trust</div>
      
      <SafeChartWrapper minHeight="100%" fallbackMessage="Scatter Plot Layout Error">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" dataKey="trust" name="Public Trust" domain={[-100, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
            <YAxis type="number" dataKey="execution" name="Execution Score" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
            <ZAxis type="number" dataKey="size" range={[100, 800]} name="Mentions" />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            
            {/* Quadrant Dividers */}
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" />
            
            <Scatter
              name="Leaders"
              data={chartData}
              onClick={(data: any) => onSelectLeader && onSelectLeader(data.payload as LeadershipSentimentLeaderRow)}
              className="cursor-pointer"
              activeShape={(props: any) => {
                const { cx, cy, fill, cx: initialCx } = props;
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={12} 
                    fill={fill} 
                    stroke="#ffffff" 
                    strokeWidth={3} 
                    className="transition-all duration-300 drop-shadow-lg" 
                  />
                )
              }}
            >
              {chartData.map((entry, index) => {
                const isSelected = selectedLeaderName === entry.leaderName;
                const color = entry.trust >= 0 && entry.execution >= 50 ? '#10b981' : entry.trust < 0 && entry.execution < 50 ? '#f43f5e' : '#3b82f6';
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    fillOpacity={isSelected ? 1 : 0.6}
                    stroke={isSelected ? '#1e293b' : color}
                    strokeWidth={isSelected ? 3 : 1}
                    className="transition-all duration-300"
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
