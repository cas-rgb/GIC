"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Zap,
  Users,
  MapPin,
  Database,
  ExternalLink,
  Activity,
  Info,
  AlertCircle,
} from "lucide-react";
import { getProjectVulnerability } from "@/app/actions";
import { TacticalRiskData } from "@/types";

interface TacticalIntegrityProps {
  serviceId: string;
}

export default function TacticalIntegrity({
  serviceId,
}: TacticalIntegrityProps) {
  const [riskData, setRiskData] = useState<TacticalRiskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    const fetchTacticalData = async () => {
      setIsLoading(true);
      const projectIds =
        serviceId === "water"
          ? ["kwa-guqa", "sasolburg"]
          : ["barkley-road", "prieska"];
      const results = [];
      for (const id of projectIds) {
        const res = await getProjectVulnerability(id);
        if (res.success) results.push(res.data);
      }
      setRiskData(results as TacticalRiskData[]);
      if (results.length > 0) setSelectedProject(results[0]?.projectId);
      setIsLoading(false);
    };
    fetchTacticalData();
  }, [serviceId]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeProject =
    riskData.find((p) => p.projectId === selectedProject) || riskData[0];

  return (
    <div className="p-8 h-full flex flex-col lg:flex-row gap-8 overflow-hidden font-sans">
      {/* Left: Project List & Executive Summary */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                Tactical Integrity Audit
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Ground-Truth Risk Monitoring
              </p>
            </div>
            <Activity className="w-6 h-6 text-gray-200" />
          </div>

          <div className="space-y-3">
            {riskData.map((project) => (
              <button
                key={project.projectId}
                onClick={() => setSelectedProject(project.projectId)}
                className={`w-full p-5 rounded-xl flex justify-between items-center transition-all border-2 ${selectedProject === project.projectId ? "bg-gray-900 text-white border-gray-900 shadow-md" : "bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-300"}`}
              >
                <span className="text-[11px] font-black uppercase tracking-tight truncate max-w-[150px]">
                  {project.projectName}
                </span>
                <div
                  className={`px-2 py-1 rounded text-[9px] font-black ${project.vulnerability_index > 60 ? "bg-red-500 text-white" : "bg-blue-500 text-white"}`}
                >
                  {project.vulnerability_index}%
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex-1">
          <div className="flex items-center gap-2 mb-6">
            <Info className="w-4 h-4 text-blue-500" />
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Validation Logic
            </h4>
          </div>
          <p className="text-xs text-gray-600 font-bold leading-relaxed italic border-l-4 border-gray-100 pl-6">
            "{activeProject?.justification}"
          </p>
          <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-gray-400">Situational Volatility</span>
              <span className="text-gray-900">
                {activeProject?.situational_volatility || 0}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${activeProject?.situational_volatility || 0}%`,
                }}
                className="h-full bg-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Deep-Dive Analysis */}
      <div className="flex-1 flex flex-col gap-8 overflow-hidden pr-2">
        {/* Risk Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              Audited Risk Vectors (Institutional Scale)
            </h4>
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-gray-300" />
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">
                Machine-Verified Data
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(activeProject?.vectors || {}).map(
              ([key, value]: [string, any], idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border-2 ${value > 0 ? "bg-gray-50 border-gray-100" : "opacity-30 bg-transparent border-gray-50"} flex flex-col items-center text-center transition-all hover:border-gray-300`}
                >
                  <span className="text-2xl font-black text-gray-900 mb-1">
                    {value}
                  </span>
                  <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">
                    {key.replace(/_/g, " ")}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Evidence Feed */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
            <div className="p-3 bg-gray-100 border border-gray-200 text-gray-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none mb-1">
                Evidence Audit Register
              </h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Ground-Truth Grounding Logs
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 space-y-4 scrollbar-hide">
            <AnimatePresence mode="popLayout">
              {activeProject?.supporting_evidence.map(
                (sig: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 bg-gray-50 border border-gray-100 rounded-xl hover:border-blue-400 transition-all group shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${sig.impact === "Strategic Threat" ? "bg-red-500 animate-pulse" : "bg-blue-500"}`}
                        />
                        <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">
                          {sig.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded border ${sig.impact === "Strategic Threat" ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}
                        >
                          {sig.impact}
                        </span>
                        <a
                          href={sig.url}
                          target="_blank"
                          className="p-2 bg-white border border-gray-200 rounded-lg text-gray-300 hover:text-blue-500 transition-colors shadow-sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 font-bold leading-relaxed italic mb-4">
                      "{sig.content}"
                    </p>
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Risk Index: {sig.urgency}
                        </span>
                      </div>
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                        Verified Log Entry
                      </span>
                    </div>
                  </motion.div>
                ),
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
