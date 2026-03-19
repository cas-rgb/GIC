"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import WordTree from "./WordTree";

interface TavilyArticle {
  title: string;
  description: string;
  url: string;
}

interface TavilyWordTreePanelProps {
  province?: string;
  municipality?: string | null;
  serviceDomain?: string | null;
}

const STOP_WORDS = new Set([
  "the", "and", "in", "to", "of", "a", "is", "for", "on", "that", "by", "with",
  "as", "at", "it", "from", "are", "be", "was", "this", "an", "or", "have",
  "not", "has", "but", "they", "their", "will", "more", "about", "which",
  "we", "you", "who", "what", "where", "when", "how", "why", "there", "can",
  "local", "news", "regional", "service", "delivery", "problems", "progress",
  "south", "africa", "province", "municipality", "municipalitys", "municipal",
  "new", "said", "over", "also", "been", "its", "after", "out", "up", "into",
]);

export default function TavilyWordTreePanel({
  province,
  municipality,
  serviceDomain,
}: TavilyWordTreePanelProps) {
  const [words, setWords] = useState<{ word: string; count: number; onClick: () => void }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSignatures() {
      setLoading(true);
      setError(null);
      try {
        const location = municipality || province || "Gauteng";
        const domain = serviceDomain || "infrastructure";
        const qs = new URLSearchParams({ location, serviceDomain: domain }).toString();
        
        const res = await fetch(`/api/analytics/tavily-news?${qs}`);
        if (!res.ok) throw new Error("Failed to load live signals from intelligence network");
        
        const data = await res.json();
        const articles = (data.articles || []) as TavilyArticle[];

        // Build word frequency map
        const frequencies = new Map<string, number>();
        
        articles.forEach(article => {
          const text = `${article.title} ${article.description}`.toLowerCase();
          const tokens = text.match(/\b[a-z]{3,}\b/g) || [];
          
          tokens.forEach(token => {
            if (!STOP_WORDS.has(token) && token !== location.toLowerCase() && token !== domain.toLowerCase()) {
              frequencies.set(token, (frequencies.get(token) || 0) + 1);
            }
          });
        });

        // Convert to array and take top 25 semantic nodes
        const sorted = Array.from(frequencies.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 25)
          .map(([word, count]) => ({
            word,
            count,
            onClick: () => window.open(`https://google.com/search?q=${location}+${word}`, "_blank")
          }));

        setWords(sorted);
      } catch (err: any) {
        setError(err.message || "Failed to parse public signals");
      } finally {
        setLoading(false);
      }
    }
    
    loadSignatures();
  }, [province, municipality, serviceDomain]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] h-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 shadow-gic-premium">
        <div className="flex flex-col items-center gap-4 text-sm font-bold text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin text-sky-400" />
          <p className="animate-pulse tracking-widest uppercase text-[10px]">Processing Live Public Signals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] h-full items-center justify-center rounded-2xl border border-rose-900/40 bg-slate-900 shadow-gic-premium text-center">
        <div>
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-white">Signal Processor Offline</p>
          <p className="mt-2 text-xs text-rose-400/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] xl:h-full">
       <WordTree data={words} />
    </div>
  );
}
