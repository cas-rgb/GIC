"use client";
import { LeadershipSentimentLeaderRow } from "@/lib/analytics/types";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
interface LeaderBaseballCardsProps {
  leaders: LeadershipSentimentLeaderRow[];
  selectedLeaderName?: string | null;
  onSelectLeader?: (leader: LeadershipSentimentLeaderRow) => void;
}
export default function LeaderBaseballCards({
  leaders,
  selectedLeaderName,
  onSelectLeader,
}: LeaderBaseballCardsProps) {
  return (
    <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 scrollbar-hide">
      {leaders.map((leader) => {
        const isSelected = selectedLeaderName === leader.leaderName;
        const score = Math.round(leader.sentimentScore * 100);
        const isNeutral = score === 0;
        const isPositive = score > 0;
        const topIssue = leader.linkedIssues[0] || "General Governance";
        return (
          <div
            key={leader.leaderName}
            onClick={() => onSelectLeader && onSelectLeader(leader)}
            className={`min-w-[85vw] md:min-w-0 shrink-0 snap-center relative flex flex-col p-5 border transition-all duration-300 cursor-pointer overflow-hidden group ${isSelected ? "bg-blue-50/50 border-blue-400 shadow-md ring-1 ring-blue-400" : "bg-white border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md"}`}
          >
            {" "}
            {/* Top Row: Avatar & Score */}{" "}
            <div className="flex items-start justify-between mb-4">
              {" "}
              <div className="flex items-center justify-center w-12 h-12 bg-slate-100 text-slate-500 font-black text-lg uppercase tracking-widest border border-slate-200">
                {" "}
                {leader.leaderName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)}{" "}
              </div>{" "}
              <div className={`flex flex-col items-end`}>
                {" "}
                {isNeutral ? (
                  <span className="text-xl font-black text-slate-400">Neutral</span>
                ) : (
                  <span
                    className={`text-2xl font-black ${isPositive ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {" "}
                    {score > 0 ? "+" : ""}
                    {score}{" "}
                  </span>
                )}{" "}
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  {isNeutral ? "No Data" : "Net Trust"}
                </span>{" "}
              </div>{" "}
            </div>{" "}
            {/* Middle Row: Name & Office */}{" "}
            <div className="mb-3">
              {" "}
              <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {leader.leaderName}
              </h3>{" "}
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 line-clamp-1 mt-0.5">
                {leader.office}
              </p>{" "}
            </div>{" "}
            {/* AI PR Tagline */}{" "}
            <div className="mb-4 flex-1 bg-slate-50 p-3 border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
              {" "}
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1 flex items-center gap-1">
                {" "}
                <ShieldCheck className="w-2 h-2" /> Perception Note{" "}
              </span>{" "}
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                {" "}
                {leader.prAdvice || (isNeutral
                  ? "Awaiting public narrative synthesis. No significant conversational volume."
                  : isPositive
                  ? `Positive trust trajectory anchored by effective delivery within ${topIssue.toLowerCase()}.`
                  : `Severe reputational friction currently tied directly to ${topIssue.toLowerCase()} controversies.`)}{" "}
              </p>{" "}
            </div>{" "}
            {/* Bottom Row: AI Badge / Top Issue */}{" "}
            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
              {" "}
              <div
                className={`gic-badge ${isNeutral ? "gic-badge-neutral" : isPositive ? "gic-badge-success" : "gic-badge-critical"}`}
              >
                {" "}
                {isNeutral ? (
                  <AlertCircle className="w-3 h-3 text-slate-400" />
                ) : isPositive ? (
                  <ShieldCheck className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}{" "}
                <span className="truncate max-w-[120px]">{topIssue}</span>{" "}
              </div>{" "}
              <div className="flex items-center gap-1 text-slate-400">
                {" "}
                {isNeutral ? (
                  <div className="w-3 h-1 bg-slate-300 rounded-full" />
                ) : isPositive ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-rose-500" />
                )}{" "}
              </div>{" "}
            </div>{" "}
            {/* Selection Highlight Edge */}{" "}
            {isSelected && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            )}{" "}
          </div>
        );
      })}{" "}
    </div>
  );
}
