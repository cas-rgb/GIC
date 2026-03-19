"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Zap,
  Database,
  Search,
  ShieldAlert,
  Eye,
  Radio,
  Activity,
} from "lucide-react";

import { CommunitySignal } from "@/types";

interface OperationsCenterProps {
  serviceId: string;
  serviceCategory: string;
}

export default function OperationsCenter({
  serviceId,
  serviceCategory,
}: OperationsCenterProps) {
  const currentQueryKey = `${serviceId}:${serviceCategory}`;
  const [state, setState] = useState<{
    signals: CommunitySignal[];
    isLoading: boolean;
    queryKey: string;
  }>({
    signals: [],
    isLoading: true,
    queryKey: currentQueryKey,
  });
  const [filter, setFilter] = useState("");

  useEffect(() => {
    // Scale to 100 signals for high-density monitoring
    const q =
      serviceId === "apex"
        ? query(
            collection(db, "community_signals"),
            orderBy("timestamp", "desc"),
            limit(100),
          )
        : query(
            collection(db, "community_signals"),
            where("category", "==", serviceCategory),
            orderBy("timestamp", "desc"),
            limit(100),
          );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as CommunitySignal,
      );
      setState({
        signals: docs,
        isLoading: false,
        queryKey: currentQueryKey,
      });
    });

    return () => unsubscribe();
  }, [serviceId, serviceCategory, currentQueryKey]);

  const signals = state.queryKey === currentQueryKey ? state.signals : [];
  const isLoading = state.queryKey !== currentQueryKey || state.isLoading;

  const filteredSignals = signals.filter(
    (s) =>
      s.community?.toLowerCase().includes(filter.toLowerCase()) ||
      s.issue?.toLowerCase().includes(filter.toLowerCase()) ||
      s.evidence?.toLowerCase().includes(filter.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-gic-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col space-y-6 overflow-hidden">
      {/* High-Volume Header */}
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-display font-bold text-slate-900 tracking-tight">
            Infrastructure Signal Feed
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 space-x-2">
            <span>Monitoring {signals.length} Institutional Records</span>
            <span className="text-slate-200">|</span>
            <span>{serviceCategory} Domain</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter signals..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] uppercase font-black tracking-widest focus:outline-none focus:border-gic-blue w-64 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Dense Pulse Grid */}
      <div className="flex-1 overflow-y-auto pr-4 space-y-3 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {filteredSignals.map((signal, idx) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.01 }}
              className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-gic-blue shadow-sm hover:shadow-gic-professional transition-all group flex gap-5 items-center"
            >
              {/* Visual Impact Indicator */}
              <div className="flex flex-col items-center gap-2 w-12 border-r border-slate-50 pr-5">
                <div
                  className={`w-3 h-3 rounded-full ${signal.sentiment === "negative" ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"}`}
                />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                  Urgency
                </span>
                <span
                  className={`text-[10px] font-display font-black leading-none ${signal.sentiment === "negative" ? "text-rose-600" : "text-emerald-600"}`}
                >
                  {signal.urgency}
                </span>
              </div>

              {/* Signal Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    {signal.community || "Regional Node"}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                    {signal.platform || "Direct feed"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed truncate max-w-full">
                  "
                  {signal.evidence ||
                    signal.issue ||
                    "Infrastructure stress signature detected."}
                  "
                </p>
              </div>

              {/* Grounding & Verification */}
              <div className="flex items-center gap-6 pl-5 border-l border-slate-50">
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 opacity-40">
                    <Database className="w-2.5 h-2.5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      Entry ID: {signal.id.slice(0, 5)}
                    </span>
                  </div>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                    {signal.timestamp?.seconds
                      ? new Date(
                          signal.timestamp.seconds * 1000,
                        ).toLocaleTimeString()
                      : "LIVE"}
                  </span>
                </div>
                {signal.source && signal.source !== "#" && (
                  <a
                    href={signal.source}
                    target="_blank"
                    className="p-2.5 bg-slate-50 text-slate-400 hover:text-gic-blue hover:bg-white border border-transparent hover:border-gic-blue rounded-xl transition-all shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tactical Intelligence & Site Integrity Scan (NEW) */}
      <div className="grid grid-cols-12 gap-6 mt-2">
        {/* Site Integrity Scan */}
        <div className="col-span-12 lg:col-span-7 bg-slate-900 rounded-[2rem] border border-white/5 overflow-hidden relative group h-[280px]">
          <div className="absolute inset-0 bg-[url('/C:/Users/Dell/.gemini/antigravity/brain/0e8bacdb-bdeb-4cf5-9cc2-15ad09f40c71/regional_satellite_integrity_1773256794472.png')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

          {/* Scanner Overlay */}
          <motion.div
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-gic-blue/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10"
          />

          <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-3 h-3 text-gic-blue" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                  Tactical Site Scan
                </span>
              </div>
              <h4 className="text-xl font-display font-black text-white tracking-tighter">
                Alexandra Sector 4
              </h4>
              <p className="text-[10px] text-white/30 font-medium">
                Real-time Satellite Integrity Monitoring Active
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest transition-all">
                Layer Audit
              </button>
              <button className="px-4 py-2 bg-gic-blue text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
                Inspect Node
              </button>
            </div>
          </div>

          <div className="absolute top-6 right-8">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-800/40 border border-white/10 rounded-full">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Zone Monitored
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Directives */}
        <div className="col-span-12 lg:col-span-5 bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-gic-blue" />
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Active Tactical Directives
              </h3>
            </div>

            <div className="space-y-3">
              <TacticalActionItem
                icon={<ShieldAlert className="w-4 h-4 text-rose-500" />}
                title="Emergency Dispatch"
                description="Deploy rapid response unit to Sector 4."
                status="STANDBY"
              />
              <TacticalActionItem
                icon={<MessageSquare className="w-4 h-4 text-amber-500" />}
                title="Stakeholder Comms"
                description="Trigger automated briefing for local council."
                status="ACTIVE"
              />
              <TacticalActionItem
                icon={<Activity className="w-4 h-4 text-blue-500" />}
                title="System Hardening"
                description="Isolate power grid node 44-B."
                status="PLANNED"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operational Metrics Sub-Bar */}
      <div className="h-14 mt-4 bg-slate-900 rounded-[1.8rem] border border-white/5 flex items-center justify-between px-8">
        <div className="flex gap-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">
              Data Feed: Grounded 2024
            </span>
          </div>
          <div className="flex items-center gap-3 border-l border-white/10 pl-8">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">
              Verification: Strategic Grounding Applied
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest">
            Global Analytics: Processing {filteredSignals.length} Active Nodes
          </span>
        </div>
      </div>
    </div>
  );
}

function TacticalActionItem({ icon, title, description, status }: any) {
  return (
    <div className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl hover:border-gic-blue transition-all cursor-pointer group">
      <div className="p-2.5 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-[11px] font-bold text-slate-900 truncate">
          {title}
        </h5>
        <p className="text-[9px] text-slate-400 font-medium truncate">
          {description}
        </p>
      </div>
      <span
        className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
          status === "ACTIVE"
            ? "bg-amber-100 text-amber-600"
            : status === "STANDBY"
              ? "bg-rose-100 text-rose-600"
              : "bg-slate-100 text-slate-400"
        }`}
      >
        {status}
      </span>
    </div>
  );
}
