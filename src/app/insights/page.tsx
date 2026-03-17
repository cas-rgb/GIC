"use client";

import PageHeader from "@/components/ui/PageHeader";
import KPIRibbon from "@/components/ui/KPIRibbon";
import GICCard from "@/components/ui/GICCard";
import { Zap, Target, TrendingUp, Lightbulb, ArrowRight, ShieldCheck, Activity, BarChart3 } from "lucide-react";
import { IntelligenceEngine } from "@/lib/intelligence-engine";
import { useState, useEffect } from "react";
import { useGIC } from "@/context/GICContext";
import { getRegionalIntelligence } from "@/app/intel-actions";

export default function StrategicInsights() {
    const { selectedProvince } = useGIC();
    const [brief, setBrief] = useState<any>(null);
    const [boardroom, setBoardroom] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadInsights() {
            setIsLoading(true);
            const province = selectedProvince || "Gauteng";
            const [briefData, boardroomData] = await Promise.all([
                IntelligenceEngine.getExecutiveBrief("South Africa", province),
                IntelligenceEngine.getBoardroomPortfolioSummary()
            ]);
            setBrief(briefData);
            setBoardroom(boardroomData);
            setIsLoading(false);
        }
        loadInsights();
    }, [selectedProvince]);

    if (isLoading || !brief || !boardroom) return <div className="h-screen flex items-center justify-center">
         <div className="flex flex-col items-center gap-6">
            <img src="/gic-logo.svg" alt="GIC" className="h-12 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Synthesizing Strategic Intelligence...</p>
        </div>
    </div>;

    return (
        <div className="">
            <PageHeader 
                title="Strategic Insights" 
                subtitle="AI-Driven Synthesis & Recommendation Hub"
                breadcrumb={[{ name: "Strategic Insights" }]}
                actions={
                    <button className="gic-btn gic-btn-primary flex items-center gap-3">
                        <Zap className="w-4 h-4 text-gic-blue" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Run Fresh Synthesis</span>
                    </button>
                }
            />

            <KPIRibbon kpis={[
                { label: 'Synthesis Depth', value: 'Apex', color: 'blue' },
                { label: 'Opportunity Index', value: 'High', trend: '+12%', color: 'gold' },
                { label: 'Risk Mitigation', value: '84%', trend: 'Optimal', color: 'slate' },
                { label: 'Priority Clusters', value: '04', color: 'blue' },
            ]} />

            <div className="grid grid-cols-12 gap-8">
                {/* AI Summary Panel */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <GICCard premium title="Command Brief: Regional Resilience" subtitle="System-Generated Strategic Narrative" icon={<Zap className="w-5 h-5 text-gic-blue" />}>
                        <div className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-gic-hard relative overflow-hidden mb-8">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-gic-blue blur-[100px] opacity-10" />
                             <div className="relative z-10 space-y-6">
                                <h4 className="text-2xl font-display font-bold text-white tracking-tight uppercase">Sovereign Deployment Brief</h4>
                                <p className="text-sm font-medium leading-relaxed opacity-80 italic">
                                    "{brief.summary}"
                                </p>
                                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                     <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">Confidence: {(brief.confidence * 100).toFixed(1)}%</span>
                                     <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">Data Points: {brief.dataDensity}</span>
                                </div>
                             </div>
                        </div>

                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Intervention Strategy</h5>
                            <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl group transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-slate-200">
                                        <Lightbulb className="w-6 h-6 text-gic-gold" />
                                    </div>
                                    <div className="flex-1">
                                        <h6 className="text-sm font-bold text-slate-900">Recommended Action</h6>
                                        <p className="text-xs text-slate-500 mt-1">{brief.recommendation}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GICCard>
                </div>

                {/* Regional Health */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                    <GICCard title="Systemic Stability" subtitle="National Resilience Index" icon={<Target className="w-5 h-5 text-gic-gold" />}>
                        <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                             <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region Quality</span>
                                <span className="text-xs font-black text-emerald-500 uppercase">Optimal</span>
                             </div>
                             <div className="text-center">
                                 <p className="text-5xl font-display font-black text-slate-900 mb-2">{(brief.confidence * 100).toFixed(0)}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Data Integrity Index</p>
                             </div>
                        </div>
                    </GICCard>

                     <GICCard title="Advanced Data Command" subtitle="Institutional BI Linkage" icon={<BarChart3 className="w-5 h-5 text-gic-blue" />}>
                          <div className="space-y-6">
                              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                                 Connect real-time Firestore pipelines to Looker Studio for multidimensional institutional analysis and PDF reporting.
                              </p>
                              
                              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                                  <div className="flex justify-between items-center">
                                      <span className="text-[9px] font-black uppercase text-slate-400">Project Nodes</span>
                                      <span className="text-[10px] font-bold text-slate-900">{boardroom.totalProjects} Linked</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                      <span className="text-[9px] font-black uppercase text-slate-400">Risk Signals</span>
                                      <span className="text-[10px] font-bold text-slate-900">{brief.dataDensity} Active</span>
                                  </div>
                                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-gic-blue w-[92%]" />
                                  </div>
                              </div>

                              <button 
                                onClick={() => window.open('file:///C:/Users/Dell/.gemini/antigravity/brain/fe209c20-889f-4813-aaa0-f2cc69a75239/looker_studio_guide.md', '_blank')}
                                className="gic-btn gic-btn-primary w-full flex items-center justify-center gap-3 shadow-gic-neon py-5"
                              >
                                  <Target className="w-4 h-4" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Activate Looker Uplink</span>
                              </button>
                          </div>
                     </GICCard>

                    <GICCard title="System Health" subtitle="Integrity & Confidence" icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}>
                         <div className="p-10 text-center">
                             <div className="relative inline-block mb-6">
                                <Activity className="w-16 h-16 text-emerald-50 mx-auto" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-emerald-500/50 shadow-lg animate-pulse" />
                                </div>
                             </div>
                             <h4 className="text-4xl font-display font-bold text-slate-900 tracking-tighter uppercase">Apex</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Operational State</p>
                         </div>
                    </GICCard>
                </div>
            </div>
        </div>
    );
}
