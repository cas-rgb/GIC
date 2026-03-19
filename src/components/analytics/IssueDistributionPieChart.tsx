"use client";
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

interface IssueDistributionPieChartProps {
  data: { category: string; count: number; color: string }[];
}
export default function IssueDistributionPieChart({
  data,
}: IssueDistributionPieChartProps) {
  return (
    <div className="flex flex-col h-full min-h-[300px] w-full bg-slate-50 border border-slate-100 p-4">
      {" "}
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
        Volume by Sector (30 Days)
      </h4>{" "}
      <div className="flex-1 w-full relative">
        {" "}
        <SafeChartWrapper minHeight="100%" fallbackMessage="Pie Chart Error">
          {" "}
          <ResponsiveContainer width="100%" height="100%">
            {" "}
            <PieChart>
              {" "}
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="count"
                nameKey="category"
                stroke="none"
              >
                {" "}
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}{" "}
              </Pie>{" "}
              <Tooltip content={<ChartTooltip />} />{" "}
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              />{" "}
            </PieChart>{" "}
          </ResponsiveContainer>{" "}
        </SafeChartWrapper>{" "}
      </div>{" "}
    </div>
  );
}
