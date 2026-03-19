"use client";

import { motion } from "framer-motion";
import { PlayCircle, Eye, Calendar, Youtube } from "lucide-react";

export default function TrendingYouTubePanel({ videos }: { videos: any[] }) {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Youtube className="w-6 h-6 text-rose-500" />
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">YouTube Intelligence</h3>
          <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">High-Traction Civic Formats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        {videos.slice(0, 4).map((video, idx) => (
          <motion.a
            href={video.url || "#"}
            target="_blank"
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="gic-card bg-zinc-900 border-zinc-800 hover:border-rose-500/50 hover:shadow-gic-glow transition-all group overflow-hidden flex flex-col p-0 cursor-pointer"
          >
            <div className="w-full h-32 bg-zinc-800 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10" />
              <PlayCircle className="w-10 h-10 text-blue-400/50 group-hover:text-rose-500 group-hover:scale-110 transition-all z-20 relative" />
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 rounded text-[9px] font-black tracking-widest text-rose-500 border border-rose-500/20 z-20">
                LIVE
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <h4 className="text-xs font-bold text-blue-400 leading-snug line-clamp-2 mb-2 group-hover:text-rose-400 transition-colors">
                {video.title}
              </h4>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
                {video.channel}
              </p>
              
              <div className="mt-auto flex items-center justify-between text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">
                    {new Intl.NumberFormat("en-ZA").format(video.views || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">{video.publishedAt}</span>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
