"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Droplets, 
  Home, 
  Map as MapIcon, 
  ShieldAlert, 
  Clock, 
  MoreVertical,
  Download,
  Bell
} from "lucide-react";
import { MOCK_COMMUNITIES } from "@/data/mock-database";
import { motion } from "framer-motion";
import StakeholderMapping from "@/components/dashboard/StakeholderMapping";
import RiskVectorRadar from "@/components/dashboard/RiskVectorRadar";


export default function CommunityProfile() {
  const { id } = useParams();
  const router = useRouter();
  
  // Find community by ID (handling the 'comm-' prefix or raw ID)
  const community = MOCK_COMMUNITIES.find(c => c.id === id || c.id === `comm-${id}`);

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] text-white">
        <div className="text-center space-y-4">
          <p className="text-white/40">Community intelligence node not found.</p>
          <button onClick={() => router.push('/communities')} className="text-primary font-bold">Return to Grid</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white pb-24">
      {/* Premium Hero Banner */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <img 
          src={community.image} 
          alt={community.name}
          className="w-full h-full object-cover opacity-40 grayscale-[0.5] contrast-[1.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent" />
        
        {/* Navigation & Actions */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-white/60 group-hover:text-white" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/60 group-hover:text-white">Back to Hub</span>
          </button>
          
          <div className="flex gap-3">
             <button className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                <Bell className="w-4 h-4 text-white/60" />
             </button>
             <button className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                <Download className="w-4 h-4 text-white/60" />
             </button>
          </div>
        </div>

        {/* Title & Stats */}
        <div className="absolute bottom-12 left-12 right-12 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-[10px] font-black text-primary uppercase tracking-tighter">
                Certified Sector
              </span>
              <span className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                Updated 12m ago
              </span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter">{community.name}</h1>
            <div className="flex items-center gap-4 text-white/60">
               <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <MapIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{community.province}, South Africa</span>
               </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Risk Assessment</p>
              <p className={`text-xl font-black uppercase tracking-tighter ${
                community.riskScore > 75 ? 'text-rose-500' : 'text-emerald-500'
              }`}>
                {community.priorityStatus || 'Stable'}
              </p>
            </div>
            <div className="px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Global Confidence</p>
              <p className="text-xl font-black tracking-tighter text-blue-400">92%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-[1600px] mx-auto px-12 grid grid-cols-12 gap-8 -mt-8">
        
        {/* Metric Ribbon */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6 z-30">
          <MetricCard label="Population" value={community.population.toLocaleString()} trend="+1.2%" isUp />
          <MetricCard label="Priority Score" value={`${(community.riskScore / 10).toFixed(1)}/10`} detail="CRITICAL" color="rose" />
          <MetricCard label="Infra Index" value={`${community.infrastructureScore}%`} trend="-2.1%" isUp={false} color="blue" />
          <MetricCard label="Sentiment Score" value="74%" trend="+4.2%" isUp color="emerald" />
        </div>

        {/* Primary Intelligence Section */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Sector Overview & Intelligence */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                      <Activity className="w-6 h-6 text-blue-400" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold">Sector Overview & Intelligence</h3>
                      <p className="text-xs text-white/40">Real-time infrastructure pulse tracking</p>
                   </div>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                   {['1D', '1W', '1M'].map(t => (
                     <button key={t} className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${t === '1W' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>{t}</button>
                   ))}
                </div>
             </div>

             {/* Dynamic Bar Chart Simulation */}
             <div className="h-64 flex items-end justify-between gap-4 px-4">
                {[45, 62, 38, 74, 55, 89, 72].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                     <div 
                       className="w-full bg-blue-500/20 border border-blue-500/30 rounded-t-xl group-hover:bg-primary/40 group-hover:border-primary/50 transition-all duration-500" 
                       style={{ height: `${h}%` }} 
                     />
                     <span className="text-[10px] font-bold text-white/20 group-hover:text-white/60">
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i]}
                     </span>
                  </div>
                ))}
             </div>
             <p className="text-xs text-white/30 italic">
               * Activity patterns indicate a significant spike in infrastructure-related complaints on Saturday, correlating with the scheduled maintenance cycle in Sector 4.
             </p>
          </div>

          {/* Critical Systems Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SystemStatusCard 
              label="Water Supply" 
              icon={<Droplets />} 
              value="94.2%" 
              trend="+0.4" 
              subtext="Operational Capacity"
              color="blue"
            />
            <SystemStatusCard 
              label="Electrical Grid" 
              icon={<Zap />} 
              value="78.5%" 
              trend="-2.1" 
              subtext="Load Shedding Active"
              color="rose"
            />
            <SystemStatusCard 
              label="Road Network" 
              icon={<MapIcon />} 
              value="54.0%" 
              trend="0.0" 
              subtext="Pending Maintenance"
              color="amber"
            />
            <SystemStatusCard 
              label="Housing Stability" 
              icon={<Home />} 
              value="82.1%" 
              trend="+1.5" 
              subtext="New Developments"
              color="emerald"
            />
          </div>

          {/* Active Strategic Projects */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
             <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Active Strategic Projects</h3>
             </div>
             <div className="space-y-4">
                <ProjectItem 
                  title="Project Solar Reach" 
                  description="Expansion of off-grid solar solutions for local industrial corridor." 
                  progress={65} 
                  status="IN PROGRESS"
                />
                <ProjectItem 
                  title="Urban Drainage Revitalization" 
                  description="Upgrading central drainage systems to prevent seasonal flooding." 
                  progress={100} 
                  status="PHASE 1 COMPLETE"
                />
             </div>
          </div>
        </div>

        {/* Sidebar Intelligence Section */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* Sentiment Pulse */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 h-fit">
             <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold">Sentiment Pulse</h3>
             </div>
             <div className="relative flex justify-center py-8">
                <svg className="w-48 h-48 -rotate-90">
                   <circle cx="96" cy="96" r="80" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                   <circle 
                     cx="96" cy="96" r="80" 
                     fill="transparent" 
                     stroke="#3b82f6" 
                     strokeWidth="12" 
                     strokeDasharray={502} 
                     strokeDashoffset={502 * (1 - 0.74)}
                     strokeLinecap="round"
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-black">74%</span>
                   <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Positive</span>
                </div>
             </div>
             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Recent Intelligence</h4>
                <div className="space-y-4">
                   <IntelligenceSnippet text="Improved lighting in the North Park area has significantly boosted nighttime foot traffic." source="Field Report #8821" />
                   <IntelligenceSnippet text="Ongoing power outages in the Southern Industrial sector are creating friction." source="Digital Signal Scraping" />
                </div>
             </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <ShieldAlert className="w-5 h-5 text-rose-500" />
                   <h3 className="text-lg font-bold">Critical Alerts</h3>
                </div>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-500 rounded-full text-[10px] font-bold">3 ACTIVE</span>
             </div>
             <div className="space-y-4">
                <AlertItem type="POWER GRID" title="Substation 4B Fault" time="14m ago" description="Cascading failure suspected. Dispatching unit." />
                <AlertItem type="TRAFFIC" title="Unscheduled Road Blockage" time="1h ago" description="A104 Bypass blocked due to localized protest action." />
             </div>
          </div>

        </div>

        {/* Tactical Intelligence Overlays */}
        <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
            <StakeholderMapping communityId={community.id} />
            <RiskVectorRadar data={[]} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, isUp, detail, color = "primary" }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all cursor-default"
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</p>
        {trend && (
          <span className={`text-[10px] font-bold flex items-center gap-1 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
        {detail && (
          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-full text-[8px] font-black tracking-widest">
            {detail}
          </span>
        )}
      </div>
      <p className={`text-4xl font-black tracking-tighter ${color === 'rose' ? 'text-rose-400' : color === 'blue' ? 'text-blue-400' : 'text-white'}`}>
        {value}
      </p>
    </motion.div>
  );
}

function SystemStatusCard({ label, icon, value, trend, subtext, color }: any) {
  const iconColors: any = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl border ${iconColors[color]}`}>
          {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
        <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-emerald-400' : trend === '0.0' ? 'text-white/20' : 'text-rose-400'}`}>
          {trend.startsWith('+') ? trend : trend === '0.0' ? trend : trend}
        </span>
      </div>
      <div>
        <h4 className="text-sm font-bold text-white/60 mb-1">{label}</h4>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-black">{value}</span>
        </div>
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">{subtext}</p>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color === 'rose' ? 'bg-rose-500' : 'bg-primary'}`} 
          style={{ width: value }} 
        />
      </div>
    </div>
  );
}

function ProjectItem({ title, description, progress, status }: any) {
  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4 group hover:bg-white/[0.08] transition-all">
       <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center">
                <MapIcon className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h4 className="font-bold text-lg">{title}</h4>
                <p className="text-xs text-white/40">{description}</p>
             </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${
            status === 'IN PROGRESS' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {status}
          </span>
       </div>
       <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-white/40">
             <span>PROGRESS</span>
             <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
       </div>
    </div>
  );
}

function IntelligenceSnippet({ text, source }: any) {
  return (
    <div className="space-y-1">
       <p className="text-xs text-white/70 leading-relaxed italic border-l-2 border-primary/30 pl-3">"{text}"</p>
       <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest pl-3">— {source}</p>
    </div>
  );
}

function AlertItem({ type, title, time, description }: any) {
  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-2 relative overflow-hidden group">
       <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
       <div className="flex justify-between items-center text-[9px] font-black tracking-widest">
          <span className="text-rose-400">{type}</span>
          <span className="text-white/20">{time}</span>
       </div>
       <h4 className="text-sm font-bold">{title}</h4>
       <p className="text-[10px] text-white/40 leading-snug">{description}</p>
    </div>
  );
}
