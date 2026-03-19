"use client";

import { motion } from "framer-motion";
import { User, Share2, TrendingUp, Cpu, Network } from "lucide-react";

export default function PremierPulse({
  data,
  province,
}: {
  data: any;
  province: string;
}) {
  if (!data)
    return (
      <div className="p-8 text-gray-400 font-black uppercase text-[10px]">
        No Executive Presence Data
      </div>
    );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 h-full flex flex-col shadow-sm overflow-hidden relative group font-sans">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Cpu className="w-32 h-32 text-gray-400" />
      </div>

      <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
            <User className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none mb-1">
              {data.name}
            </h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {province} Executive Audit
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-gray-900 leading-none">
            {data.sentiment}%
          </div>
          <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">
            Sentiment Audit
          </span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col gap-6">
        <div>
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Network className="w-3 h-3" /> Inter-Departmental Connectivity
          </h4>
          <div className="flex flex-wrap gap-2">
            {(data.associates || []).map((associate: string, i: number) => (
              <motion.div
                key={associate}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg hover:border-blue-300 transition-all flex items-center gap-2 group/item cursor-pointer"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-tight">
                  {associate}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-auto p-5 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between group-hover:border-blue-400 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gray-100 text-gray-500 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                Policy Alignment
              </span>
              <div className="text-xs font-black text-gray-900 uppercase">
                Strategic Mandate Alignment
              </div>
            </div>
          </div>
          <Share2 className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}
