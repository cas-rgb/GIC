"use client";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

interface ProgressSpinnerProps {
  message?: string;
  durationMs?: number;
}

export default function ProgressSpinner({ 
  message = "Synthesizing AI Intelligence...", 
  durationMs = 8000 
}: ProgressSpinnerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // We want to hit 99% just before the expected duration
    const intervalTime = durationMs / 99;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          clearInterval(timer);
          return 99;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [durationMs]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Background Circle */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle 
            cx="40" 
            cy="40" 
            r="36" 
            className="stroke-slate-800" 
            strokeWidth="4" 
            fill="none" 
          />
          {/* Progress Circle */}
          <circle 
            cx="40" 
            cy="40" 
            r="36" 
            className="stroke-sky-500 transition-all duration-300 ease-out" 
            strokeWidth="4" 
            fill="none" 
            strokeDasharray="226" 
            strokeDashoffset={226 - (226 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex items-center justify-center text-sm font-bold text-sky-400 font-display">
          {progress}%
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        <RefreshCw className="h-4 w-4 animate-spin text-sky-500" />
        {message}
      </div>
    </div>
  );
}
