"use client";

import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary";
import { AlertTriangle, RefreshCcw } from "lucide-react";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900/90 border border-red-900/30 rounded-2xl text-center h-full min-h-[250px]">
      <AlertTriangle className="w-10 h-10 text-rose-500 mb-4" />
      <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-2">Module Offline</h3>
      <p className="text-[10px] text-slate-400 max-w-sm mb-6 line-clamp-3 leading-relaxed">
        {(error as any).message || "A rendering fault or null reference forced this module offline to protect the command center feed."}
      </p>
      <button 
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
      >
        <RefreshCcw className="w-4 h-4" /> Reboot Subsystem
      </button>
    </div>
  );
}

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
