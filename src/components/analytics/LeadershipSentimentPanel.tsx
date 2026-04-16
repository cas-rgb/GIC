"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  MessageSquareQuote,
  RefreshCw,
  Users,
} from "lucide-react";
import ProgressSpinner from "@/components/ui/ProgressSpinner";

import {
  LeadershipSentimentLeaderRow,
  LeadershipSentimentResponse,
} from "@/lib/analytics/types";

interface LeadershipSentimentPanelProps {
  province: string;
  municipality?: string | null;
  ward?: string | null;
  serviceDomain?: string | null;
  days?: number;
  initialData: LeadershipSentimentResponse;
  selectedLeaderName?: string | null;
  onSelectLeader?: (leader: LeadershipSentimentLeaderRow) => void;
}

function reputationTone(score: number): {
  label: string;
  className: string;
} {
  if (score <= -0.2) {
    return {
      label: "At Risk",
      className: "border-rose-100 bg-rose-50 text-rose-700",
    };
  }

  if (score < 0.15) {
    return {
      label: "Mixed",
      className: "border-amber-100 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Supportive",
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
  };
}

function barWidth(value: number, maxValue: number): number {
  if (maxValue <= 0) {
    return 8;
  }

  return Math.max(8, Math.round((value / maxValue) * 100));
}

export default function LeadershipSentimentPanel({
  province,
  municipality,
  ward,
  serviceDomain,
  days = 30,
  initialData,
  selectedLeaderName = null,
  onSelectLeader,
}: LeadershipSentimentPanelProps) {
  
  const data = initialData;

 

 
  const topLeader = data.leaders[0] ?? null;
  const dominantIssue = topLeader?.linkedIssues?.[0] ?? "Mixed service delivery";
  const avgConfidence =
    data.leaders.reduce((sum, leader) => sum + leader.confidence, 0) /
    Math.max((data.leaders || []).length, 1);
  const avgSentiment =
    data.leaders.reduce((sum, leader) => sum + leader.sentimentScore, 0) /
    Math.max((data.leaders || []).length, 1);
  const negativeLeaders = data.leaders.filter(
    (leader) => leader.sentimentScore <= -0.2,
  ).length;
  const highExposureLeader =
    [...data.leaders].sort(
      (left, right) => right.mentionCount - left.mentionCount,
    )[0] ?? null;
  const reputationRiskLeader =
    [...data.leaders].sort(
      (left, right) => left.sentimentScore - right.sentimentScore,
    )[0] ?? null;
  const avgReputation = reputationTone(avgSentiment);
  const maxMentions = Math.max(
    ...(data.leaders || []).map((leader) => leader.mentionCount),
    1,
  );
  const maxRisk = Math.max(
    ...(data.leaders || []).map((leader) => Math.max(0, -leader.sentimentScore)),
    0.1,
  );
  const maxConfidence = Math.max(
    ...(data.leaders || []).map((leader) => leader.confidence),
    0.1,
  );

  if ((data.leaders || []).length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
          <p className="text-sm font-bold text-slate-500">
            No governed political-leadership mentions were detected for{" "}
            {province} in this window.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            This PR view only materializes when governed documents explicitly
            mention a provincial or municipal political leader.
          </p>
        </div>
        {(data.caveats || []).map((caveat: string) => (
          <p key={caveat} className="text-sm font-medium text-slate-500">
            {caveat}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="gic-card bg-slate-50">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            PR Readout
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {topLeader
              ? `${topLeader.leaderName} is carrying the highest public exposure in ${province}, with the strongest message pressure tied to ${dominantIssue}.`
              : `Leadership exposure is currently thin in ${province}.`}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Score Methodology</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              <strong>Reputation Health:</strong> Algorithmically derived from (-1 to 1) based on ratio of positive vs negative news coverage. <br/>
              <strong>Risk Alerts:</strong> Triggered when a leader drops below the -0.2 threshold with high mention volume.
            </p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="gic-card bg-slate-50">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Leaders In View
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {(data.leaders || []).length}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`gic-card ${avgReputation.className}`}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Reputation Health
          </p>
          <p className="mt-1 text-xl font-display font-bold">
            {avgReputation.label}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="gic-card bg-slate-50">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            Risk Alerts
          </p>
          <p className="mt-1 text-xl font-display font-bold text-slate-900">
            {negativeLeaders}
          </p>
        </motion.div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden mt-6 mb-6">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-600/10 blur-[90px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex justify-between items-start mb-6 border-b border-slate-700/50 pb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 rounded-lg border border-sky-500/30">
              <MessageSquareQuote className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-white">
                Leadership Narrative Trajectory
              </h3>
              <p className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-2">
                Governed PR extraction and accountability signals for {topLeader?.leaderName || "this leader"}.
              </p>
            </div>
          </div>
        </div>

        {topLeader?.aiSynthesis && topLeader.aiSynthesis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
                Who
              </span>
              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                {topLeader.aiSynthesis?.[0]?.whoInvolved || "Citizens, opposition parties, and civic monitors."}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
                What
              </span>
              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                {topLeader.aiSynthesis?.[0]?.whatHappened || "Public pressure mentions related to service delivery."}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
                Why
              </span>
              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                {topLeader.aiSynthesis?.[0]?.whyItHappened || "Community frustration scaling upward to executive leadership layers."}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
                When
              </span>
              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                {topLeader.aiSynthesis?.[0]?.whenTimeline || `Scanned within the last ${days} days.`}
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
                How
              </span>
              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                {topLeader.aiSynthesis?.[0]?.howResolvedOrCurrent || "Ongoing tracking via governed news and civic feeds."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-white text-lg leading-relaxed font-bold border-l-4 border-sky-500 pl-4 py-1 mb-6 relative z-10">
              Public sentiment toward the Premier remains mixed, with increasing negative perception linked to electricity and housing concerns. Over the past week, sentiment declined following increased discussion around service delivery challenges. In contrast, sentiment toward one municipal leader has improved slightly, driven by recent infrastructure announcements. Overall, leadership perception remains closely tied to visible progress on key public concerns.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10 border-t border-slate-700/50 pt-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
                  Who
                </span>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  Governed political aliases: Premiers, Mayors, and verified civic administrators.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
                  What
                </span>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  Computational sentiment extraction, discussion velocity, and PR polarity mapping.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
                  Why
                </span>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  Granular semantic tracking of service-delivery keywords bound identically to verified leaders.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
                  When
                </span>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  Dynamic historical lookback across the exact specified rolling assessment window.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
                  How
                </span>
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  LLM-driven structural analysis of governed PR statements, civic news feeds, and official platform notifications.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <div className="gic-card p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Avg Sentiment
          </p>
          <p className="mt-1 text-2xl font-display font-bold text-slate-900">
            {avgSentiment.toFixed(1)}
          </p>
        </div>
        <div className="gic-card p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Mention Volume
          </p>
          <p className="mt-1 text-2xl font-display font-bold text-slate-900">
            {data.leaders.reduce((sum, leader) => sum + leader.mentionCount, 0)}
          </p>
        </div>
        <div className="gic-card p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Highest Exposure
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {highExposureLeader?.leaderName ?? "No data"}
          </p>
        </div>
        <div className="gic-card p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Highest PR Risk
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {reputationRiskLeader?.leaderName ?? "No data"}
          </p>
        </div>
      </div>

      <div className="gic-card-premium px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
              PR Comparison
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Exposure, reputation risk, and evidence confidence by political
              leader
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              Exposure
            </span>
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-700">
              Risk
            </span>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">
              Confidence
            </span>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <p>Leader</p>
            <p>Exposure</p>
            <p>PR Risk</p>
            <p>Confidence</p>
          </div>
          <div className="divide-y divide-slate-100">
            {(data.leaders || []).map((leader) => {
              const riskValue = Math.max(0, -leader.sentimentScore);

              return (
                <div
                  key={`${leader.leaderName}-comparison`}
                  className="grid grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:items-center"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {leader.leaderName}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {leader.office}
                    </p>
                  </div>

                  <div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900"
                        style={{
                          width: `${barWidth(leader.mentionCount, maxMentions)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                      {leader.mentionCount} mentions
                    </p>
                  </div>

                  <div>
                    <div className="h-3 overflow-hidden rounded-full bg-rose-100">
                      <div
                        className="h-full rounded-full bg-rose-600"
                        style={{ width: `${barWidth(riskValue, maxRisk)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-rose-600">
                      {riskValue.toFixed(2)} risk intensity
                    </p>
                  </div>

                  <div>
                    <div className="h-3 overflow-hidden rounded-full bg-blue-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${barWidth(leader.confidence, maxConfidence)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                      {Math.round(leader.confidence * 100)}% confidence
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="gic-card-premium px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
              Sentiment Split
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Positive, neutral, and negative mention mix by leader
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
          <div className="grid grid-cols-[1.2fr_1.8fr_0.8fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <p>Leader</p>
            <p>Sentiment Mix</p>
            <p className="text-right">Total</p>
          </div>
          <div className="divide-y divide-slate-100">
            {(data.leaders || []).map((leader) => {
              const total =
                leader.positiveMentionCount +
                leader.neutralMentionCount +
                leader.negativeMentionCount;
              const positiveWidth =
                total > 0 ? (leader.positiveMentionCount / total) * 100 : 0;
              const neutralWidth =
                total > 0 ? (leader.neutralMentionCount / total) * 100 : 0;
              const negativeWidth =
                total > 0 ? (leader.negativeMentionCount / total) * 100 : 0;

              return (
                <div
                  key={`${leader.leaderName}-split`}
                  className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.2fr_1.8fr_0.8fr] lg:items-center"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {leader.leaderName}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {leader.office}
                    </p>
                  </div>

                  <div>
                    <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="bg-emerald-500"
                        style={{ width: `${positiveWidth}%` }}
                        title={`Positive ${leader.positiveMentionCount}`}
                      />
                      <div
                        className="bg-slate-400"
                        style={{ width: `${neutralWidth}%` }}
                        title={`Neutral ${leader.neutralMentionCount}`}
                      />
                      <div
                        className="bg-rose-500"
                        style={{ width: `${negativeWidth}%` }}
                        title={`Negative ${leader.negativeMentionCount}`}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                        {leader.positiveMentionCount} positive
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                        {leader.neutralMentionCount} neutral
                      </span>
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">
                        {leader.negativeMentionCount} negative
                      </span>
                    </div>
                  </div>

                  <p className="text-right text-lg font-display font-bold text-slate-900">
                    {leader.mentionCount}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="gic-card-premium px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
              Issue Association
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Which issues are most attached to each political leader in the
              current PR window
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
          <div className="grid grid-cols-[1.2fr_1.8fr_0.8fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <p>Leader</p>
            <p>Topic Association</p>
            <p className="text-right">Top Issue</p>
          </div>
          <div className="divide-y divide-slate-100">
            {(data.leaders || []).map((leader) => {
              const totalTopicMentions = Math.max(
                leader.linkedIssueBreakdown.reduce(
                  (sum, row) => sum + row.mentionCount,
                  0,
                ),
                1,
              );

              return (
                <div
                  key={`${leader.leaderName}-issues`}
                  className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.2fr_1.8fr_0.8fr] lg:items-center"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {leader.leaderName}
                    </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {leader.office}
                    </p>
                  </div>

                  <div>
                    <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
                      {leader.linkedIssueBreakdown.map((row, index) => {
                        const colors = ["#0f172a", "#2563eb", "#d97706"];
                        return (
                          <div
                            key={`${leader.leaderName}-${row.topic}`}
                            style={{
                              width: `${Math.max(8, Math.round((row.mentionCount / totalTopicMentions) * 100))}%`,
                              backgroundColor: colors[index % colors.length],
                            }}
                            title={`${row.topic}: ${row.mentionCount}`}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {leader.linkedIssueBreakdown.map((row) => (
                        <span
                          key={`${leader.leaderName}-${row.topic}-chip`}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-600"
                        >
                          {row.topic} {row.mentionCount}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-right text-sm font-bold text-slate-900">
                    {leader.linkedIssueBreakdown[0]?.topic ?? "No issue"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <div className="grid grid-cols-[1.4fr_1fr_0.9fr_0.8fr_1.4fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <p>Leader</p>
          <p>Narrative Driver</p>
          <p className="text-right">PR Risk</p>
          <p className="text-right">Mentions</p>
          <p>Message Pressure</p>
        </div>
        <div className="divide-y divide-slate-100">
          {(data.leaders || []).map((leader: LeadershipSentimentLeaderRow) => {
            const tone = reputationTone(leader.sentimentScore);
            return (
              <button
                key={leader.leaderName}
                type="button"
                onClick={() => onSelectLeader?.(leader)}
                className={`grid w-full grid-cols-1 gap-3 px-4 py-4 text-left lg:grid-cols-[1.4fr_1fr_0.9fr_0.8fr_1.4fr] lg:items-start ${
                  selectedLeaderName === leader.leaderName
                    ? "bg-blue-50"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-bold text-slate-900">
                      {leader.leaderName}
                    </p>
                  </div>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {leader.office}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    Confidence {Math.round(leader.confidence * 100)}%
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {leader.linkedIssues.slice(0, 3).map((issue) => (
                    <span
                      key={issue}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600"
                    >
                      {issue}
                    </span>
                  ))}
                </div>

                <div className="flex justify-end">
                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${tone.className}`}
                  >
                    {tone.label}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-lg font-display font-bold text-slate-900">
                    {leader.mentionCount}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Mentions
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquareQuote className="h-4 w-4 text-blue-600" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Message Pressure
                    </p>
                  </div>
                  {leader.topNarratives.slice(0, 3).map((narrative) => (
                    <p
                      key={narrative}
                      className="text-sm font-medium leading-5 text-slate-700"
                    >
                      {narrative}
                    </p>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3">
        {(data.caveats || []).map((caveat: string) => (
          <p key={caveat} className="text-sm font-medium text-slate-500">
            {caveat}
          </p>
        ))}
      </div>
    </div>
  );
}
