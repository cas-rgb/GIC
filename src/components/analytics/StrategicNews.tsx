"use client";

import { motion } from "framer-motion";
import {
  Newspaper,
  ExternalLink,
  Globe,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function StrategicNews({ articles }: { articles: any[] }) {
  if (!articles || articles.length === 0)
    return (
      <div className="gic-card bg-slate-900 border-slate-800 p-12 text-center shadow-gic-premium">
        <Newspaper className="w-10 h-10 text-slate-700 mx-auto mb-4" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          No matching news signatures in this region
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Live Institutional News Feed
          </h4>
          <p className="text-sm font-bold text-white uppercase">
            Regional Media Evidence
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 shadow-gic-glow">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-tighter">
            Live Sync
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="gic-card bg-slate-900 border-slate-800 hover:border-gic-blue hover:shadow-gic-glow transition-all group flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 rounded inline-block uppercase whitespace-nowrap">
                  {article.source?.name || "News Source"}
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <a
                href={article.url}
                target="_blank"
                className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700 hover:border-slate-500"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h5 className="text-xs font-black text-white leading-snug mb-3 group-hover:text-gic-blue transition-colors uppercase">
              {article.title}
            </h5>

            <p className="text-[10px] text-slate-400 leading-relaxed font-bold line-clamp-2 mb-6 flex-1">
              {article.description}
            </p>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest group-hover:text-blue-400">
                Institutional Evidence
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
