import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MacroSocialTrendsFeed from "@/components/analytics/MacroSocialTrendsFeed";
import DashboardToolbar from "@/components/ui/DashboardToolbar";

export default function SocialTrendsDashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Derive state purely from URL (Unidirectional Flow)
  const province = searchParams.get("province") || "All Provinces";
  const municipality = searchParams.get("municipality") || "All Municipalities";
  const serviceDomain = searchParams.get("serviceDomain") || "all";
  const days = Number(searchParams.get("days") || "30");

  const selectedProvince = province === "All Provinces" ? undefined : province;
  const selectedMunicipality = municipality === "All Municipalities" ? null : municipality;
  const selectedServiceDomain = serviceDomain === "all" ? null : serviceDomain;

  const [summary, setSummary] = useState<string>("Loading regional macro context...");
  const [isMounted, setIsMounted] = useState(false);
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setIsMounted(true);
    setTodayStr(new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
  }, []);

  useEffect(() => {
    const targetProvince = selectedProvince || "All Provinces";
    fetch(`/api/analytics/deep-social?province=${encodeURIComponent(targetProvince)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.executiveSummary) {
          setSummary(data.executiveSummary);
        } else {
          setSummary("Awaiting synchronization from the regional intelligence system...");
        }
      })
      .catch((e) => {
        console.error("Failed to load OSINT summary", e);
        setSummary("Intelligence aggregation offline or experiencing friction.");
      });
  }, [selectedProvince]);

  return (
    <div className="space-y-8">
      <DashboardToolbar
        label="Signal Desk"
        title={isMounted ? `Strategic Media Briefing (${todayStr})` : "Strategic Media Briefing (...)"}
        description={summary}
      />

      <div className="gic-card bg-slate-900 border-slate-800 px-4 py-3 shadow-gic-premium text-blue-400">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Global Macro-Intelligence Scope
        </p>
        <p className="mt-2 text-sm font-medium text-slate-300">
          The autonomous intelligence system is monitoring digital chatter across{" "}
          <span className="font-bold text-blue-400">
            {selectedProvince ?? "all provinces"}
          </span>
          {selectedMunicipality && (
            <span>
              {" "}
              &rarr; <span className="font-bold text-rose-400">{selectedMunicipality}</span>
            </span>
          )}
          {selectedServiceDomain && (
            <span>
              {" "}
              &rarr; <span className="font-bold text-amber-400">{selectedServiceDomain}</span>
            </span>
          )}{" "}
          over the latest trajectory cycle.
        </p>
      </div>

      {/* Visually Arresting Macro Panels */}
      <MacroSocialTrendsFeed province={selectedProvince || "All Provinces"} />
    </div>
  );
}
