import React from "react";

export default function ChartTooltip({ 
  active, 
  payload, 
  label, 
  children, 
  className = "" 
}: any) {
  // If used as a wrapper for custom content
  if (children) {
    return (
      <div className={`bg-slate-900/80 backdrop-blur-md border border-slate-700/50 shadow-2xl z-50 rounded-xl rounded-tl-sm ring-1 ring-white/10 overflow-hidden ${className}`}>
        {children}
      </div>
    );
  }

  // If used as a direct Recharts content component
  if (active && payload && payload.length) {
    return (
      <div className={`bg-slate-900/80 backdrop-blur-md border border-slate-700/50 shadow-2xl z-50 p-4 rounded-xl rounded-tl-sm ring-1 ring-white/10 overflow-hidden min-w-[180px] ${className}`}>
        {label && <p className="font-black text-xs uppercase tracking-wider mb-2 text-white border-b border-slate-700/50 pb-2">{label}</p>}
        <div className="space-y-2">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center gap-4 text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill || '#10b981' }} />
                {item.name}:
              </span>
              <span className="font-black text-white">
                {typeof item.value === 'number' && item.value > 1000 
                  ? new Intl.NumberFormat("en-ZA", { notation: "compact" }).format(item.value)
                  : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
