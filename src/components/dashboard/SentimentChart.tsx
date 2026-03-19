"use client";

import { motion } from "framer-motion";

interface SentimentChartProps {
  positive: number;
  neutral: number;
  negative: number;
}

export default function SentimentChart({
  positive,
  neutral,
  negative,
}: SentimentChartProps) {
  const total = positive + neutral + negative;
  const posP = Math.round((positive / total) * 100);
  const neuP = Math.round((neutral / total) * 100);
  const negP = Math.round((negative / total) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm font-sans h-full flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">
            Public Sentiment Audit
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Multi-Channel Perception Map
          </p>
        </div>
        <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl">
          <span className="text-lg font-black text-gray-900">{total}</span>
          <span className="text-[8px] font-black text-gray-400 uppercase ml-2">
            Total Signals
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-8">
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">
              Positive Resilience
            </span>
            <span className="text-xl font-black text-gray-900">{posP}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${posP}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-green-500 shadow-sm"
            ></motion.div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
              Neutral Stability
            </span>
            <span className="text-xl font-black text-gray-900">{neuP}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${neuP}%` }}
              transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
              className="h-full bg-blue-500 shadow-sm"
            ></motion.div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
              Negative Vulnerability
            </span>
            <span className="text-xl font-black text-gray-900">{negP}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${negP}%` }}
              transition={{ duration: 1.5, ease: "circOut", delay: 0.4 }}
              className="h-full bg-red-500 shadow-sm"
            ></motion.div>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between text-[8px] font-black text-gray-400 uppercase tracking-widest">
        <span>Signal Confidence: 94.2%</span>
        <span>Audit Syncing: Optimized</span>
      </div>
    </div>
  );
}
