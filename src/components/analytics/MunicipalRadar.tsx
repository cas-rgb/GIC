"use client";

import { motion } from "framer-motion";

export default function MunicipalRadar({ data }: { data: any }) {
  const keys = Object.keys(data);
  const angleStep = (Math.PI * 2) / keys.length;

  const points = keys
    .map((key, i) => {
      const value = data[key];
      const r = (value / 100) * 45; // Scale to 45% radius
      const x = 50 + r * Math.cos(i * angleStep - Math.PI / 2);
      const y = 50 + r * Math.sin(i * angleStep - Math.PI / 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 h-full flex flex-col">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
        Municipal Grounding Radar
      </span>
      <div className="flex-1 relative mt-2">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          {/* Radar Web */}
          {[20, 40].map((r, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="0.5"
            />
          ))}
          {keys.map((_, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + 45 * Math.cos(i * angleStep - Math.PI / 2)}
              y2={50 + 45 * Math.sin(i * angleStep - Math.PI / 2)}
              stroke="#f1f5f9"
              strokeWidth="0.5"
            />
          ))}
          {/* Data Shape */}
          <motion.polygon
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.2, scale: 1 }}
            points={points}
            className="fill-gic-blue"
          />
          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
            points={points + " " + points.split(" ")[0]}
            fill="none"
            stroke="#0a84ff"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
        {keys.map((key, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-slate-50/50 p-2 rounded-xl border border-slate-100/50"
          >
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter truncate max-w-[60px]">
              {key.replace(/_/g, " ")}
            </span>
            <span className="text-[8px] font-black text-slate-800">
              {Math.round(data[key])}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
