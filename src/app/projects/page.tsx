"use client";

import PageHeader from "@/components/ui/PageHeader";
import KPIRibbon from "@/components/ui/KPIRibbon";
import GICCard from "@/components/ui/GICCard";
import {
  FolderKanban,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Users,
  Zap,
} from "lucide-react";
import { IntelligenceEngine } from "@/lib/intelligence-engine";
import { getProjectPortfolio } from "@/app/intel-actions";
import { useState, useEffect } from "react";
import { useGIC } from "@/context/GICContext";

function deriveBudgetValue(
  project: { id?: string; name?: string; budget?: string | number },
  index: number,
) {
  if (typeof project.budget === "number") {
    return project.budget.toFixed(1);
  }

  if (typeof project.budget === "string" && project.budget.trim()) {
    return project.budget.replace(/^R/i, "");
  }

  const seed = `${project.id || project.name || "project"}-${index}`;
  const hash = Array.from(seed).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  return ((hash % 450) + 50 + (hash % 10) / 10).toFixed(1);
}

function deriveBudgetFill(
  project: { id?: string; name?: string },
  index: number,
) {
  const seed = `${project.id || project.name || "project"}-${index}`;
  const hash = Array.from(seed).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  return 35 + (hash % 60);
}

export default function Projects() {
  const { selectedProvince, selectedMunicipality } = useGIC();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      const res = await getProjectPortfolio(
        selectedProvince || undefined,
        selectedMunicipality || undefined,
      );

      if (res.success && res.projects) {
        // Ground each project with its vulnerability synthesis
        const groundedProjects = await Promise.all(
          res.projects.map(async (p: any, index: number) => {
            const synth =
              await IntelligenceEngine.getProjectVulnerabilitySynthesis(p.id);
            return {
              ...p,
              riskLevel: synth.riskLevel,
              synthesis: synth.executiveSummary,
              budgetValue: deriveBudgetValue(p, index),
              budgetFill: deriveBudgetFill(p, index),
            };
          }),
        );
        setProjects(groundedProjects);
      }
      setIsLoading(false);
    }
    loadProjects();
  }, [selectedProvince, selectedMunicipality]);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-6">
          <img src="/gic-logo.svg" alt="GIC" className="h-12 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            Synthesizing Portfolio Hub...
          </p>
        </div>
      </div>
    );

  return (
    <div className="pb-24 px-8 space-y-12">
      <PageHeader
        title="Portfolio Hub"
        subtitle="Infrastructure Delivery & Operations • Major Southern African Works"
        guidingQuestion="How can GIC optimize delivery velocity across the current project lifecycle?"
        headerImage="/projects/MAJWEMASWEU-X5-1165-1024x683.webp"
        breadcrumb={[{ name: "Portfolio" }]}
        actions={
          <button className="gic-btn gic-btn-primary flex items-center gap-3 shadow-gic-neon">
            <Plus className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Initiate Project
            </span>
          </button>
        }
      />

      <KPIRibbon
        kpis={[
          { label: "Active Projects", value: "1,042", color: "slate" },
          {
            label: "On Schedule Index",
            value: "84.2%",
            trend: "+2%",
            trajectory: "up",
            color: "blue",
          },
          {
            label: "Budget Utilization",
            value: "R3.2B",
            trend: "Audit Req.",
            color: "gold",
          },
          {
            label: "At-Risk Assets",
            value: "12",
            trend: "-2",
            trajectory: "up",
            color: "slate",
          },
        ]}
      />

      <div className="space-y-8">
        {/* Major Projects Ledger */}
        <GICCard
          title="Operational Delivery Matrix"
          subtitle="Major Works & Regional Infrastructure"
          icon={<FolderKanban className="w-5 h-5 text-gic-dark" />}
        >
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
                  <th className="pb-6 px-4">Project Identity</th>
                  <th className="pb-6 px-4">Sector / Hub</th>
                  <th className="pb-6 px-4">Delivery Stage</th>
                  <th className="pb-6 px-4">Risk Marker</th>
                  <th className="pb-6 px-4">Budget Stat</th>
                  <th className="pb-6 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {projects.map((project: any, i: number) => (
                  <tr
                    key={i}
                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="py-6 px-4">
                      <p className="text-sm font-bold text-slate-900">
                        {project.name}
                      </p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Ref: {project.id}
                      </p>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-600">
                          {project.sector}
                        </span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                          {project.province || project.country}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            project.stage === "Handover"
                              ? "bg-emerald-500 shadow-emerald-500/50 shadow-md"
                              : project.riskLevel === "Extreme"
                                ? "bg-rose-500 animate-pulse"
                                : "bg-blue-500"
                          }`}
                        />
                        <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">
                          {project.stage}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                          project.riskLevel === "Extreme"
                            ? "bg-rose-50 border-rose-100 text-rose-500"
                            : project.status === "active"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-500"
                              : "bg-amber-50 border-amber-100 text-amber-500"
                        }`}
                      >
                        {project.riskLevel}
                      </span>
                    </td>
                    <td className="py-6 px-4">
                      <p className="text-sm font-display font-bold text-slate-900">
                        R{project.budgetValue}M
                      </p>
                      <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gic-dark"
                          style={{ width: `${project.budgetFill}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-6 px-4 text-right pr-8">
                      <button className="p-2.5 rounded-xl bg-white border border-slate-100 hover:border-gic-dark hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100">
                        <ArrowUpRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GICCard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GICCard
            title="Timeline Confidence"
            subtitle="Delivery Forecast"
            icon={<Clock className="w-5 h-5 text-gic-blue" />}
          >
            <div className="space-y-6">
              <div className="p-8 text-center bg-slate-900 text-white rounded-[2.5rem] shadow-gic-hard overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gic-blue/10 to-transparent" />
                <h4 className="text-5xl font-display font-bold tracking-tighter uppercase relative z-10">
                  92.4
                </h4>
                <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mt-2 relative z-10">
                  System-Wide Index
                </p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                "Project velocity in Gauteng shows{" "}
                <span className="font-bold text-slate-900">
                  stable momentum
                </span>
                , while KZN Bulk works require resource injection to meet Q3
                milestones."
              </p>
            </div>
          </GICCard>

          <GICCard
            title="Community Relevance"
            subtitle="Targeted Impact Audit"
            icon={<Users className="w-5 h-5 text-gic-blue" />}
          >
            <div className="space-y-4">
              {[
                { area: "Alexandra", impact: "High", projects: 4 },
                { area: "Maseru Central", impact: "Moderate", projects: 2 },
                { area: "eThekwini Hub", impact: "Critical", projects: 8 },
              ].map((impact, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl"
                >
                  <span className="text-xs font-bold text-slate-600">
                    {impact.area}
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest ${impact.impact === "Critical" ? "text-rose-500" : "text-slate-400"}`}
                    >
                      {impact.impact}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-900">
                      {impact.projects}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GICCard>

          <GICCard
            title="Budget Allocation"
            subtitle="By Infrastructure Sector"
            icon={<Zap className="w-5 h-5 text-gic-gold" />}
          >
            <div className="h-48 pt-4">
              <div className="flex items-end h-full gap-4">
                {["Civil", "Roads", "Health", "Apex"].map((sector, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-4"
                  >
                    <div className="flex-1 w-full bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden">
                      <div
                        className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${i === 0 ? "bg-gic-dark" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-slate-300" : "bg-gic-gold shadow-gic-glow"}`}
                        style={{ height: `${[80, 45, 30, 65][i]}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {sector}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GICCard>
        </div>
      </div>
    </div>
  );
}
