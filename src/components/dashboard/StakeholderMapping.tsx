"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  MessageSquare,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  influence: number; // 0-100
  sentiment: "positive" | "negative" | "neutral";
  focus: string[];
}

interface StakeholderMappingProps {
  communityId: string;
}

const MOCK_STAKEHOLDERS: Record<string, Stakeholder[]> = {
  "comm-gp-01": [
    {
      id: "sh-01",
      name: "Zanele Mthembu",
      role: "Community Leader",
      influence: 92,
      sentiment: "neutral",
      focus: ["Housing", "Youth"],
    },
    {
      id: "sh-02",
      name: "Dr. David Khoza",
      role: "Infrastructure Consultant",
      influence: 78,
      sentiment: "positive",
      focus: ["Water", "Civil Works"],
    },
    {
      id: "sh-03",
      name: "Victor Ndlovu",
      role: "Local Business Forum",
      influence: 85,
      sentiment: "negative",
      focus: ["Procurement", "Labor"],
    },
    {
      id: "sh-04",
      name: "Sarah Molefe",
      role: "Youth Activist",
      influence: 74,
      sentiment: "positive",
      focus: ["Education", "Digital"],
    },
  ],
  // Default for others
};

export default function StakeholderMapping({
  communityId,
}: StakeholderMappingProps) {
  const stakeholders =
    MOCK_STAKEHOLDERS[communityId] || MOCK_STAKEHOLDERS["comm-gp-01"];

  return (
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Stakeholder Influence Mapping</h3>
            <p className="text-xs text-white/40">
              Power dynamics & sentiment tracking
            </p>
          </div>
        </div>
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40">
          {stakeholders.length} Key Influencers
        </div>
      </div>

      <div className="space-y-4">
        {stakeholders.map((sh, idx) => (
          <motion.div
            key={sh.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                <User className="w-6 h-6 text-white/20" />
              </div>
              <div>
                <h4 className="font-bold text-sm group-hover:text-primary transition-colors">
                  {sh.name}
                </h4>
                <p className="text-[10px] text-white/40 font-medium">
                  {sh.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex flex-col items-end gap-1">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                  Influence
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${sh.influence}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-amber-400">
                    {sh.influence}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 min-w-[80px]">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                  Sentiment
                </span>
                <div className="flex items-center gap-1.5">
                  {sh.sentiment === "positive" ? (
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  ) : sh.sentiment === "negative" ? (
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                  ) : (
                    <div className="w-3 h-0.5 bg-white/40" />
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      sh.sentiment === "positive"
                        ? "text-emerald-400"
                        : sh.sentiment === "negative"
                          ? "text-rose-400"
                          : "text-white/40"
                    }`}
                  >
                    {sh.sentiment}
                  </span>
                </div>
              </div>

              <div className="flex gap-1.5 ml-4">
                {sh.focus.map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] font-bold text-white/40 uppercase"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import { Users } from "lucide-react";
