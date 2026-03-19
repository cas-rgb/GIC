"use client";

import { motion } from "framer-motion";
import { Loader2, Inbox, AlertOctagon } from "lucide-react";

export function LoadingState({ message = "Retrieving Intelligence..." }) {
  return (
    <div className="p-20 flex flex-col items-center justify-center text-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl border-4 border-slate-100 animate-pulse" />
        <Loader2 className="w-8 h-8 text-gic-blue animate-spin absolute inset-0 m-auto" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
        {message}
      </p>
    </div>
  );
}

export function EmptyState({
  title = "No Intelligence Gathered",
  subtitle = "System is ready for ingestion.",
}) {
  return (
    <div className="p-20 flex flex-col items-center justify-center text-center space-y-6 grayscale opacity-40">
      <Inbox className="w-12 h-12 text-slate-400" />
      <div>
        <h4 className="text-lg font-display font-bold text-slate-900 uppercase tracking-tight">
          {title}
        </h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export function ErrorState({
  message = "Security Protocol Interrupted Connection",
}) {
  return (
    <div className="p-20 flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <div>
        <h4 className="text-lg font-display font-bold text-slate-900 uppercase tracking-tight">
          System Fault
        </h4>
        <p className="text-[11px] font-medium text-slate-500 mt-2">{message}</p>
      </div>
      <button className="gic-btn border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
        Re-Authenticate
      </button>
    </div>
  );
}
