import { Search, Bell, Filter, MoreHorizontal, MapPin, Activity } from "lucide-react";
import { useGIC } from "@/context/GICContext";

export default function TopBar() {
    const { selectedProvince, selectedMunicipality } = useGIC();

    return (
        <header className="h-20 bg-white/10 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-40">
            {/* Regional HUD - Command Center Awareness */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-2xl border border-white/10">
                    <MapPin className="w-4 h-4 text-gic-blue" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Region</span>
                        <span className="text-[11px] font-black text-white">{selectedProvince || "All Provinces"}</span>
                    </div>
                </div>

                {selectedMunicipality && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                        <Activity className="w-4 h-4 text-amber-500" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest">Focus</span>
                            <span className="text-[11px] font-black text-white">{selectedMunicipality}</span>
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
                         <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-md font-bold">⌘</span>
                         <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-md font-bold">K</span>
                    </div>
                </div>
            </div>

            {/* Action Items */}
            <div className="flex items-center gap-4 ml-8">
                <button className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors relative">
                    <Bell className="w-5 h-5 text-slate-600" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
                <div className="w-[1px] h-6 bg-slate-200 mx-2" />
                <button className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all text-slate-600">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest leading-none">Filters</span>
                </button>
                <button className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                </button>
            </div>
        </header>
    );
}
