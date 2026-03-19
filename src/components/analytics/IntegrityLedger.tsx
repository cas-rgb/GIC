"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface PromiseItem {
  id: string;
  statement: string;
  date: string;
  status: "fulfilled" | "in_progress" | "delayed" | "risk";
  sentiment: number; // 0-100 from community feedback
}

export default function IntegrityLedger({
  premier,
  province,
  promises,
}: {
  premier: string;
  province: string;
  promises: PromiseItem[];
}) {
  return (
    <div className="bg-white rounded-2xl p-8 h-full border border-gray-200 shadow-sm flex flex-col relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <ShieldCheck className="w-32 h-32 text-gray-400" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-1">
              Strategic Compliance Audit
            </h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {province} Audit • Premier {premier}
            </span>
          </div>
          <div className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="text-[10px] font-black uppercase tracking-widest">
              Audited Signals
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
          {promises.map((promise, i) => (
            <motion.div
              key={promise.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-all group"
            >
              <div className="flex items-start justify-between gap-6 mb-3">
                <div className="flex-1">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                    {promise.date}
                  </span>
                  <p className="text-xs font-bold text-gray-900 leading-snug">
                    "{promise.statement}"
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                    promise.status === "fulfilled"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : promise.status === "in_progress"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : promise.status === "delayed"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-red-50 text-red-700 border-red-100"
                  }`}
                >
                  {promise.status.replace("_", " ")}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">
                    Community Sentiment Alignment
                  </span>
                  <span
                    className={
                      promise.sentiment > 60
                        ? "text-green-600"
                        : promise.sentiment > 40
                          ? "text-blue-600"
                          : "text-red-600"
                    }
                  >
                    {promise.sentiment}%
                  </span>
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${promise.sentiment}%` }}
                    className={`h-full ${
                      promise.sentiment > 60
                        ? "bg-green-600"
                        : promise.sentiment > 40
                          ? "bg-blue-600"
                          : "bg-red-600"
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
