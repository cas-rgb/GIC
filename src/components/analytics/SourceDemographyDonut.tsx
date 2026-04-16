"use client";
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import SafeChartWrapper from "@/components/ui/SafeChartWrapper";
import ChartTooltip from "@/components/ui/ChartTooltip";
import { useEffect, useState } from "react";
interface SourceDemographyDonutProps {
  articles: any[];
}
export default function SourceDemographyDonut({
  articles,
}: SourceDemographyDonutProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  useEffect(() => {
    /* We categorize the articles by Source or Media Type */ const sourceBuckets: Record<
      string,
      number
    > = {
      "News Media": 0,
      "Civic Forums": 0,
      "Social Media": 0,
      "Government Feeds": 0,
    };
    articles.forEach((article) => {
      const sourceName = (article.source?.name || "").toLowerCase();
      if (
        sourceName.includes("news") ||
        sourceName.includes("times") ||
        sourceName.includes("daily")
      ) {
        sourceBuckets["News Media"] += 1;
      } else if (sourceName.includes("civic") || sourceName.includes("watch")) {
        sourceBuckets["Civic Forums"] += 1;
      } else if (
        sourceName.includes("twitter") ||
        sourceName.includes("facebook") ||
        sourceName.includes("x")
      ) {
        sourceBuckets["Social Media"] += 1;
      } else if (
        sourceName.includes("gov") ||
        sourceName.includes("official")
      ) {
        sourceBuckets["Government Feeds"] += 1;
      }
    });

    const formatted = Object.entries(sourceBuckets)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    setChartData(formatted);
  }, [articles]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full min-h-[250px] flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">[ AWAITING DEMOGRAPHIC DATA ]</p>
      </div>
    );
  }

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#6366f1", "#ec4899"];
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <ChartTooltip className="p-3">
          {" "}
          <p className="text-white font-bold text-xs">{payload[0].name}</p>{" "}
          <p className="text-slate-400 font-medium text-[10px]">
            {" "}
            Volume:{" "}
            <span className="text-white">{payload[0].value} traces</span>{" "}
          </p>{" "}
        </ChartTooltip>
      );
    }
    return null;
  };
  return (
    <div className="w-full h-full relative p-2 min-h-[250px]">
      {" "}
      <SafeChartWrapper minHeight="100%" fallbackMessage="Donut Layout Error">
        {" "}
        <ResponsiveContainer width="100%" height="100%">
          {" "}
          <PieChart>
            {" "}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="transparent"
            >
              {" "}
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}{" "}
            </Pie>{" "}
            <Tooltip content={<CustomTooltip />} />{" "}
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: "10px",
                fontWeight: 600,
                color: "#94a3b8",
              }}
            />{" "}
          </PieChart>{" "}
        </ResponsiveContainer>{" "}
      </SafeChartWrapper>{" "}
    </div>
  );
}
