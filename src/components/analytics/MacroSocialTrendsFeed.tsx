"use client";

import { useState, useEffect } from "react";
import TrendingYouTubePanel from "./TrendingYouTubePanel";
import PlatformVelocityPanel from "./PlatformVelocityPanel";
import TrendingArticlesPanel from "./TrendingArticlesPanel";
import { Loader2 } from "lucide-react";
import GICCard from "@/components/ui/GICCard";
import { Activity, PlaySquare, Newspaper, Cpu } from "lucide-react";

export default function MacroSocialTrendsFeed({ province, data }: { province: string, data: any }) {

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">
          Aggregating Macro Internet Trends...
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* AI Synthesized Briefing */}
      {data.executiveSummary && (
        <GICCard 
          premium 
          title="Strategic AI Briefing" 
          subtitle={`Live synthesis of ${province || "National"} digital ecosystems`}
          icon={<Cpu className="w-5 h-5 text-gic-gold" />}
        >
          <div className="p-5 bg-blue-950/20 border border-blue-500/20 rounded-2xl">
            {data.executiveSummary.split("\n\n").map((paragraph: string, idx: number) => (
              <p key={idx} className="text-sm font-medium leading-relaxed text-slate-300 mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </GICCard>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <GICCard
          premium
          title="Video Intelligence"
          subtitle="Top performing political and infrastructure content on YouTube"
          icon={<PlaySquare className="w-5 h-5 text-rose-500" />}
        >
          <TrendingYouTubePanel videos={data.youtubeTrends} />
        </GICCard>

        <GICCard
          premium
          title="Social Cross-Pollination"
          subtitle="Narrative dominance across primary digital platforms"
          icon={<Activity className="w-5 h-5 text-emerald-500" />}
        >
          <PlatformVelocityPanel trends={data.platformVelocity} />
        </GICCard>
      </div>

      <GICCard
        premium
        title="Mainstream Digital News"
        subtitle="Highly shared digital news items influencing the public sphere"
        icon={<Newspaper className="w-5 h-5 text-blue-500" />}
      >
        <TrendingArticlesPanel articles={data.trendingArticles} />
      </GICCard>
    </div>
  );
}
