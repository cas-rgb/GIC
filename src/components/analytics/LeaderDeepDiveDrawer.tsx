"use client";

import { useRouter } from "next/navigation";
import DeepDiveDrawer from "@/components/ui/DeepDiveDrawer";
import { LeadershipSentimentLeaderRow } from "@/lib/analytics/types";
import { ShieldCheck, Activity, Users, AlertCircle, TrendingUp, TrendingDown, ExternalLink, FileText } from "lucide-react";
import { normalizeInfrastructureServiceFilter } from "@/lib/analytics/issue-taxonomy";
import ExportToPDFFooter from "../ui/ExportToPDFFooter";

interface LeaderDeepDiveDrawerProps {
  leader: LeadershipSentimentLeaderRow | null;
  isOpen: boolean;
  onClose: () => void;
  days: number;
  province: string;
}

export default function LeaderDeepDiveDrawer({ leader, isOpen, onClose, days, province }: LeaderDeepDiveDrawerProps) {
  if (!leader) return null;

  const score = Math.round(leader.sentimentScore * 100);
  const isPositive = score >= 0;
  const totalMentions = leader.linkedIssueBreakdown.reduce((acc, val) => acc + val.mentionCount, 0);
  const dominantIssue = leader.linkedIssueBreakdown[0]?.topic || 'general governance';
  const router = useRouter();

  function handleIssueClick(topic: string) {
    const domain = normalizeInfrastructureServiceFilter(topic) || "all";
    router.push(`/executive/social-trends?province=${encodeURIComponent(province)}&serviceDomain=${domain}&days=${days}`);
    onClose();
  }

  return (
    <DeepDiveDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={leader.leaderName}
      subtitle={leader.office}
    >
      <div className="space-y-6">
        
        {/* Export Action */}
        <div className="flex justify-between items-center bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-sm print:hidden">
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">Executive PR Briefing</h3>
            <p className="text-xs text-slate-400 mt-1">Generate a print-ready PDF of this leader's intelligence profile.</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded transition-colors"
          >
            <FileText className="w-4 h-4" /> Export PR Brief
          </button>
        </div>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              Direct Mention Volume
            </h4>
            <p className="text-3xl font-black text-slate-900">{totalMentions}</p>
            <p className="text-xs font-medium text-slate-500 mt-1 pb-1 border-b border-slate-100">Last {days} days</p>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              Net Public Trust
            </h4>
            <div className="flex items-center gap-3">
              <p className={`text-3xl font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {score > 0 ? '+' : ''}{score}
              </p>
              {isPositive ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-rose-500" />}
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1 pb-1 border-b border-slate-100">AI sentiment index aggregate</p>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              Core Risk Driver
            </h4>
            <p className="text-xl font-black text-slate-900 line-clamp-1 truncate">{dominantIssue}</p>
            <p className="text-xs font-medium text-slate-500 mt-1 pb-1 border-b border-slate-100">Highest volume topic</p>
          </div>
        </div>

        {/* Dynamic AI Briefing for strict scope */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
             <ShieldCheck className="w-5 h-5 text-blue-600" />
             <h3 className="font-bold text-slate-900">Governed Capability Briefing</h3>
          </div>
          <div className="p-6">
             <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-4 border-blue-400 pl-5 bg-slate-50/50 py-3 rounded-r-lg">
               "{leader.leaderName}'s current public perception footprint is largely defined by {dominantIssue.toLowerCase()} over the past {days} days within {province}. The net sentiment remains {isPositive ? 'resilient despite local crises' : 'under extreme pressure'} based on {totalMentions} explicit narrative mentions. Any strategic decisions impacting {dominantIssue.toLowerCase()} will disproportionately affect this leader's standing."
             </p>
          </div>
        </div>

        {/* Detailed Issue Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
           <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
             <Activity className="w-5 h-5 text-blue-600" />
             <h3 className="font-bold text-slate-900">Issue Isolation Array</h3>
           </div>
           <div className="p-0">
             {leader.linkedIssueBreakdown.length > 0 ? (
               <div className="divide-y divide-slate-100">
                 {leader.linkedIssueBreakdown.map((issue, idx) => (
                   <button 
                      key={idx} 
                      onClick={() => handleIssueClick(issue.topic)}
                      className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-all text-left group border-l-2 border-transparent hover:border-blue-500"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors flex items-center gap-2">
                          {issue.topic}
                          <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-400 transition-colors" />
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                             {issue.mentionCount > 50 ? "High Volume" : "Active"} Tracker
                           </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 text-2xl group-hover:text-blue-600 transition-colors">
                          {issue.mentionCount}
                        </span>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-0.5 group-hover:text-blue-400 transition-colors">Mentions</p>
                      </div>
                   </button>
                 ))}
               </div>
             ) : (
               <div className="p-8 text-center text-slate-500 text-sm font-medium italic">
                 No distinct operational topics have been directly linked to this leader in the selected window.
               </div>
             )}
           </div>
        </div>

      </div>
      <ExportToPDFFooter confidenceRating="VERIFIED" />
    </DeepDiveDrawer>
  );
}
