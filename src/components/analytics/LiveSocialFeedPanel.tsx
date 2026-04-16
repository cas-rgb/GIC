"use client";
import { useEffect, useState } from "react";
import { RefreshCw, Activity, Siren, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StrategicNews from "./StrategicNews";
import SentimentVelocity from "./SentimentVelocity";
import WordTree from "./WordTree";
import NarrativeVelocityBubbleChart from "./NarrativeVelocityBubbleChart";
import SourceDemographyDonut from "./SourceDemographyDonut";
import UrgentNarrativeTrackerHeader from "./UrgentNarrativeTrackerHeader";

interface LiveSocialFeedPanelProps {
  province?: string;
  municipality?: string | null;
  serviceDomain?: string | null;
  days?: number;
  isLiveMode?: boolean;
}

export default function LiveSocialFeedPanel({
  province,
  municipality,
  serviceDomain,
  days = 30,
  isLiveMode = false,
}: LiveSocialFeedPanelProps) {
  const [news, setNews] = useState<any[]>([]);
  const [sentiment, setSentiment] = useState<any[]>([]);
  const [words, setWords] = useState<any[]>([]);
  const [urgentNarratives, setUrgentNarratives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
  const [showRiskAlert, setShowRiskAlert] = useState<boolean>(false);

  useEffect(() => {
    async function loadRealTimeData() {
      setLoading(true);
      const location = municipality || province || "Gauteng";
      const domain = serviceDomain || "infrastructure";


      try {
        const params = new URLSearchParams({ 
          province: province || "Gauteng",
          days: days.toString() 
        });
        if (municipality && municipality !== "All Municipalities") params.set("municipality", municipality);
        if (serviceDomain && serviceDomain !== "all") params.set("serviceDomain", serviceDomain);

        const res = await fetch(`/api/analytics/social-feed?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setNews(data.articles || []);
          setSentiment(data.sentiment || []);
          setUrgentNarratives(data.urgentNarratives || []);
          
          if (data.isRisk) {
            setShowRiskAlert(true);
          }
          
          if (data.wordMap && (data.wordMap || []).length > 0) {
            const mappedWords = (data.wordMap || []).map((w: any) => ({
              word: w.word,
              count: w.count,
              onClick: () => setActiveKeyword(w.word === activeKeyword ? null : w.word),
            }));
            setWords(mappedWords);
          } else {
            // Fallback for visual stability if no words generated
            setWords([
              { word: domain, count: 12, onClick: () => setActiveKeyword(domain === activeKeyword ? null : domain) },
              { word: "service", count: 8, onClick: () => setActiveKeyword("service" === activeKeyword ? null : "service") },
            ]);
          }
        } else {
          console.error("Failed to fetch Social Feed DB records");
        }
      } catch (e) {
        console.error("Live fetch error", e);
      } finally {
        setLoading(false);
      }
    }

    void loadRealTimeData();
  }, [province, municipality, serviceDomain, activeKeyword, isLiveMode]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center border border-slate-100 bg-white">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin text-gic-blue" />
          Synchronizing public data feeds...
        </div>
      </div>
    );
  }

  const filteredNews = activeKeyword
    ? news.filter((n) =>
        (n.title + n.description)
          .toLowerCase()
          .includes(activeKeyword.toLowerCase())
      )
    : news;

  return (
    <div className="mt-8 space-y-6 relative">
      <AnimatePresence>
        {showRiskAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-4 right-0 z-50 bg-rose-500 fill-rose-500 border border-rose-600 p-4 shadow-xl shadow-rose-500/20 text-white flex items-center gap-4 max-w-sm"
          >
            <motion.div 
               animate={{ scale: [1, 1.15, 1], boxShadow: ["0px 0px 0px 0px rgba(244,63,94,0)", "0px 0px 15px 5px rgba(244,63,94,0.4)", "0px 0px 0px 0px rgba(244,63,94,0)"] }} 
               transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
               className="bg-rose-600 p-2 rounded-full relative"
            >
              <Siren className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-black tracking-widest text-rose-200">
                System Risk Alert
              </p>
              <p className="font-bold text-sm leading-tight">
                Sudden spike in high-severity public narrative localized to{" "}
                {municipality || province}. Immediate PR intervention
                recommended.
              </p>
            </div>
            <button
              onClick={() => setShowRiskAlert(false)}
              className="text-rose-200 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <UrgentNarrativeTrackerHeader province={province || "Gauteng"} narratives={urgentNarratives} />
      {activeKeyword && (
        <div className="flex items-center justify-between bg-slate-800 p-4 border border-slate-700 mb-6 mt-4">
          <span className="text-sm font-medium text-slate-400">
            Filtering narrative mechanics by:
          </span>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            {activeKeyword}
            <button onClick={() => setActiveKeyword(null)}>
              <X className="w-3 h-3 hover:text-rose-500 transition-colors" />
            </button>
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 mt-4">
        <div>
          <StrategicNews articles={filteredNews} />
        </div>
        <div className="space-y-6 flex flex-col">
          <div className="gic-card bg-slate-900 border-slate-800 shadow-gic-premium p-5">
            <div className="mb-4">
              <h4 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Narrative Velocity
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                Topic volume over time
              </p>
            </div>
            <div className="h-[300px] relative">
              <NarrativeVelocityBubbleChart
                words={words}
                sentimentTimeline={sentiment}
              />
            </div>
          </div>
          <div className="gic-card bg-slate-900 border-slate-800 shadow-gic-premium p-5">
            <div className="mb-4">
              <h4 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Source Demography
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                Signal origin distribution
              </p>
            </div>
            <div className="h-[250px] relative">
              <SourceDemographyDonut articles={filteredNews} />
            </div>
          </div>
          <div className="gic-card bg-slate-900 border-slate-800 shadow-gic-premium p-5 flex-1 min-h-[300px]">
            <div className="mb-4">
              <h4 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                Thematic Cloud
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                Key conceptual clusters
              </p>
            </div>
            <div className="h-full relative min-h-[250px]">
              <WordTree data={words} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
