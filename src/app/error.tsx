"use client";

import { useEffect } from "react";
import { ServerCrash, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Run-Time Crash Wrapped:", error);
  }, [error]);

  const isDBCrash = error.message.includes("Offline Maintenance Mode") || error.message.includes("Database") || error.message.includes("connect") || error.message.includes("fetch");

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-sans selection:bg-gic-blue/20">
      <div className="text-center p-12 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl max-w-lg relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 z-0 bg-transparent opacity-5"
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
            <ServerCrash className="w-10 h-10 text-rose-500" />
            </div>
            
            <h1 className="text-2xl font-black tracking-tight mb-2 uppercase text-white">
            {isDBCrash ? "Database Offline" : "System Halt"}
            </h1>
            
            <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed max-w-sm mx-auto">
            {isDBCrash 
                ? "The GIC Data Hub is currently running in offline maintenance mode due to a Postgres connectivity disruption. Please retry the connection."
                : "A critical architectural fault occurred within the GIC Next.js instance. The trace has been routed to engineering."}
            </p>

            <button 
                onClick={() => reset()}
                className="gic-btn gic-btn-primary w-full text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
                <RefreshCw className="w-4 h-4" /> Restart Services
            </button>

            {process.env.NODE_ENV !== "production" && (
            <div className="mt-8 text-left bg-slate-950 p-4 border border-slate-800 rounded-xl w-full max-h-40 overflow-y-auto">
                <p className="text-[10px] text-rose-400 font-mono break-all">{error.message}</p>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
