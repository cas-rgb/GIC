"use client";

import { motion } from "framer-motion";

import { Region } from "@/types";

export default function RegionalHeatmap({
  data,
}: {
  data: (Partial<Region> & { urgency: number; impact: number })[];
}) {
  if (!data || data.length === 0)
    return (
      <div className="p-8 text-gray-400 font-black uppercase text-[10px]">
        No Regional Data Available
      </div>
    );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 h-full flex flex-col font-sans">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
        Regional Pressure Audit
      </span>
      <div className="flex-1 grid grid-cols-2 gap-4">
        {data.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between group hover:border-blue-300 transition-all shadow-sm"
          >
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight truncate w-full">
              {item.name}
            </span>
            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">
                  Urgency
                </span>
                <span className="text-sm font-black text-red-600">
                  {item.urgency}%
                </span>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center relative">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    strokeWidth="3"
                    className="stroke-gray-200"
                  />
                  <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    strokeWidth="3"
                    strokeDasharray="100"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 100 - item.impact }}
                    className="stroke-blue-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-gray-600">
                  {item.impact}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
