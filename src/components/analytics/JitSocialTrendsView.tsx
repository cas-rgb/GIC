import { motion } from "framer-motion";
import { Share2, Video as VideoIcon, FileText, BrainCircuit, Activity } from "lucide-react";

export interface JitSocialTopic {
  topicHeadline: string;
  context: string;
  sentiment: "positive" | "negative" | "volatile";
  reliability: "Formal/Reliable" | "Informal/Unverified";
  sourceUrl?: string;
}

export interface JitPlatformGroup {
  platformName: "Social Media Networks" | "Video Intelligence" | "Hyper-Local News";
  trends: JitSocialTopic[];
}

export interface JitSocialPayload {
  executiveSummary: string;
  platforms: JitPlatformGroup[];
}

// Quick markdown parser to convert [Link Text](http://url) into styled anchor tags safely via dangerouslySetInnerHTML
const parseMarkdownLinks = (text: string) => {
  if (!text) return "";
  // regex: \[([^\]]+)\]\(([^)]+)\)
  // $1 is the visible text, $2 is the url
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-blue-400 font-bold hover:text-blue-300 transition-colors border-b border-blue-400/30 border-dashed hover:border-blue-300">[$1 ↗]</a>');
};

export default function JitSocialTrendsView({ data, timeframe }: { data: JitSocialPayload, timeframe?: string }) {
  if (!data || !data.platforms) return null;

  const getTimeText = () => {
    if (timeframe === "1") return "last 24 hours";
    if (timeframe === "3") return "last 3 days";
    if (timeframe === "7") return "last 7 days";
    if (timeframe === "30") return "last 30 days";
    if (timeframe === "all") return "general trends tracking";
    return `last ${timeframe || 7} days`;
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  // Map icons and colors safely
  const getPlatformConfig = (name: string) => {
    switch (name) {
      case "Social Media Networks":
        return { icon: <Share2 className="w-6 h-6 text-sky-500" />, color: "sky", desc: "Aggregated intelligence from X, Facebook, TikTok, LinkedIn, and Threads." };
      case "Video Intelligence":
        return { icon: <VideoIcon className="w-6 h-6 text-rose-500" />, color: "rose", desc: "Deep extraction from visual streams, YouTube footage, and local broadcasts." };
      case "Hyper-Local News":
        return { icon: <FileText className="w-6 h-6 text-emerald-500" />, color: "emerald", desc: "Vetted civic journalism from regional gazettes and community papers." };
      default:
        return { icon: <Activity className="w-6 h-6 text-slate-500" />, color: "slate", desc: "General Intel." };
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Massive Strategic Summary */}
      <motion.div variants={item} className="bg-slate-950 rounded-[2rem] p-8 md:p-12 border border-blue-900/30 shadow-2xl relative overflow-hidden print:bg-white print:border-none print:shadow-none print:overflow-visible">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex justify-between items-center mb-6 relative z-10 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-900 border border-slate-700/50 rounded-full flex items-center justify-center shadow-inner">
                <BrainCircuit className="w-5 h-5 text-blue-500" />
             </div>
             <div>
               <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider">Executive Intelligence Briefing</h2>
               <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mt-1">
                 Cross-Platform Analysis <span className="text-blue-500 ml-2">• Network Aggregation Active</span>
               </p>
             </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors print:hidden shadow-xl"
          >
            <FileText className="w-4 h-4" /> Export Report
          </button>
        </div>

        <div 
          className="text-slate-300 leading-relaxed font-inter text-lg space-y-6 relative z-10 max-w-5xl whitespace-pre-wrap print:text-slate-800"
          dangerouslySetInnerHTML={{ __html: parseMarkdownLinks(data.executiveSummary) }}
        />
      </motion.div>

      {/* Dynamic 3-Platform Focus Grid - Transformed into Rows */}
      <motion.div variants={item} className="flex flex-col space-y-8">
        {data.platforms.map((platform, idx) => {
          const config = getPlatformConfig(platform.platformName);
          const topics = platform.trends || [];
          
          return (
          <div key={idx} className={`bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 relative overflow-hidden flex flex-col hover:bg-slate-900/60 transition-colors`}>
            
            <div className={`flex items-start gap-4 mb-6 pb-4 border-b border-white/5`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${config.color}-500/10 border border-${config.color}-500/20 shrink-0`}>
                {config.icon}
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider">{platform.platformName}</h3>
                <p className="text-sm text-slate-400 font-medium mt-1 leading-relaxed">{config.desc}</p>
              </div>
            </div>

            <div className="flex flex-row overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scroll flex-1">
              {topics.map((topic, tIdx) => {
                let youtubeId = null;
                const isVideoSource = topic.sourceUrl?.includes("youtube") || topic.sourceUrl?.includes("youtu.be");
                
                if (isVideoSource && topic.sourceUrl) {
                    const match = topic.sourceUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                    if (match && match[1]) youtubeId = match[1];
                }

                return (
                <div key={tIdx} className={`bg-slate-950/80 border border-slate-800/80 hover:border-${config.color}-500/30 rounded-2xl overflow-hidden shadow-sm transition-colors w-[85vw] md:w-[400px] shrink-0 snap-start flex flex-col`}>
                  {youtubeId && topic.sourceUrl && (
                      <a href={topic.sourceUrl} target="_blank" rel="noreferrer" className="block w-full h-36 bg-slate-900 relative overflow-hidden group/thumb cursor-pointer border-b border-slate-800 shrink-0">
                        <img 
                          src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`} 
                          alt="YouTube Thumbnail" 
                          className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 group-hover/thumb:scale-105 transition-all duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`; }}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
                        <div className="absolute bottom-2 left-3 bg-red-600/90 text-[8px] font-black uppercase px-2 py-0.5 rounded text-white tracking-widest flex items-center gap-1 shadow-rose-900/50 shadow-lg border border-red-500">
                          <VideoIcon className="w-2.5 h-2.5" /> Source Extract
                        </div>
                      </a>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h4 className="font-bold text-white text-[15px] leading-snug line-clamp-3">{topic.topicHeadline}</h4>
                      <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-full shrink-0 ${
                        topic.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        topic.sentiment === 'negative' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {topic.sentiment}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1 ${
                        topic.reliability === 'Formal/Reliable' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {topic.reliability === 'Formal/Reliable' ? '✓ Verified Source' : '⚠ Actionable Intelligence'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-300 font-inter leading-relaxed flex-1">{topic.context}</p>
                    
                    {topic.sourceUrl && !youtubeId && (
                        <div className="mt-4 pt-3 border-t border-slate-800/50 shrink-0">
                          <a href={topic.sourceUrl} target="_blank" rel="noreferrer" className={`text-[10px] text-${config.color}-400 font-bold uppercase tracking-widest hover:text-${config.color}-300 transition-colors inline-block w-full truncate`}>
                            Source ↗ {new URL(topic.sourceUrl).hostname}
                          </a>
                        </div>
                    )}
                  </div>
                </div>
              )})}
              
              {topics.length === 0 && (
                  <div className="w-full text-center p-8 border border-dashed border-slate-800 rounded-2xl">
                      <p className="text-xs text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                        No items isolated within the {getTimeText()}
                      </p>
                  </div>
              )}
            </div>

          </div>
        )})}
      </motion.div>
    </motion.div>
  );
}
