"use client";

import { motion } from "framer-motion";
import {
  Users,
  Twitter,
  Facebook,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function InfluencerMap({ data }: { data: any[] }) {
  if (!data || data.length === 0)
    return (
      <div className="p-8 text-gray-400 font-black uppercase text-[10px]">
        No Strategic Influencers Identified
      </div>
    );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 h-full flex flex-col shadow-sm overflow-hidden relative font-sans">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">
            Stakeholder Mapping
          </h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Key Institutional Nodes
          </p>
        </div>
        <div className="p-3 bg-gray-50 text-gray-500 rounded-xl border border-gray-200">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide">
        {data.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 bg-gray-50 border border-gray-100 rounded-xl group hover:border-blue-300 transition-all shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                  {item.platform === "X" ? (
                    <Twitter className="w-3 h-3 text-gray-900" />
                  ) : (
                    <Facebook className="w-3 h-3 text-blue-600" />
                  )}
                </div>
                <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">
                  {item.name}
                </span>
              </div>
              <div className="px-2 py-0.5 bg-green-50 text-green-700 text-[8px] font-black rounded border border-green-100 uppercase">
                Impact: {item.impact}%
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                <span className="text-gray-900">Portfolio:</span> {item.focus}
              </div>
              <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-2">
        <ShieldCheck className="w-3 h-3 text-green-500" />
        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
          Verified Stakeholder Register
        </span>
      </div>
    </div>
  );
}
