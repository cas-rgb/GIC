"use client";

import { Suspense } from "react";
import SocialTrendsDashboardClient from "@/components/analytics/SocialTrendsDashboardClient";

export default function SocialTrendsPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={
        <div className="flex items-center justify-center p-12 min-h-[400px]">
          <div className="animate-pulse flex flex-col items-center">
             <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
             <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Initializing Signal Monitor Space...</p>
          </div>
        </div>
      }>
        <SocialTrendsDashboardClient />
      </Suspense>
    </div>
  );
}
