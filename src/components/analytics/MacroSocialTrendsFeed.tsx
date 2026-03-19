"use client";

import { useState, useEffect } from "react";
import TrendingYouTubePanel from "./TrendingYouTubePanel";
import PlatformVelocityPanel from "./PlatformVelocityPanel";
import TrendingArticlesPanel from "./TrendingArticlesPanel";
import { Loader2 } from "lucide-react";
import GICCard from "@/components/ui/GICCard";
import { Activity, PlaySquare, Newspaper } from "lucide-react";

export default function MacroSocialTrendsFeed({ province }: { province: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/deep-social?province=${encodeURIComponent(province || "All Provinces")}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Deep Social Fetch Error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, [province]);

  if (loading) {
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
