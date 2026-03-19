"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { RefreshCw, Download, Filter, MapPin, Info } from "lucide-react";
import GovernedValue from "@/components/ui/GovernedValue";
import {
  GovernedChart,
  getStackedBarOption,
  getTrendOption,
  getRankedMuniOption,
  getScatterOption,
} from "@/components/analytics/GovernedCharts";
import { DashboardOneAggregator } from "@/lib/aggregations/dashboard-one";
import { runDashboardOnePipeline } from "./actions";
import BriefingLayout from "@/components/dashboard/BriefingLayout";
import SignalIntelligenceFeed from "@/components/dashboard/SignalIntelligenceFeed";
import ProvinceMapPanel from "@/components/analytics/ProvinceMapPanel";
import ProvinceExecutiveBriefing from "@/components/analytics/ProvinceExecutiveBriefing";

export default function StateOfTheProvincePage() {
  const searchParams = useSearchParams();
  const province = searchParams.get("province") || "Gauteng";
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadData = async (prov: string) => {
    setLoading(true);
    try {
      const [kpis, breakdown, trend, distribution, matrix, signals] =
        await Promise.all([
          DashboardOneAggregator.getExecutiveKPIs(prov),
          DashboardOneAggregator.getTopicBreakdown(prov),
          DashboardOneAggregator.getConcernTrend(prov),
          DashboardOneAggregator.getMunicipalityDistribution(prov),
          DashboardOneAggregator.getAlignmentMatrix(prov),
          DashboardOneAggregator.getRecentSignals(prov),
        ]);

      setData({ kpis, breakdown, trend, distribution, matrix, signals });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(province);
  }, [province]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await runDashboardOnePipeline(province);
      await loadData(province);
    } catch (error) {
      console.error("Pipeline failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!isMounted || (!data && loading)) {
    return (
      <div className="p-12 text-slate-400 font-black animate-pulse uppercase tracking-[0.2em]">
        Initialising Intelligence Layer...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 pb-24">
      {/* Header */}
      <header className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">
            State of the Province
          </h1>
          <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-xs">
            <MapPin className="w-4 h-4 text-slate-900" />
            <span>Executive Intelligence Layer / {province} Regional View</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Processing Signals..." : "Refresh Intelligence"}
          </button>
          <button className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </header>

      {/* Executive Level Spatial & Narrative Intelligence */}
      <div className="mb-8 mt-6">
        <ProvinceExecutiveBriefing province={province} />
      </div>
      
      <div className="mb-12">
        <ProvinceMapPanel province={province} />
      </div>

      {/* Primary Chart: Concern Trend */}
      <div className="mb-8">
        <GovernedChart
          title="Concern Trend Analysis"
          metric={{
            id: "visual-3",
            label: "Trend Analysis",
            value: null,
            confidence: 0.7,
            rating: "PARTIAL",
            trace: [],
          }}
          option={getTrendOption(data?.trend || [])}
          height="400px"
        />
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-2 gap-8">
        <GovernedChart
          title="Geographic Signal Distribution"
          metric={{
            id: "visual-4",
            label: "Municipality Ranking",
            value: data?.distribution?.length || null,
            confidence: 0.7,
            rating: data?.distribution?.length > 0 ? "PARTIAL" : "INSUFFICIENT",
            trace: [],
          }}
          option={getRankedMuniOption(data?.distribution || [])}
        />
        <GovernedChart
          title="Strategic Alignment Matrix"
          metric={{
            id: "visual-5",
            label: "Alignment Matrix",
            value: data?.matrix?.length || null,
            confidence: 0.6,
            rating: data?.matrix?.length > 0 ? "PARTIAL" : "INSUFFICIENT",
            trace: [],
          }}
          option={getScatterOption(data?.matrix || [])}
          height="450px"
        />
      </div>

      {/* Signal Intelligence Feed */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight italic">
              Signal Intelligence Feed
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              Verified Recent Signals / Ground Truth Traceability
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <SignalIntelligenceFeed
              signals={data?.signals || []}
              loading={loading}
            />
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="z-10 relative">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4">
                  Intelligence Note
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-bold italic opacity-80">
                  "The signals displayed here represent recent detections
                  classified by our strategic intelligence layer. Every signal
                  is traced back to a verified regional source."
                </p>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Info className="w-12 h-12" />
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-3xl p-8">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-slate-900 border-b pb-4">
                Signal Integrity
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-500 uppercase tracking-wider">
                    AI Confidence
                  </span>
                  <span className="text-emerald-600">0.92</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[92%]" />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-500 uppercase tracking-wider">
                    Source Parity
                  </span>
                  <span className="text-blue-600">0.85</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[85%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invisible Print Layout */}
      {data && (
        <div className="hidden print:block">
          <BriefingLayout
            country="South Africa"
            province={province}
            metrics={{ nationalConfidence: 0.8, topRisks: [] }}
            projects={[]}
            sos={{ score: 75, rating: "HIGH", trace: [] }}
            dashboardOneData={data}
          />
        </div>
      )}
    </div>
  );
}
