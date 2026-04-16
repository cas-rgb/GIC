"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import KPIRibbon from "@/components/ui/KPIRibbon";
import GICCard from "@/components/ui/GICCard";
import { EmptyState } from "@/components/ui/FeedbackStates";
import {
  MapPin,
  Globe,
  ShieldAlert,
  Activity,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  MessageSquare,
  Building2,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGIC } from "@/context/GICContext";
import { getCommunityIntelligence, getCommunityBlueprintData } from "@/app/intel-actions";

export default function Communities() {
  const { selectedProvince } = useGIC();
  const [communities, setCommunities] = useState<any[]>([]);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeCommunity, setActiveCommunity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial State Loading
  useEffect(() => {
    if (!selectedProvince) {
      setCommunities([]);
      setBlueprint(null);
      setActiveCommunity(null);
      setIsLoading(false);
      return;
    }

    async function loadCommandMatrix() {
      setIsLoading(true);
      const res = await getCommunityIntelligence(selectedProvince);
      if (res.success && res.communities) {
        
        // Calculate Neglect Index directly on client for immediacy
        const sorted = [...res.communities].sort((a, b) => {
           const calcNeglect = (c: any) => ((100 - (c.infrastructureScore || 50)) * (c.riskScore || 50));
           return calcNeglect(b) - calcNeglect(a);
        });
        
        setCommunities(sorted);
        
        // Automatically set the most neglected as active target
        if (sorted.length > 0) {
          const target = sorted[0];
          setActiveCommunity(target);
          
          setIsSynthesizing(true);
          const blueRes = await getCommunityBlueprintData(selectedProvince, target.municipality || target.name);
          if (blueRes.success) setBlueprint(blueRes.data);
          setIsSynthesizing(false);
        }
      }
      setIsLoading(false);
    }
    loadCommandMatrix();
  }, [selectedProvince]);

  // Handle active community swap
  const extractBlueprint = async (community: any) => {
    if (!selectedProvince) return;
    setActiveCommunity(community);
    setIsSynthesizing(true);
    setBlueprint(null);
    const blueRes = await getCommunityBlueprintData(selectedProvince, community.municipality || community.name);
    if (blueRes.success) setBlueprint(blueRes.data);
    setIsSynthesizing(false);
  };

  if (!selectedProvince) {
    return (
      <div className="pb-24 px-8 min-h-[80vh] flex items-center justify-center">
        <EmptyState 
          title="Awaiting Geographic Target" 
          subtitle="Select a province from the top filter bar to generate the tactical blueprint." 
        />
      </div>
    );
  }

  const avgInfra = communities.length > 0 
    ? communities.reduce((acc, c) => acc + (c.infrastructureScore || 50), 0) / communities.length 
    : 0;

  const urgentWards = communities.filter(c => c.riskScore > 75 || c.infrastructureScore < 40).length;

  return (
    <div className="pb-24">
      <PageHeader
        title="State of the Municipality & Wards"
        subtitle="Priority Target Acquistion • AI Community Blueprints • Systemic Neglect Monitoring"
        guidingQuestion="Where should GIC and political leaders concentrate immediate capital execution to stabilize critical pressure?"
        headerImage="/projects/Breipaal-17-1024x683.webp"
        actions={
          <button className="gic-btn gic-btn-primary flex items-center gap-3">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Deploy Crisis Response
            </span>
          </button>
        }
      />

      <div className="px-8 md:px-12 space-y-8">
        
        {/* Local Command Summary */}
        <KPIRibbon
          kpis={[
            {
              label: "Monitored Municipalities",
              value: communities.length.toLocaleString(),
              color: "slate",
            },
            {
              label: "Average Infrastructure",
              value: `${avgInfra.toFixed(1)}%`,
              trend: "Degrading",
              trajectory: "down",
              color: "rose",
            },
            {
              label: "Critical Interventions",
              value: urgentWards.toString(),
              color: "rose",
            },
            {
              label: "Systemic Neglect Index",
              value: `${urgentWards > 0 ? "High Exposure" : "Stabilized"}`,
              color: urgentWards > 0 ? "rose" : "blue",
            },
          ]}
        />

        {/* AI Synthesis Hub - Replicates Strategic Insights Feel */}
        <div className="grid grid-cols-12 gap-8">
          
          <div className="col-span-12 xl:col-span-8 space-y-8">
            <GICCard
              premium
              title={`Strategic Blueprint: ${activeCommunity?.municipality || activeCommunity?.name || "Awaiting Target"}`}
              subtitle="Generative Historical Audit & Prescriptive Leadership Messaging"
              icon={<FileText className="w-5 h-5 text-gic-blue" />}
            >
              {isSynthesizing ? (
                <div className="p-16 flex flex-col items-center justify-center space-y-6">
                  <div className="w-16 h-16 rounded-3xl border-4 border-slate-100 animate-pulse" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
                    Synthesizing Systemic History...
                  </p>
                </div>
              ) : blueprint ? (
                <div className="p-8 space-y-8">
                  {/* Historical Context */}
                  <div className="space-y-4 relative">
                    <div className="absolute -left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-transparent rounded-r-xl" />
                    <div className="flex items-center gap-3 mb-2">
                       <TrendingUp className="w-4 h-4 text-rose-500" />
                       <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Historical Issues & Protests</h3>
                    </div>
                    <p className="text-slate-900 leading-relaxed font-medium">
                      {blueprint.blueprint.historicalContext}
                    </p>
                  </div>
                  
                  {/* Community Reality */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                       <Users className="w-4 h-4 text-emerald-500" />
                       <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Community Reality</h3>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-slate-700 italic leading-relaxed">
                          "{blueprint.blueprint.communityExperience}"
                        </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                    {/* GIC Action */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-4 h-4 text-gic-blue" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Proposed GIC Action</h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {blueprint.blueprint.gicIntervention}
                      </p>
                    </div>
                    
                    {/* Leadership Focus */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="w-4 h-4 text-purple-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Political Focus / Narrative</h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {blueprint.blueprint.politicalFocus}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Required for Synthesis</p>
                </div>
              )}
            </GICCard>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white px-2 uppercase tracking-wide">Action Priorities</h3>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-full">Sorted by Systemic Neglect</span>
            </div>
            
            <div className="space-y-3">
              {communities.slice(0,8).map((comm) => (
                <button 
                  key={comm.id} 
                  onClick={() => extractBlueprint(comm)}
                  className={`w-full p-5 rounded-2xl border transition-all text-left flex items-center justify-between group ${activeCommunity?.id === comm.id ? 'bg-[#0B0F17] border-primary shadow-lg shadow-primary/20' : 'bg-[#0B0F17]/60 border-white/10 hover:border-white/30 hover:bg-[#0B0F17]'}`}
                >
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-sm font-bold text-white group-hover:text-primary-light transition-colors">{comm.municipality || comm.name}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Risk: {comm.riskScore || '0'}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Infra: {comm.infrastructureScore || '0'}</span>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 ${activeCommunity?.id === comm.id ? 'text-primary' : 'text-white/20 group-hover:text-white/60'}`} />
                </button>
              ))}
              
              {communities.length === 0 && (
                <div className="py-12 text-center text-white/40 text-xs">No localized targets.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
