"use client";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import SafeChartWrapper from "@/components/ui/SafeChartWrapper";
import { formatWardDisplayLabel } from "@/lib/analytics/ward-label";

interface WardTreemapData {
  name: string;
  size: number;
  riskScore: number;
}

interface WardTreemapGridProps {
  data: WardTreemapData[];
  onSelectWard?: (ward: string | null) => void;
  selectedWard?: string | null;
}

export default function WardTreemapGrid({
  data,
  onSelectWard,
  selectedWard,
}: WardTreemapGridProps) {
  const treeData = data.map(ward => {
    // Convert 0-100 riskScore to a 0-1 ratio for the color logic
    const riskRatio = Math.min(Math.max(ward.riskScore / 100, 0), 1);
    return { 
      name: ward.name, 
      size: ward.size, 
      risk: riskRatio,
      riskScore: ward.riskScore
    };
  });

  const COLORS = {
    safe: '#10b981', // Emerald 500
    warn: '#f59e0b', // Amber 500
    risk: '#e11d48'  // Rose 600
  };

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, name, size, risk } = props;
    // Choose color based on risk ratio
    const backgroundColor = risk > 0.6 ? COLORS.risk : risk > 0.3 ? COLORS.warn : COLORS.safe;
    const isSelected = selectedWard === name;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={backgroundColor}
          stroke={isSelected ? '#1e293b' : '#ffffff'}
          strokeWidth={isSelected ? 4 : 2}
          onClick={() => onSelectWard && onSelectWard(name)}
          className="cursor-pointer transition-all duration-300 hover:opacity-80"
          rx={4}
          ry={4}
        />
        {width > 50 && height > 30 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 4}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={12}
            fontWeight="bold"
            className="pointer-events-none drop-shadow-md"
          >
            {formatWardDisplayLabel(name)}
          </text>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const cellData = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-xl border border-slate-100 min-w-[200px]">
          <p className="font-bold text-sm text-slate-900 mb-2 truncate max-w-[200px]">{cellData.name}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Risk Score:</span>
              <span className={`font-bold ${cellData.risk > 0.6 ? 'text-rose-600' : 'text-slate-700'}`}>
                {cellData.riskScore.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className={`text-[10px] px-2 py-1 font-bold uppercase tracking-wider ${cellData.risk > 0.6 ? 'bg-rose-50 text-rose-700' : cellData.risk > 0.3 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {cellData.risk > 0.6 ? 'High Risk' : cellData.risk > 0.3 ? 'Elevated' : 'Stable'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  }; 
  if (data.length === 0) { 
    return ( 
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 min-h-[350px]"> 
            <p className="text-sm font-bold text-slate-500">No ward mapping data available.</p> 
        </div> 
    ); 
  }

  return (
    <div className="w-full aspect-square md:aspect-auto md:h-full relative pt-2 min-h-[350px]">
      <SafeChartWrapper minHeight="100%" fallbackMessage="Treemap Layout Error">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treeData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            content={<CustomizedContent />}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </SafeChartWrapper>
    </div>
  );
}
