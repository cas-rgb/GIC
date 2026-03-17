"use client";

import LeadershipSentimentPanel from "@/components/analytics/LeadershipSentimentPanel";
import LeadershipEvidencePanel from "@/components/analytics/LeadershipEvidencePanel";
import StructuredBriefingPanel from "@/components/analytics/StructuredBriefingPanel";
import PageHeader from "@/components/ui/PageHeader";
import GICCard from "@/components/ui/GICCard";
import DashboardToolbar from "@/components/ui/DashboardToolbar";
import { ShieldAlert, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LeadershipSentimentLeaderRow } from "@/lib/analytics/types";

const PROVINCES = [
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Limpopo",
    "Mpumalanga",
    "North West",
    "Free State",
    "Northern Cape",
];

const DAY_WINDOWS = [14, 30, 60] as const;

export default function LeadershipSentimentPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryProvince = searchParams.get("province");
    const queryDays = searchParams.get("days");
    const queryLeaderName = searchParams.get("leaderName");
    const [province, setProvince] = useState("Gauteng");
    const [days, setDays] = useState<(typeof DAY_WINDOWS)[number]>(30);
    const [selectedLeader, setSelectedLeader] = useState<LeadershipSentimentLeaderRow | null>(null);

    useEffect(() => {
        if (queryProvince && PROVINCES.includes(queryProvince) && queryProvince !== province) {
            setProvince(queryProvince);
        }

        if (queryDays) {
            const parsedDays = Number(queryDays);
            if (DAY_WINDOWS.includes(parsedDays as (typeof DAY_WINDOWS)[number]) && parsedDays !== days) {
                setDays(parsedDays as (typeof DAY_WINDOWS)[number]);
            }
        }
    }, [days, province, queryDays, queryProvince]);

    useEffect(() => {
        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.set("province", province);
        nextParams.set("days", String(days));
        if (selectedLeader?.leaderName) {
            nextParams.set("leaderName", selectedLeader.leaderName);
        } else {
            nextParams.delete("leaderName");
        }

        const nextQuery = nextParams.toString();
        const currentQuery = searchParams.toString();

        if (nextQuery !== currentQuery) {
            router.replace(`${pathname}?${nextQuery}`, { scroll: false });
        }
    }, [days, pathname, province, router, searchParams, selectedLeader]);

    useEffect(() => {
        setSelectedLeader(null);
    }, [province, days]);

    return (
        <div className="max-w-[1600px] mx-auto pb-24">
            <PageHeader
                title="Leadership Sentiment"
                subtitle="Public relations dashboard for provincial and municipal political leaders, tracking reputation health, issue association, and narrative risk."
                breadcrumb={[{ name: "Leadership Sentiment" }]}
                headerImage="/projects/MAJWEMASWEU-X5-1604-1024x683.webp"
                guidingQuestion="How are major leaders being perceived by the public, what themes are associated with them, and where are reputation risks or support signals emerging?"
            />

            <div className="space-y-5">
                <DashboardToolbar
                    label="PR Command"
                    title="Political reputation, message risk, and public narrative by leader"
                    description={`Use this dashboard as a public-relations command view for the Premier, mayors, and key offices: who is carrying reputational risk, which issues are driving the narrative, and where message intervention or visible response is needed.${days !== 30 ? ` Window set to last ${days} days.` : ""}`}
                    controls={
                        <>
                            <label className="flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    Province
                                </span>
                                <select
                                    value={province}
                                    onChange={(event) => setProvince(event.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
                                >
                                    {PROVINCES.map((entry) => (
                                        <option key={entry} value={entry}>
                                            {entry}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    Window
                                </span>
                                <select
                                    value={days}
                                    onChange={(event) => setDays(Number(event.target.value) as (typeof DAY_WINDOWS)[number])}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 outline-none"
                                >
                                    {DAY_WINDOWS.map((entry) => (
                                        <option key={entry} value={entry}>
                                            Last {entry} days
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </>
                    }
                />

                {selectedLeader ? (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                        <p className="text-sm font-medium text-slate-700">
                            PR focus is currently filtered to <span className="font-bold">{selectedLeader.leaderName}</span>{selectedLeader.office ? ` (${selectedLeader.office})` : ""}. Clear the current leader selection to return to the full province PR view.
                        </p>
                        <button
                            type="button"
                            onClick={() => setSelectedLeader(null)}
                            className="mt-3 rounded-xl border border-blue-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700"
                        >
                            Clear leader filter
                        </button>
                    </div>
                ) : null}

                <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Active Scope
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                        The PR dashboard is currently focused on <span className="font-bold">{province}</span>{" "}
                        over the last <span className="font-bold">{days} days</span>
                        {selectedLeader ? (
                            <>
                                , with leader drilldown locked to{" "}
                                <span className="font-bold">{selectedLeader.leaderName}</span>.
                            </>
                        ) : (
                            "."
                        )}
                    </p>
                </div>

                <GICCard
                    premium
                    title="PR Briefing"
                    subtitle="Grounded AI summary of current reputation pressure, narrative risk, and next PR actions"
                    icon={<ShieldAlert className="w-5 h-5 text-gic-blue" />}
                >
                    <StructuredBriefingPanel
                        url={`/api/intelligence/leadership-briefing?province=${encodeURIComponent(province)}&days=${days}`}
                        loadingLabel="Building political PR briefing..."
                        headlineLabel="PR Headline"
                    />
                </GICCard>

                <GICCard
                    premium
                    title="Political Reputation Monitor"
                    subtitle="Governed leadership perception, issue association, and PR risk across the selected province"
                    icon={<ShieldAlert className="w-5 h-5 text-gic-blue" />}
                >
                    <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_1fr_1fr]">
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                PR Use
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                Identify which political leaders are carrying reputational risk, which issue is driving it, and where message response or visible delivery action is needed.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Focus
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-900">Premier, mayors, and political offices</p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Measure
                            </p>
                            <p className="mt-1 text-sm font-bold text-slate-900">Reputation tone, issue attachment, and narrative risk</p>
                        </div>
                    </div>
                    <LeadershipSentimentPanel
                        province={province}
                        days={days}
                        selectedLeaderName={selectedLeader?.leaderName ?? queryLeaderName ?? null}
                        onSelectLeader={setSelectedLeader}
                    />
                </GICCard>

                <GICCard
                    title="PR Evidence Pack"
                    subtitle="Governed documents directly shaping the current narrative around the selected leader or office"
                    icon={<Users className="w-5 h-5 text-gic-blue" />}
                >
                    <LeadershipEvidencePanel
                        province={province}
                        days={days}
                        leaderName={selectedLeader?.leaderName ?? null}
                        office={selectedLeader?.office ?? null}
                    />
                </GICCard>
            </div>
        </div>
    );
}
