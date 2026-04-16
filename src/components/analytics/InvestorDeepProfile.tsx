"use client";

import { motion } from "framer-motion";
import { 
  Building2, Globe, Calendar, Users, Briefcase, 
  Target, Presentation, Lightbulb, CheckCircle2,
  Mail, Phone, MapPin
} from "lucide-react";

export default function InvestorDeepProfile({ investor }: { investor: any }) {
  const profile = investor.deepProfile;
  if (!profile) return (
     <div className="p-12 text-center text-slate-500">
       Detailed profile currently unavailable for {investor.name}.
     </div>
  );

  return (
    <div className="bg-slate-900/50 p-6 md:p-10 text-white rounded-[2rem] border border-blue-900/30">
       {/* Meta Strip */}
       <div className="flex flex-wrap items-center gap-6 mb-10 border-b border-blue-900/40 pb-6">
          {profile.website && (
            <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
              <Globe className="w-4 h-4" /> 
              {profile.website.replace("https://", "").replace("www.", "")}
            </div>
          )}
          {profile.established && (
            <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
              <Calendar className="w-4 h-4 text-slate-500" /> 
              Est. {profile.established}
            </div>
          )}
          {profile.teamSize && (
            <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
              <Users className="w-4 h-4 text-slate-500" /> 
              {profile.teamSize} Professionals
            </div>
          )}
       </div>

       {/* Narrative and Philosophy */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" /> Corporate Narrative
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              {profile.narrativeSummary}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-gic-gold" /> Investment Philosophy
            </h3>
            <div className="bg-slate-950 p-6 rounded-2xl border border-blue-800/30 relative">
               <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gic-gold to-yellow-600 rounded-l-2xl" />
               <p className="text-sm font-bold text-white leading-relaxed italic">
                 "{profile.investmentPhilosophy}"
               </p>
            </div>
          </div>
       </div>

       {/* Matrix: Stages, Focus, Sweet Spot */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 border-t border-blue-900/40 pt-10">
          <div>
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
               Target Capital Sweet Spot
             </h3>
             <p className="text-2xl font-black text-emerald-400">
               {profile.investmentFocus?.sweetSpot || investor.assets}
             </p>
          </div>
          <div>
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
               Investment Stages
             </h3>
             <div className="flex flex-wrap gap-2">
               {profile.investmentStages?.map((stage: string, i: number) => (
                 <span key={i} className="text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800/50 px-3 py-1.5 rounded-lg">
                   {stage}
                 </span>
               ))}
             </div>
          </div>
          <div>
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
               Industry Focus
             </h3>
             <div className="flex flex-wrap gap-2">
               {profile.industryFocus?.map((focus: string, i: number) => (
                 <span key={i} className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg">
                   {focus}
                 </span>
               ))}
             </div>
          </div>
       </div>

       {/* Personnel, Contact & Strategy */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-blue-900/40 pt-10">
          {/* Column 1: Strategy */}
          <div className="lg:col-span-1">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
               <Target className="w-5 h-5 text-rose-400" /> GIC Strategic Reach-Out
             </h3>
             <div className="bg-slate-950/80 p-5 rounded-2xl border border-rose-900/30 space-y-4">
               {profile.reachOutStrategy?.map((strategy: string, i: number) => (
                 <div key={i} className="flex items-start gap-3">
                   <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                   <p className="text-sm font-medium text-slate-300 leading-relaxed">{strategy}</p>
                 </div>
               )) || (
                 <div className="flex items-start gap-3">
                   <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                   <p className="text-sm font-medium text-slate-300 leading-relaxed">Cross-index investor mandate with GIC immediate funding gaps to determine optimal engagement route.</p>
                 </div>
               )}
             </div>
          </div>

          {/* Column 2: Key Personnel */}
          <div className="lg:col-span-1">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
               <Briefcase className="w-5 h-5 text-gic-gold" /> Key Decision Makers
             </h3>
             <div className="space-y-3">
               {profile.keyPersonnel?.map((person: any, i: number) => (
                 <div key={i} className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="w-10 h-10 rounded-full bg-blue-900 text-blue-200 flex items-center justify-center font-black text-sm uppercase tracking-widest border border-blue-700/50">
                      {person.initial}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{person.name}</p>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{person.role}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Column 3: Contact */}
          <div className="lg:col-span-1">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
               <Building2 className="w-5 h-5 text-blue-400" /> Official Hub
             </h3>
             {profile.contact && (
               <div className="bg-slate-950 p-6 rounded-2xl border border-blue-900/30 space-y-4 h-full">
                  {profile.contact.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                      <p className="text-sm font-medium text-slate-300">{profile.contact.phone}</p>
                    </div>
                  )}
                  {profile.contact.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                      <p className="text-sm font-medium text-slate-300">{profile.contact.email}</p>
                    </div>
                  )}
                  {profile.contact.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <p className="text-sm font-medium text-slate-300 max-w-xs">{profile.contact.address}</p>
                    </div>
                  )}
               </div>
             )}
          </div>
       </div>

    </div>
  );
}
