// src/app/executive/service-delivery-pressure/ServiceDeliveryPressureClient.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { DashboardTwoAggregator } from '@/lib/aggregations/dashboard-two';
import { ingestDashboardTwoData } from '@/app/intel-actions';
import GovernedValue from '@/components/ui/GovernedValue';
import { GovernedChart } from '@/components/analytics/GovernedCharts';
import PressureCaseFeed from '@/components/dashboard/PressureCaseFeed';
import * as configs from '@/lib/dashboard2-chart-configs';
import { Database, AlertTriangle, ShieldCheck, Filter, Download, ExternalLink, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ServiceDeliveryPressureClient() {
  const [province, setProvince] = useState("Gauteng");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);

  const provinces = ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Limpopo", "Mpumalanga", "North West", "Free State", "Northern Cape"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await DashboardTwoAggregator.getServicePressureData(province);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch Dashboard 2 data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [province]);

  const handleIngest = async () => {
    setIngesting(true);
    try {
      await ingestDashboardTwoData([province]);
      await fetchData();
    } catch (err) {
      console.error("Ingestion control failed:", err);
    } finally {
      setIngesting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 text-slate-200 animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Risk Console...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const visuals = data?.visuals || {};

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-100 px-8 py-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded uppercase tracking-tighter border border-rose-100">
                Operational Warning Layer
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                GIC Executive intelligence
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              Service Delivery Pressure
            </h1>
            <p className="text-slate-500 font-medium text-sm max-w-2xl">
              Cross-sector friction analysis, community stress acceleration, and municipality exposure rankings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
              {provinces.slice(0, 2).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvince(p)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    province === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {p}
                </button>
              ))}
              <div className="relative group">
                <button className="px-4 py-2 text-slate-400 hover:text-slate-600"><Filter className="w-4 h-4" /></button>
              </div>
            </div>
            <button 
              onClick={handleIngest}
              disabled={ingesting}
              className="bg-gic-gold text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gic-gold-bright transition-all shadow-xl shadow-gic-gold/10 disabled:opacity-50"
            >
              {ingesting ? <Activity className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {ingesting ? "Extracting Risk..." : "Sync Live Intelligence"}
            </button>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
              <Download className="w-4 h-4" /> Export Risk Brief
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8 space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <GovernedValue 
              metric={kpis.activePressure} 
              valueClassName="text-4xl"
              showTrace 
            />
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <GovernedValue 
              metric={kpis.topDomain} 
              valueClassName="text-xl"
              showTrace 
            />
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
             <GovernedValue 
              metric={kpis.trajectory} 
              valueClassName="text-2xl"
              trend={kpis.trajectory?.value?.direction}
              showTrace 
            />
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <GovernedValue 
              metric={kpis.exposedMuni} 
              valueClassName="text-xl"
              showTrace 
            />
          </div>
        </div>

        {/* Primary Analysis Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stress Matrix - 2/3 Width */}
          <div className="lg:col-span-2">
            <GovernedChart 
              title="Community Stress & Escalation Matrix"
              metric={kpis.activePressure} // Pivot for matrix confidence
              option={configs.getStressMatrixConfig(visuals.matrix || [])}
              height="500px"
            />
          </div>

          {/* Service Breakdown - 1/3 Width */}
          <div>
            <GovernedChart 
              title="Service Pressure Breakdown"
              metric={kpis.topDomain}
              option={configs.getPressureBreakdownConfig(visuals.breakdown || [])}
              height="500px"
            />
          </div>
        </div>

        {/* Secondary Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GovernedChart 
            title="Municipality Exposure Ranking"
            metric={kpis.exposedMuni}
            option={configs.getExposureRankingConfig(visuals.exposure || [])}
            height="400px"
          />
          <GovernedChart 
            title="Operational Pressure Trend"
            metric={kpis.trajectory}
            option={configs.getPressureTrendConfig(visuals.trend || [])}
            height="400px"
          />
        </div>

        {/* Intelligence Feed */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Database className="w-4 h-4 text-rose-500" /> Operational Risk Ground Truth
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Signals classified as High Pressure or Escalating</p>
            </div>
            <button className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1">
              View All <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="p-8">
             <PressureCaseFeed signals={data?.kpis?.recentCases} />
          </div>
        </div>
      </main>
    </div>
  );
}
