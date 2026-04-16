"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Activity, Cpu, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";

interface AgenticInvestigationModalProps {
  isOpen: boolean;
  targetEntity: string | null;
  onClose: () => void;
}

export default function AgenticInvestigationModal({ isOpen, targetEntity, onClose }: AgenticInvestigationModalProps) {
  const [status, setStatus] = useState<"idle" | "investigating" | "complete" | "error">("idle");
  const [dossier, setDossier] = useState<string | null>(null);
  const [recursiveLoops, setRecursiveLoops] = useState(0);

  useEffect(() => {
    if (!isOpen || !targetEntity) return;
    
    setStatus("investigating");
    setDossier(null);
    setRecursiveLoops(0);

    const runInvestigation = async () => {
      try {
        const response = await fetch("/api/intelligence/agentic-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetEntity })
        });

        const data = await response.json();

        if (response.ok) {
          setDossier(data.dossier);
          setRecursiveLoops(data.recursiveLoops || 0);
          setStatus("complete");
        } else {
          setDossier(data.error || "A severe networking anomaly blocked execution.");
          setStatus("error");
        }
      } catch (err) {
        console.error(err);
        setDossier("System crashed during agentic synthesis.");
        setStatus("error");
      }
    };

    runInvestigation();
  }, [isOpen, targetEntity]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {status === "investigating" && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 shadow-[0_0_20px_#3b82f6]"></div>
            </div>
          )}

          <div className="flex items-center justify-between p-6 border-b border-zinc-800/50 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              {status === "investigating" ? (
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              ) : status === "complete" ? (
                  <ShieldAlert className="w-6 h-6 text-emerald-500" />
              ) : (
                  <Activity className="w-6 h-6 text-rose-500" />
              )}
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  Declassified Intelligence Dossier 
                  {status === "investigating" && <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>}
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{targetEntity}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white bg-zinc-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto bg-black text-zinc-300 font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30">
            {status === "investigating" && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center text-zinc-500">
                <Cpu className="w-12 h-12 text-blue-500/50 mb-6 animate-pulse" />
                <p className="mb-2 text-xs uppercase tracking-[0.2em] font-bold text-blue-400">Autonomous Execution Active</p>
                <p className="text-[10px] max-w-sm mx-auto">
                   The Agentic Investigator is recursively mining public data, establishing hidden entity nodes, and verifying geospatial constraints. This deep traversal may take up to 60 seconds depending on network depth.
                </p>
                <div className="mt-8 flex gap-2">
                   <div className="w-1 h-8 bg-blue-500/40 animate-pulse delay-75"></div>
                   <div className="w-1 h-12 bg-blue-500/60 animate-pulse delay-150"></div>
                   <div className="w-1 h-6 bg-blue-500/30 animate-pulse delay-300"></div>
                   <div className="w-1 h-16 bg-blue-500/80 animate-pulse delay-200"></div>
                   <div className="w-1 h-10 bg-blue-500/50 animate-pulse delay-100"></div>
                </div>
              </div>
            )}
            
            {status === "complete" && dossier && (
               <div className="space-y-6">
                 <div className="flex items-center gap-4 text-[10px] font-black tracking-widest uppercase border-b border-zinc-800 pb-4">
                    <span className="text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Clearance: Level 9</span>
                    <span className="text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Recursion Depth: {recursiveLoops}</span>
                 </div>
                 <div dangerouslySetInnerHTML={{ __html: dossier.replace(/\n/g, '<br/>') }} className="text-zinc-200" />
               </div>
            )}

            {status === "error" && (
               <div className="flex flex-col items-center justify-center h-full py-12 text-center text-rose-500">
                 <ShieldAlert className="w-12 h-12 mb-4" />
                 <p className="font-bold tracking-widest uppercase">{dossier}</p>
               </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
