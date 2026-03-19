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
    console.error("Dashboard Render Error Caught:", error);
  }, [error]);

  const isDBCrash = error.message.includes("Offline Maintenance Mode") || error.message.includes("Database") || error.message.includes("connect") || error.message.includes("fetch");

  return (
    <div className="flex h-full min-h-[600px] w-full items-center justify-center p-8 bg-slate-900 absolute inset-0 z-50">
      <div className="flex flex-col items-center text-center max-w-lg p-10 bg-slate-800 rounded-[2rem] border border-slate-700 shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
          <ServerCrash className="w-10 h-10 text-rose-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">
          {isDBCrash ? "Offline Maintenance Mode" : "Component Error"}
        </h2>
        
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          {isDBCrash 
            ? "The platform is currently operating in offline maintenance mode due to database or core service unavailability. Our engineers have been dispatched. Please stand by."
            : "A critical UI or service fault occurred while rendering this dashboard. The issue has been automatically logged."}
        </p>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => reset()}
            className="flex items-center space-x-2 px-6 py-3 bg-gic-blue text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gic-blue/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Attempt Recovery</span>
          </button>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-8 text-left bg-slate-950/50 p-4 rounded-xl w-full max-h-40 overflow-y-auto">
            <p className="text-[10px] text-rose-400 font-mono break-all">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
