"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Newspaper,
  ExternalLink,
  Globe,
  Clock,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

interface EvidencePulseProps {
  serviceId: string;
  serviceCategory: string;
}

export default function EvidencePulse({
  serviceId,
  serviceCategory,
}: EvidencePulseProps) {
  const [signals, setSignals] = useState<any[]>([]);

  useEffect(() => {
    let q = query(
      collection(db, "community_signals"),
      orderBy("timestamp", "desc"),
      limit(20),
    );

    // Filter by category if not apex
    if (serviceId !== "apex") {
      q = query(
        collection(db, "community_signals"),
        where("category", "==", serviceCategory),
        orderBy("timestamp", "desc"),
        limit(20),
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSignals(docs);
    });

    return () => unsubscribe();
  }, [serviceId, serviceCategory]);

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 overflow-hidden font-sans">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
            Evidence Pulse
          </h3>
          <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight mt-1">
            Ground Integrity Feed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[8px] font-black text-gray-400 uppercase">
            Live Stream
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4">
        <AnimatePresence initial={false}>
          {(signals || []).map((signal) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:border-blue-300 transition-all group shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {signal.source_type === "social" ? (
                    <MessageSquare className="w-3 h-3 text-blue-500" />
                  ) : (
                    <Newspaper className="w-3 h-3 text-emerald-600" />
                  )}
                  <span className="text-[9px] font-black text-gray-900 uppercase tracking-tight">
                    {signal.source_name || "Public Signal"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 grayscale opacity-50">
                  <Clock className="w-2.5 h-2.5" />
                  <span className="text-[8px] text-gray-500 font-bold uppercase">
                    Recent
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-gray-600 font-bold leading-relaxed line-clamp-3 mb-4 italic">
                "{signal.content || signal.issue}"
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-2">
                  <span className="text-[7px] font-black bg-white text-gray-400 px-2 py-0.5 rounded border border-gray-100 uppercase">
                    {signal.detected_location}
                  </span>
                  <span
                    className={`text-[7px] font-black px-2 py-0.5 rounded border uppercase ${
                      signal.sentiment === "negative"
                        ? "bg-red-50 text-red-600 border-red-100"
                        : signal.sentiment === "positive"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    {signal.sentiment}
                  </span>
                </div>
                {signal.url && (
                  <a
                    href={signal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-300 hover:text-blue-500 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
        <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Verified GIC Public Signal Stream
        </span>
      </div>
    </div>
  );
}
