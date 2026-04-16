import {
  Search,
  Bell,
  Filter,
  MoreHorizontal,
  MapPin,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function TopBar() {
  const searchParams = useSearchParams();
  const [pulseCount, setPulseCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/analytics/notification-pulse')
      .then(r => r.json())
      .then(d => setPulseCount(d.count))
      .catch(() => {});
  }, []);
  
  // Gracefully fallback to local storage if URL params are temporarily blank during transit
  const getLocal = (key: string, def: string) => {
    if (typeof window !== "undefined") return localStorage.getItem(key) || def;
    return def;
  };

  const selectedProvince = searchParams.get("province") || getLocal("gicFilter_province", "Gauteng");
  const selectedMunicipality = searchParams.get("municipality") && searchParams.get("municipality") !== "All Municipalities" 
    ? searchParams.get("municipality") 
    : null;

  const TICKER_ITEMS = [
    { text: "SYSTEM STATUS: SECURE", color: "text-emerald-500" },
    { text: "INTELLIGENCE INTERCEPT: 12 NEW SIGNALS ISOLATED IN JOHANNESBURG", color: "text-rose-500" },
    { text: "WATER INFRASTRUCTURE PRESSURE ELEVATED", color: "text-amber-500" },
    { text: "GIC INTELLIGENCE GRID ONLINE", color: "text-blue-500" },
    { text: "DEEP DATA EXTRACTION PIPELINE ACTIVE", color: "text-slate-400" },
    { text: "SENTIMENT INDEX: DECLINING (BEARISH)", color: "text-rose-500" },
    { text: "PREDICTIVE MODELING ENGINE ONLINE", color: "text-purple-400" },
    { text: "REGIONAL VULNERABILITY SCORE: 68/100", color: "text-amber-500" },
  ];

  return (
    <div className="sticky top-0 z-40 font-sans">
      {/* Live Intelligence Ticker (Command Center Aesthetic) */}
      <div className="w-full h-6 bg-[#030712] border-b border-white/5 flex items-center overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee-fast">
          {/* Double map to ensure seamless looping without gaps */}
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="flex items-center">
              <span className={`text-[9px] font-black tracking-[0.2em] uppercase \${item.color} ml-12`}>
                {item.text}
              </span>
              <span className="text-white/20 ml-12 text-[8px] tracking-[0.3em]">///</span>
            </div>
          ))}
        </div>
      </div>

      <header className="h-20 bg-slate-900/90 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-10">
      {/* Regional HUD - Command Center Awareness */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-2xl border border-white/10">
          <MapPin className="w-4 h-4 text-gic-blue" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">
              Region
            </span>
            <span className="text-[11px] font-black text-white">
              {selectedProvince || "All Provinces"}
            </span>
          </div>
        </div>

        {selectedMunicipality && (
          <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Activity className="w-4 h-4 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest">
                Focus
              </span>
              <span className="text-[11px] font-black text-white">
                {selectedMunicipality}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Search Area */}
      <div className="flex-1 max-w-lg mx-8">
        <div className="group relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-gic-dark transition-colors" />
          <input
            type="text"
            placeholder="Search Service Delivery, Sentiment, or Regional Risks..."
            className="w-full bg-slate-50 border border-transparent focus:border-gic-dark/10 focus:bg-white px-12 py-2.5 rounded-2xl text-[13px] font-medium outline-none transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40 group-focus-within:opacity-100 transition-opacity">
            <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-md font-bold">
              ⌘
            </span>
            <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-md font-bold">
              K
            </span>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="flex items-center gap-4 ml-8">
        <button className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors relative">
          <Bell className="w-5 h-5 text-slate-600" />
          {pulseCount > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 min-w-[16px] flex items-center justify-center bg-red-500 rounded-full border-2 border-white text-[8px] font-black text-white leading-none">
               {pulseCount > 99 ? '99+' : pulseCount}
            </span>
          )}
        </button>
        <div className="w-[1px] h-6 bg-slate-200 mx-2" />
        <button className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all text-slate-600">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest leading-none">
            Filters
          </span>
        </button>
        <button className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
          <MoreHorizontal className="w-5 h-5 text-slate-400" />
        </button>
      </div>
      </header>
    </div>
  );
}
