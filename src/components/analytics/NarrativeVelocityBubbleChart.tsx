"use client";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import SafeChartWrapper from "@/components/ui/SafeChartWrapper";
import ChartTooltip from "@/components/ui/ChartTooltip";

interface NarrativeVelocityBubbleChartProps {
  words: any[];
  sentimentTimeline: any[];
}
export default function NarrativeVelocityBubbleChart({
  words,
  sentimentTimeline,
}: NarrativeVelocityBubbleChartProps) {
  // Synthesize narrative velocity by taking top words and scattering them across recent days
  // Bubbles represent topics (words), X = Days Ago, Y = Sentiment, Z = Mention Volume
  if (words.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-800 border border-slate-700">
        <p className="text-sm font-bold text-slate-500">Awaiting narrative signals...</p>
      </div>
    );
  }

  const topTopics = words.slice(0, 10);
  const chartData = topTopics.map((topic, i) => {
    // Randomly assign a "peak day" (1 to 7) for this topic to show velocity spread
    const dayIndex = (i * 3) % 7;
    const baseSentiment = sentimentTimeline[dayIndex]?.score || 50;
    // Add some noise to the sentiment so they don't all sit on the exact same line
    const bubbleSentiment = Math.max(0, Math.min(100, baseSentiment + (Math.random() * 30 - 15)));
    return {
      name: topic.word,
      day: dayIndex + 1, // X Axis (Day 1-7)
      sentiment: bubbleSentiment, // Y Axis (0-100)
      volume: topic.count * 10, // Z Axis (Size relative)
      originalCount: topic.count
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <ChartTooltip className="p-3 min-w-[150px]">
          <p className="text-white font-black text-sm uppercase tracking-wider mb-2">{data.name}</p>
          <div className="space-y-1">
            <p className="text-slate-400 text-[10px] font-bold">
              SIGNAL VELOCITY: <span className="text-white">{data.originalCount} traces</span>
            </p>
            <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1">
              SENTIMENT: 
              <span className={data.sentiment < 40 ? "text-rose-500" : data.sentiment > 60 ? "text-emerald-500" : "text-amber-500"}>
                {data.sentiment.toFixed(1)}
              </span>
            </p>
          </div>
        </ChartTooltip>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full relative p-2 min-h-[300px]">
      <SafeChartWrapper minHeight="100%" fallbackMessage="Velocity Bubble Chart Error">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis type="number" dataKey="day" name="Day" domain={[1, 7]} tickCount={7} stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} tickFormatter={(val) => `Day ${val}`} />
            <YAxis type="number" dataKey="sentiment" name="Sentiment" domain={[0, 100]} stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <ZAxis type="number" dataKey="volume" range={[100, 2000]} name="Volume" />
            <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} content={<CustomTooltip />} />
            <ReferenceLine y={40} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={60} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
            <Scatter name="Topics" data={chartData} animationDuration={1500}>
              {chartData.map((entry, index) => {
                const fill = entry.sentiment < 40 ? '#f43f5e' : entry.sentiment > 60 ? '#10b981' : '#f59e0b';
                return <Cell key={`cell-${index}`} fill={fill} opacity={0.7} stroke={fill} strokeWidth={2} />;
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </SafeChartWrapper>
    </div>
  );
}
