import PageHeader from "@/components/ui/PageHeader";
import KPIRibbon from "@/components/ui/KPIRibbon";
import GICCard from "@/components/ui/GICCard";
import {
  Settings,
  ShieldCheck,
  Users,
  Database,
  Globe,
  Zap,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { ConnectorRegistry } from "@/lib/connectors/connector-registry";

export default function Admin() {
  const connectors = ConnectorRegistry.getConnectors();
  const stats = ConnectorRegistry.getHealthSummary();

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      <PageHeader
        title="Admin"
        subtitle="System Governance & Protocol Management"
        breadcrumb={[{ name: "Admin" }]}
      />

      <KPIRibbon
        kpis={[
          {
            label: "Connectors Active",
            value: stats.active.toString(),
            color: "blue",
          },
          {
            label: "Source Health",
            value: `${((stats.healthy / stats.total) * 100).toFixed(0)}%`,
            color: "gold",
          },
          {
            label: "Failed Syncs",
            value: stats.failed.toString(),
            color: stats.failed > 0 ? "gold" : "slate",
          },
          { label: "System Uptime", value: "99.99%", color: "blue" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            label: "Protocol Settings",
            icon: Settings,
            desc: "Configure core AI reasoning patterns and ingestion limits.",
          },
          {
            label: "Access Control",
            icon: ShieldCheck,
            desc: "Manage departmental roles and high-security credentials.",
          },
          {
            label: "User Directory",
            icon: Users,
            desc: "Audit active officers and regional node representatives.",
          },
          {
            label: "Integrity Logs",
            icon: Database,
            desc: "View raw system logs and transaction hashes.",
          },
        ].map((action, i) => (
          <GICCard
            key={i}
            title={action.label}
            subtitle="Admin Action"
            icon={<action.icon className="w-5 h-5 text-gic-blue" />}
          >
            <div className="space-y-6">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {action.desc}
              </p>
              <button className="gic-btn gic-btn-outline w-full text-[10px] font-black uppercase tracking-widest">
                Manage Module
              </button>
            </div>
          </GICCard>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-display font-bold text-slate-900 tracking-tight uppercase">
              Data Ecosystem
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 italic">
              Modular Connector Registry & Ingestion Health
            </p>
          </div>
          <button className="gic-btn gic-btn-primary flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-gic-blue" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Refresh All Streams
            </span>
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Active Connectors */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <GICCard
              premium
              title="Connector Registry"
              subtitle="External Integration Control"
              icon={<Globe className="w-5 h-5 text-gic-blue" />}
            >
              {/* ... existing content ... */}
              <div className="space-y-4">
                {connectors.map((c) => (
                  <div
                    key={c.id}
                    className="p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-gic-dark transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-2xl ${c.isEnabled ? "bg-white" : "bg-slate-100"} border border-slate-200`}
                        >
                          <Zap
                            className={`w-5 h-5 ${c.isEnabled ? "text-gic-blue" : "text-slate-300"}`}
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                            {c.name}
                          </h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {c.type.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                            c.status === "success"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-500"
                              : c.status === "failed"
                                ? "bg-rose-50 border-rose-100 text-rose-500"
                                : "bg-slate-100 border-slate-200 text-slate-400"
                          }`}
                        >
                          {c.status}
                        </div>
                        <div
                          className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${c.isEnabled ? "bg-gic-blue" : "bg-slate-200"}`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${c.isEnabled ? "translate-x-6" : "translate-x-0"}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-200/50">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Health Index
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${c.health.uptime}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700">
                            {c.health.uptime}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Latency
                        </p>
                        <p className="text-[10px] font-bold text-slate-900">
                          {c.health.latencyMs}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Credibility
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${i < Math.round(c.credibilityScore * 5) ? "bg-gic-gold" : "bg-slate-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {c.health.lastError && (
                      <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        <p className="text-[10px] font-medium text-rose-600 italic">
                          Failed: {c.health.lastError}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GICCard>

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-5 h-5 text-gic-blue" />
                <h4 className="text-xl font-display font-bold text-slate-900 uppercase tracking-tight">
                  Pending System Review
                </h4>
              </div>

              {[
                {
                  title: "Infrastructure Alert: Soweto Substation",
                  source: "Twitter API",
                  severity: "critical",
                  geo: "Gauteng",
                  time: "12m ago",
                },
                {
                  title: "Health Clinic Upgrade Proposal",
                  source: "Manual Upload (Officer 02)",
                  severity: "medium",
                  geo: "Limpopo",
                  time: "1h ago",
                },
                {
                  title: "Eswatini Water Supply Disruption",
                  source: "Tavily Search",
                  severity: "high",
                  geo: "Eswatini",
                  time: "4h ago",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-6 bg-white border border-slate-100 rounded-3xl shadow-gic-soft flex items-center justify-between group hover:border-gic-blue transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-2 h-12 rounded-full ${
                        item.severity === "critical"
                          ? "bg-rose-500"
                          : item.severity === "high"
                            ? "bg-gic-gold"
                            : "bg-gic-blue"
                      }`}
                    />
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                        {item.title}
                      </h5>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          Source: {item.source}
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          •
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          Region: {item.geo}
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          •
                        </span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all">
                      Approve
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-100 hover:bg-rose-500 hover:text-white transition-all">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Health */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <GICCard
              title="Ingestion Analytics"
              subtitle="Temporal Reliability"
              icon={<BarChart3 className="w-5 h-5 text-gic-gold" />}
            >
              <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-[2.5rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gic-blue blur-[80px] opacity-20" />
                  <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">
                    Daily Throughput
                  </h5>
                  <div className="flex items-end gap-1 h-24">
                    {[40, 65, 30, 85, 45, 90, 60, 55, 75, 40].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-white/10 rounded-t-lg group relative cursor-crosshair hover:bg-gic-blue transition-colors"
                        style={{ height: `${h}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {Math.round(h * 120)} REC
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h6 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Recent System Notifications
                  </h6>
                  {[
                    {
                      type: "success",
                      text: "Tavily Enrichment Node stabilized.",
                      time: "2m ago",
                    },
                    {
                      type: "warning",
                      text: "Social data duplicate threshold met.",
                      time: "14m ago",
                    },
                    {
                      type: "error",
                      text: "Manual import failed: Header mismatch.",
                      time: "1h ago",
                    },
                  ].map((note, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl"
                    >
                      {note.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : note.type === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-gic-gold shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-900 leading-tight">
                          {note.text}
                        </p>
                        <p className="text-[8px] font-black text-slate-400 uppercase mt-1">
                          {note.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GICCard>

            <div className="p-8 bg-slate-50 border border-slate-100 rounded-[3rem] text-center group cursor-pointer hover:border-gic-dark transition-all">
              <div className="w-16 h-16 bg-white rounded-3xl border border-slate-200 flex items-center justify-center mx-auto mb-4 group-hover:bg-gic-dark transition-colors">
                <Database className="w-8 h-8 text-gic-blue group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                System Audit Export
              </h4>
              <p className="text-[10px] text-slate-500 font-medium mt-2">
                Generate cryptographically verified history of all external data
                ingestions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
