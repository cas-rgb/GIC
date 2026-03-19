"use client";

import { motion } from "framer-motion";
import { Newspaper, ArrowRight, Share2 } from "lucide-react";

export default function TrendingArticlesPanel({ articles }: { articles: any[] }) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Newspaper className="w-6 h-6 text-blue-500" />
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Trending Articles</h3>
          <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Mainstream Media Traction</p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {articles.map((article, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="gic-card bg-zinc-900 border-zinc-800 hover:border-blue-500/50 hover:shadow-gic-glow transition-all group flex flex-col p-4 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 group-hover:bg-blue-500 transition-colors" />
            
            <div className="flex items-center justify-between mb-3 pl-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                {article.source}
              </span>
              
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Share2 className="w-3 h-3" />
                <span className="text-[10px] font-bold font-mono group-hover:text-blue-400 transition-colors">
                  {new Intl.NumberFormat("en-ZA").format(article.engagement || 0)} shares
                </span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-blue-400 leading-relaxed pl-2 group-hover:text-blue-400 transition-colors">
              {article.headline}
            </h4>
            
            <a 
              href={article.url || "#"} 
              target="_blank" 
              className="mt-4 pl-2 flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest group-hover:text-blue-400 transition-all cursor-pointer"
            >
              Analyze Source <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
