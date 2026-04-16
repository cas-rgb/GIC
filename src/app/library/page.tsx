"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  FileText,
  ExternalLink,
  Hash,
  User,
  Calendar,
  Database,
  Search,
  Activity,
  Globe,
  DollarSign,
} from "lucide-react";
import GICCard from "@/components/ui/GICCard";
import PageHeader from "@/components/ui/PageHeader";
import StrategicFilterBar from "@/components/ui/StrategicFilterBar";

import { useState, useEffect } from "react";
import { discoverRealSignals } from "@/app/intel-actions";
import { EvidenceSource } from "@/types/database";

export default function EvidenceLibrary() {
  const [evidence, setEvidence] = useState<EvidenceSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [reliabilityFilter, setReliabilityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [clusterFilter, setClusterFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadLiveEvidence() {
      const res = await discoverRealSignals(
        "Gauteng Africa Infrastructure Evidence",
      );
      if (res.success && res.evidence) {
        setEvidence(res.evidence);
      }
      setIsLoading(false);
    }
    loadLiveEvidence();
  }, []);
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
      <PageHeader
        title="Evidence Library"
        subtitle="Verifiable Truth • Signal Integrity • National Intelligence Archive"
        guidingQuestion="What is the verifiable truth behind the latest infrastructure signals?"
        headerImage="/projects/MAJWEMASWEU-X5-1688-1024x683.webp"
        breadcrumb={[{ name: "Library" }]}
        actions={
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-gic-blue transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setIsSearching(true);
                    try {
                      const res = await fetch("/api/intelligence/vault-search", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ searchQuery }),
                      });
                      const data = await res.json();
                      if (data.documents) {
                        setEvidence(data.documents);
                      }
                    } catch (err) {
                      console.error("Vector Search Failed:", err);
                    }
                    setIsSearching(false);
                  }
                }}
                disabled={isSearching}
                placeholder={isSearching ? "Vector Mapping..." : "Search hashes or sources..."}
                className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 text-xs font-bold focus:outline-none focus:border-gic-blue transition-all w-64 disabled:opacity-50"
              />
            </div>
            <button className="gic-btn gic-btn-primary flex items-center gap-3">
              <Database className="w-4 h-4 text-gic-blue" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Ingest Source
              </span>
            </button>
          </div>
        }
      />

      <StrategicFilterBar
        filters={[
          {
            label: "Reliability Score",
            icon: <ShieldCheck />,
            options: [
              { label: "All Scores", value: "all" },
              { label: "Verified (90%+)", value: "90" },
              { label: "Moderate (70%+)", value: "70" },
              { label: "Probable (50%+)", value: "50" },
            ],
            currentValue: reliabilityFilter,
            onChange: setReliabilityFilter,
          },
          {
            label: "Source Category",
            icon: <Activity />,
            options: [
              { label: "All Sources", value: "all" },
              { label: "Field Signal", value: "field" },
              { label: "Digital Scrape", value: "scrape" },
              { label: "Institutional", value: "inst" },
            ],
            currentValue: sourceFilter,
            onChange: setSourceFilter,
          },
          {
            label: "Geographic Cluster",
            icon: <Globe />,
            options: [
              { label: "National SA", value: "nz" },
              { label: "Gauteng Core", value: "gp" },
              { label: "Western Cape", value: "wc" },
              { label: "Cross-Border", value: "xb" },
            ],
            currentValue: clusterFilter,
            onChange: setClusterFilter,
          },
        ]}
      />

      <div className="grid grid-cols-12 gap-8">
        {/* Statistics Overview */}
        <div className="col-span-12 grid grid-cols-4 gap-8">
          <StatCard
            label="Total Evidence"
            value="1,482"
            unit="Units"
            icon={<Database className="w-4 h-4" />}
          />
          <StatCard
            label="Verification Rate"
            value="94.2"
            unit="%"
            icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
          />
          <StatCard
            label="Geospatial Anchors"
            value="824"
            unit="Nodes"
            icon={<Hash className="w-4 h-4 text-blue-500" />}
          />
          <StatCard
            label="Chain of Custody"
            value="100"
            unit="%"
            icon={<User className="w-4 h-4 text-amber-500" />}
          />
        </div>

        {/* Main Evidence Vault */}
        <div className="col-span-12">
          <GICCard
            premium
            title="The Verification Vault"
            subtitle="Immutable Clinical Evidence Records"
            icon={<ShieldCheck className="w-5 h-5" />}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-50 text-left">
                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">
                      Evidence Title
                    </th>
                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Type
                    </th>
                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Source Entity
                    </th>
                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Verification Hash
                    </th>
                    <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-4">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading || isSearching ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="w-8 h-8 border-4 border-gic-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          {isSearching ? "Executing Deep Vector Retrieval..." : "Verifying Institutional Sources..."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    evidence.map((item, i) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-6 pl-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all">
                              <FileText className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-none mb-2">
                                {item.title}
                              </p>
                              <p className="text-[10px] font-medium text-slate-500 italic max-w-sm line-clamp-1">
                                "{item.snippet}"
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {item.capturedBy}
                          </span>
                        </td>
                        <td className="py-6">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${item.verificationStatus === "verified" ? "bg-emerald-500" : "bg-rose-500"}`}
                            />
                            <span
                              className={`text-[10px] font-black uppercase tracking-widest ${item.verificationStatus === "verified" ? "text-emerald-500" : "text-rose-500"}`}
                            >
                              {item.verificationStatus}
                            </span>
                          </div>
                        </td>
                        <td className="py-6">
                          <p className="text-[11px] font-bold text-slate-700">
                            {item.metadata?.sourceName || item.source_name || "GIC Verified Archive"}
                          </p>
                          <p className="text-[9px] font-black text-gic-blue uppercase tracking-widest mt-1">
                            {item.metadata?.platform || (item.rag_score ? `AI RELEVANCE: ${(item.rag_score * 100).toFixed(1)}%` : "OSINT")}
                          </p>
                        </td>
                        <td className="py-6 font-mono text-[10px] text-slate-400">
                          {item.id?.substring(0, 16) || item.hash?.substring(0, 16) || "SHA256:AUTHENTIC"}...
                        </td>
                        <td className="py-6 text-right pr-4">
                          <a
                            href={item.originalSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-all inline-block"
                          >
                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-gic-dark" />
                          </a>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GICCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, icon }: any) {
  return (
    <GICCard className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            {icon}
          </div>
          <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
            LIVE
          </span>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-black text-slate-900 tracking-tighter">
              {value}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {unit}
            </span>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
            {label}
          </p>
        </div>
      </div>
    </GICCard>
  );
}
