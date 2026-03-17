"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, MapPin, ShieldCheck } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import MunicipalityEvidenceBalancePanel from "@/components/analytics/MunicipalityEvidenceBalancePanel";
import MunicipalityEvidencePanel from "@/components/analytics/MunicipalityEvidencePanel";
import MunicipalityBriefingPanel from "@/components/analytics/MunicipalityBriefingPanel";
import MunicipalityCitizenVoicePanel from "@/components/analytics/MunicipalityCitizenVoicePanel";
import MunicipalityLegacyCommunitySignalsPanel from "@/components/analytics/MunicipalityLegacyCommunitySignalsPanel";
import MunicipalityPressureTrendPanel from "@/components/analytics/MunicipalityPressureTrendPanel";
import MunicipalityIssueMatrixPanel from "@/components/analytics/MunicipalityIssueMatrixPanel";
import MunicipalityRecommendationsPanel from "@/components/analytics/MunicipalityRecommendationsPanel";
import MunicipalitySentimentPanel from "@/components/analytics/MunicipalitySentimentPanel";
import MunicipalityHotspotSummaryPanel from "@/components/analytics/MunicipalityHotspotSummaryPanel";
import MunicipalityOperationalSnapshotPanel from "@/components/analytics/MunicipalityOperationalSnapshotPanel";
import MunicipalitySourceCoveragePanel from "@/components/analytics/MunicipalitySourceCoveragePanel";
import MunicipalitySourceHealthPanel from "@/components/analytics/MunicipalitySourceHealthPanel";
import CitizenVoiceEvidencePanel from "@/components/analytics/CitizenVoiceEvidencePanel";
import MunicipalityPublicVoiceHighlightsPanel from "@/components/analytics/MunicipalityPublicVoiceHighlightsPanel";
import DecisionReadinessStrip from "@/components/analytics/DecisionReadinessStrip";
import EvidenceFocusStrip from "@/components/analytics/EvidenceFocusStrip";
import SourceFreshnessNotice from "@/components/analytics/SourceFreshnessNotice";
import WardCoveragePanel from "@/components/analytics/WardCoveragePanel";
import PlaceProfilePanel from "@/components/analytics/PlaceProfilePanel";
import PlaceElectionHistoryPanel from "@/components/analytics/PlaceElectionHistoryPanel";
import WardCouncillorPanel from "@/components/analytics/WardCouncillorPanel";
import InfrastructureHistoryPanel from "@/components/analytics/InfrastructureHistoryPanel";
import PlaceContextPanel from "@/components/analytics/PlaceContextPanel";
import PlaceIntelligenceSummaryPanel from "@/components/analytics/PlaceIntelligenceSummaryPanel";
import BudgetAllocationPanel from "@/components/analytics/BudgetAllocationPanel";
import WardProfilePanel from "@/components/analytics/WardProfilePanel";
import MunicipalityPlaceCoverageStrip from "@/components/analytics/MunicipalityPlaceCoverageStrip";
import PageHeader from "@/components/ui/PageHeader";
import GICCard from "@/components/ui/GICCard";
import DashboardToolbar from "@/components/ui/DashboardToolbar";
import {
    MunicipalityDirectoryResponse,
    MunicipalitySummaryResponse,
    WardCoverageResponse,
} from "@/lib/analytics/types";
import { INFRASTRUCTURE_SERVICE_OPTIONS } from "@/lib/analytics/issue-taxonomy";
import { ProvinceRecommendationsResponse } from "@/lib/recommendations/types";

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

type DirectoryState =
    | { status: "loading" }
    | { status: "loaded"; data: MunicipalityDirectoryResponse }
    | { status: "error"; message: string };

type SummaryState =
    | { status: "loading" }
    | { status: "loaded"; data: MunicipalitySummaryResponse }
    | { status: "error"; message: string };

type WardState =
    | { status: "loading" }
    | { status: "loaded"; data: WardCoverageResponse }
    | { status: "error"; message: string };

export default function MunicipalityWardsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryProvince = searchParams.get("province");
    const queryMunicipality = searchParams.get("municipality");
    const queryDays = searchParams.get("days");
    const queryWard = searchParams.get("ward");
    const queryServiceDomain = searchParams.get("serviceDomain");
    const returnTo = searchParams.get("from");
    const [province, setProvince] = useState("Gauteng");
    const [days, setDays] = useState(30);
    const [directoryState, setDirectoryState] = useState<DirectoryState>({ status: "loading" });
    const [municipality, setMunicipality] = useState<string>("");
    const [summaryState, setSummaryState] = useState<SummaryState>({ status: "loading" });
    const [wardState, setWardState] = useState<WardState>({ status: "loading" });
    const [ward, setWard] = useState<string>("");
    const [serviceDomain, setServiceDomain] = useState<string>("all");
    const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

    function downloadFile(content: string, filename: string, contentType: string) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
    }

    async function exportRecommendations(format: "csv" | "json") {
        if (!municipality) {
            return;
        }

        const response = await fetch(
            `/api/intelligence/municipality-recommendations?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(municipality)}&days=${days}`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error(`recommendation export failed with status ${response.status}`);
        }

        const payload = (await response.json()) as ProvinceRecommendationsResponse;
        const baseName = `${province.toLowerCase().replace(/\s+/g, "-")}-${municipality
            .toLowerCase()
            .replace(/\s+/g, "-")}-recommendations`;

        if (format === "json") {
            downloadFile(
                JSON.stringify(payload, null, 2),
                `${baseName}.json`,
                "application/json;charset=utf-8"
            );
            return;
        }

        const header = [
            "title",
            "issue",
            "urgency",
            "impact_tier",
            "owner_office",
            "recommended_action",
            "expected_impact",
            "confidence",
            "evidence_count",
            "official_share",
            "linked_leaders",
            "affected_municipalities",
        ];

        const lines = payload.recommendations.map((recommendation) =>
            [
                recommendation.title,
                recommendation.issue,
                recommendation.urgency,
                recommendation.impactTier,
                recommendation.ownerOffice,
                recommendation.recommendedAction,
                recommendation.expectedImpact,
                recommendation.confidence,
                recommendation.evidenceCount,
                recommendation.officialShare,
                recommendation.linkedLeaders.join(" | "),
                recommendation.affectedMunicipalities.join(" | "),
            ]
                .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                .join(",")
        );

        downloadFile(
            [header.join(","), ...lines].join("\n"),
            `${baseName}.csv`,
            "text/csv;charset=utf-8"
        );
    }

    function navigateTraceChip(chip: string) {
        const targets: Record<string, string> = {
            "municipality pressure": "municipality-pressure",
            "evidence balance": "municipality-evidence-balance",
            "municipality sentiment": "municipality-sentiment",
            "public voice": "municipality-public-voice",
            "water reliability": "municipality-source-health",
            "official share": "municipality-source-coverage",
            "source reliability": "municipality-source-coverage",
        };

        const targetId = targets[chip];
        if (!targetId) {
            return;
        }

        const element = document.getElementById(targetId);
        element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    useEffect(() => {
        if (queryProvince && PROVINCES.includes(queryProvince) && queryProvince !== province) {
            setProvince(queryProvince);
        }
        if (queryDays) {
            const parsedDays = Number(queryDays);
            if ([14, 30, 90].includes(parsedDays) && parsedDays !== days) {
                setDays(parsedDays);
            }
        }
        if (queryServiceDomain && queryServiceDomain !== serviceDomain) {
            setServiceDomain(queryServiceDomain);
        }
    }, [days, province, queryDays, queryProvince, queryServiceDomain, serviceDomain]);

    useEffect(() => {
        async function parseError(response: Response, fallback: string) {
            try {
                const body = (await response.json()) as { error?: string };
                return body.error || fallback;
            } catch {
                return fallback;
            }
        }

        async function loadDirectory(): Promise<void> {
            setDirectoryState({ status: "loading" });

            try {
                const response = await fetch(
                    `/api/analytics/municipality-directory?province=${encodeURIComponent(province)}`,
                    { cache: "no-store" }
                );

                if (!response.ok) {
                    throw new Error(
                        await parseError(response, `request failed with status ${response.status}`)
                    );
                }

                const data = (await response.json()) as MunicipalityDirectoryResponse;
                setDirectoryState({ status: "loaded", data });
                const queryMatch = queryMunicipality
                    ? data.rows.find((row) => row.municipality === queryMunicipality)?.municipality
                    : null;
                setMunicipality(queryMatch ?? data.rows[0]?.municipality ?? "");
                setSelectedIssue(null);
            } catch (error) {
                setDirectoryState({
                    status: "error",
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to load municipality directory",
                });
                setMunicipality("");
                setSelectedIssue(null);
            }
        }

        void loadDirectory();
    }, [province, queryMunicipality]);

    useEffect(() => {
        async function parseError(response: Response, fallback: string) {
            try {
                const body = (await response.json()) as { error?: string };
                return body.error || fallback;
            } catch {
                return fallback;
            }
        }

        async function loadSummary(): Promise<void> {
            if (!municipality) {
                setSummaryState({ status: "error", message: "No municipality rows are available for this province yet." });
                return;
            }

            setSummaryState({ status: "loading" });

            try {
                const response = await fetch(
                    `/api/analytics/municipality-summary?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(municipality)}&days=${days}${serviceDomain !== "all" ? `&serviceDomain=${encodeURIComponent(serviceDomain)}` : ""}`,
                    { cache: "no-store" }
                );

                if (!response.ok) {
                    throw new Error(
                        await parseError(response, `request failed with status ${response.status}`)
                    );
                }

                const data = (await response.json()) as MunicipalitySummaryResponse;
                setSummaryState({ status: "loaded", data });
            } catch (error) {
                setSummaryState({
                    status: "error",
                    message:
                        error instanceof Error
                            ? error.message
                            : "Failed to load municipality summary",
                });
            }
        }

        void loadSummary();
    }, [province, municipality, days, serviceDomain]);

    useEffect(() => {
        async function parseError(response: Response, fallback: string) {
            try {
                const body = (await response.json()) as { error?: string };
                return body.error || fallback;
            } catch {
                return fallback;
            }
        }

        async function loadWardCoverage(): Promise<void> {
            if (!municipality) {
                setWardState({ status: "error", message: "No municipality selected." });
                setWard("");
                return;
            }

            setWardState({ status: "loading" });

            try {
                const response = await fetch(
                    `/api/analytics/ward-coverage?province=${encodeURIComponent(province)}&municipality=${encodeURIComponent(municipality)}`,
                    { cache: "no-store" }
                );

                if (!response.ok) {
                    throw new Error(
                        await parseError(response, `request failed with status ${response.status}`)
                    );
                }

                const data = (await response.json()) as WardCoverageResponse;
                setWardState({ status: "loaded", data });
                const queryMatch = queryWard
                    ? data.rows.find((row) => row.ward === queryWard)?.ward
                    : null;
                setWard(queryMatch ?? "");
            } catch (error) {
                setWardState({
                    status: "error",
                    message:
                        error instanceof Error ? error.message : "Failed to load ward coverage",
                });
                setWard("");
            }
        }

        void loadWardCoverage();
    }, [province, municipality, queryWard]);

    const municipalityOptions = useMemo(() => {
        if (directoryState.status !== "loaded") {
            return [];
        }

        return directoryState.data.rows;
    }, [directoryState]);
    const wardOptions = useMemo(() => {
        if (wardState.status !== "loaded") {
            return [];
        }

        return wardState.data.rows;
    }, [wardState]);
    const activeIssue =
        (serviceDomain !== "all" ? serviceDomain : null) ??
        selectedIssue ??
        (summaryState.status === "loaded"
            ? summaryState.data.summary.topComplaintTopic ?? summaryState.data.summary.topPressureDomain
            : null);
    const evidenceOptions =
        summaryState.status === "loaded"
            ? [
                  summaryState.data.summary.topComplaintTopic,
                  summaryState.data.summary.topPressureDomain,
                  selectedIssue,
              ].filter((value): value is string => Boolean(value))
            : [];

    useEffect(() => {
        setSelectedIssue(null);
    }, [province, municipality, serviceDomain]);

    useEffect(() => {
        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.set("province", province);

        if (municipality) {
            nextParams.set("municipality", municipality);
        } else {
            nextParams.delete("municipality");
        }

        nextParams.set("days", String(days));
        if (serviceDomain !== "all") {
            nextParams.set("serviceDomain", serviceDomain);
        } else {
            nextParams.delete("serviceDomain");
        }
        if (ward) {
            nextParams.set("ward", ward);
        } else {
            nextParams.delete("ward");
        }

        const nextQuery = nextParams.toString();
        const currentQuery = searchParams.toString();

        if (nextQuery !== currentQuery) {
            router.replace(`${pathname}?${nextQuery}`, { scroll: false });
        }
    }, [days, municipality, pathname, province, router, searchParams, serviceDomain, ward]);

    return (
        <div className="max-w-[1600px] mx-auto pb-24">
            <PageHeader
                title="State of the Municipality & Wards"
                subtitle="Local operational intelligence showing issue concentration, top concerns, and service-delivery pressure points by municipality and ward."
                breadcrumb={[{ name: "State of the Municipality & Wards" }]}
                headerImage="/projects/Breipaal-17-1024x683.webp"
                guidingQuestion="What is happening on the ground inside municipalities and wards, what do local communities care about most, and where are the most urgent service-delivery pressure points?"
            />

            <DashboardToolbar
                label="Municipality Command"
                title={`${municipality || "Municipality"} local pressure, community concerns, and service-delivery hotspots`}
                description={
                    summaryState.status === "loaded"
                        ? `Pressure score ${summaryState.data.summary.pressureScore}, escalation ${summaryState.data.summary.escalationScore}, and official share ${summaryState.data.summary.officialEvidenceShare}% for ${summaryState.data.municipality}.${serviceDomain !== "all" ? ` The view is filtered to ${serviceDomain}.` : ""}${ward ? ` Ward focus is set to ${ward}.` : ""} Use this dashboard to see which local areas are under the most pressure, what issues dominate, and where action is needed first.`
                        : "Focus the municipality dashboard on the right province, municipality, ward, service type, and time window to isolate local pressure, ward/community concern concentration, and the most urgent intervention areas."
                }
                controls={
                    <>
                        {returnTo ? (
                            <button
                                onClick={() => router.push(returnTo)}
                                className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                                title="Return to comparison"
                            >
                                <span className="text-[10px] font-black uppercase text-slate-400">
                                    Back
                                </span>
                            </button>
                        ) : null}
                        <select
                            value={province}
                            onChange={(event) => setProvince(event.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:outline-none"
                        >
                            {PROVINCES.map((entry) => (
                                <option key={entry} value={entry}>
                                    {entry}
                                </option>
                            ))}
                        </select>
                        <select
                            value={municipality}
                            onChange={(event) => setMunicipality(event.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:outline-none min-w-[260px]"
                            disabled={municipalityOptions.length === 0}
                        >
                            {municipalityOptions.length === 0 ? (
                                <option value="">No municipality rows available</option>
                            ) : (
                                municipalityOptions.map((entry) => (
                                    <option key={entry.municipality} value={entry.municipality}>
                                        {entry.municipality}
                                    </option>
                                ))
                            )}
                        </select>
                        <select
                            value={days}
                            onChange={(event) => setDays(Number(event.target.value))}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:outline-none"
                        >
                            <option value={14}>Last 14 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                        <select
                            value={serviceDomain}
                            onChange={(event) => setServiceDomain(event.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:outline-none"
                        >
                            {INFRASTRUCTURE_SERVICE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={ward}
                            onChange={(event) => setWard(event.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:outline-none min-w-[220px]"
                            disabled={wardOptions.length === 0}
                        >
                            {wardOptions.length === 0 ? (
                                <option value="">No ward rows available</option>
                            ) : (
                                <>
                                    <option value="">All Wards</option>
                                    {wardOptions.map((entry) => (
                                        <option key={entry.ward} value={entry.ward}>
                                            {entry.ward}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                        <button
                            onClick={() => window.print()}
                            className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                            title="Export municipality view"
                        >
                            <Download className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black uppercase text-slate-400">
                                Export
                            </span>
                        </button>
                        <button
                            onClick={() => void exportRecommendations("csv")}
                            className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                            title="Export municipality recommendations as CSV"
                        >
                            <Download className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black uppercase text-slate-400">
                                Recs CSV
                            </span>
                        </button>
                        <button
                            onClick={() => void exportRecommendations("json")}
                            className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                            title="Export municipality recommendations as JSON"
                        >
                            <Download className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black uppercase text-slate-400">
                                Recs JSON
                            </span>
                        </button>
                    </>
                }
            />

            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Active Scope
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                    The local dashboard is currently focused on{" "}
                    <span className="font-bold">{municipality || province}</span> in{" "}
                    <span className="font-bold">{province}</span> over the last{" "}
                    <span className="font-bold">{days} days</span>
                    {serviceDomain !== "all" ? (
                        <>
                            , narrowed to <span className="font-bold">{serviceDomain}</span>
                        </>
                    ) : null}
                    {ward ? (
                        <>
                            , with ward drilldown set to <span className="font-bold">{ward}</span>
                        </>
                    ) : null}
                    . Municipality KPIs remain municipality-level unless a panel explicitly says it is
                    ward-filtered.
                </p>
            </div>

            {directoryState.status === "error" ? (
                <GICCard
                    premium
                    title="Municipality Directory Unavailable"
                    subtitle="The governed municipality selector could not be built"
                    icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
                >
                    <p className="text-sm font-medium text-slate-500">{directoryState.message}</p>
                </GICCard>
            ) : null}

            {summaryState.status === "error" ? (
                <GICCard
                    premium
                    title="Municipality View Unavailable"
                    subtitle="There is not enough municipality-level governed data for this selection yet"
                    icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
                >
                    <p className="text-sm font-medium text-slate-500">{summaryState.message}</p>
                </GICCard>
            ) : null}

            {summaryState.status === "loaded" ? (
                <div className="space-y-8">
                    <SourceFreshnessNotice
                        province={province}
                        municipality={municipality}
                    />

                    <GICCard
                        premium
                        title="Local Situation Summary"
                        subtitle="Executive readout of local pressure, resident concerns, and ward or community risk"
                        icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                    >
                        <MunicipalityBriefingPanel
                            province={province}
                            municipality={municipality}
                            days={days}
                        />
                    </GICCard>

                    <GICCard
                        premium
                        title={ward ? "Ward Place Intelligence Summary" : "Municipality Place Intelligence Summary"}
                        subtitle="Combined place identity, political context, and historical infrastructure readout for the active local geography"
                        icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                    >
                        <PlaceIntelligenceSummaryPanel
                            province={province}
                            municipality={municipality}
                            ward={ward || null}
                        />
                    </GICCard>

                    <MunicipalityPlaceCoverageStrip
                        province={province}
                        municipality={municipality}
                        ward={ward || null}
                        wardReadinessLabel={
                            wardState.status === "loaded"
                                ? wardState.data.summary.wardReadinessLabel
                                : null
                        }
                        knownWardCount={
                            wardState.status === "loaded"
                                ? wardState.data.summary.registryWardCount
                                : null
                        }
                        evidenceBackedWardCount={
                            wardState.status === "loaded"
                                ? wardState.data.summary.evidenceBackedWardCount
                                : null
                        }
                    />

                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                        <p className="text-sm font-medium text-slate-700">
                            Read this local context block first. It shows who this place is, how it votes, what infrastructure issues have persisted over time, and whether the active ward already has verified political and allocation coverage.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                        <GICCard
                            title={ward ? "Ward Place Profile" : "Municipality Place Profile"}
                            subtitle="Population, service access, and socioeconomic baseline for the active geography"
                            icon={<MapPin className="w-5 h-5 text-gic-blue" />}
                        >
                            <PlaceProfilePanel
                                province={province}
                                municipality={municipality}
                                ward={ward || null}
                            />
                        </GICCard>

                        <GICCard
                            title={ward ? "Ward Election History" : "Municipality Election History"}
                            subtitle="Political context for the active geography, ready for IEC result backfills"
                            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                        >
                            <PlaceElectionHistoryPanel
                                province={province}
                                municipality={municipality}
                                ward={ward || null}
                            />
                        </GICCard>

                        <GICCard
                            title={ward ? "Municipality Context" : "Municipality Context"}
                            subtitle="Narrative and reference context for the active local geography"
                            icon={<MapPin className="w-5 h-5 text-gic-blue" />}
                        >
                            <PlaceContextPanel
                                province={province}
                                municipality={municipality}
                            />
                        </GICCard>
                    </div>

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                        {ward ? (
                            <GICCard
                                title="Ward Reference and Leadership"
                                subtitle="Governed ward identity, data coverage status, and verified councillor reference for the active ward"
                                icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                            >
                                <div className="space-y-6">
                                    <WardProfilePanel
                                        province={province}
                                        municipality={municipality}
                                        ward={ward}
                                    />
                                    <div className="border-t border-slate-100 pt-6">
                                        <WardCouncillorPanel
                                            province={province}
                                            municipality={municipality}
                                            ward={ward}
                                        />
                                    </div>
                                </div>
                            </GICCard>
                        ) : (
                            <GICCard
                                title="Municipality Historical Context"
                                subtitle="Structured historical issue and infrastructure context for the active municipality"
                                icon={<AlertTriangle className="w-5 h-5 text-gic-gold" />}
                            >
                                <InfrastructureHistoryPanel
                                    province={province}
                                    municipality={municipality}
                                    ward={null}
                                />
                            </GICCard>
                        )}

                        <GICCard
                            title={ward ? "Ward Infrastructure History" : "Municipality Budget and Allocation Signals"}
                            subtitle={
                                ward
                                    ? "Structured historical issue and infrastructure context for the active ward"
                                    : "Structured allocation records and project signals tied to the active municipality"
                            }
                            icon={ward ? <AlertTriangle className="w-5 h-5 text-gic-gold" /> : <ShieldCheck className="w-5 h-5 text-gic-blue" />}
                        >
                            {ward ? (
                                <InfrastructureHistoryPanel
                                    province={province}
                                    municipality={municipality}
                                    ward={ward}
                                />
                            ) : (
                                <BudgetAllocationPanel
                                    province={province}
                                    municipality={municipality}
                                    ward={null}
                                />
                            )}
                        </GICCard>
                    </div>

                    {ward ? (
                        <GICCard
                            title="Ward Budget and Allocation Signals"
                            subtitle="Structured allocation records and project signals tied to the active ward"
                            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                        >
                            <BudgetAllocationPanel
                                province={province}
                                municipality={municipality}
                                ward={ward}
                            />
                        </GICCard>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                        <div className="rounded-[2rem] bg-white border border-slate-100 p-6 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Municipality
                            </p>
                            <p className="mt-3 text-xl font-display font-bold text-slate-900">
                                {summaryState.data.municipality}
                            </p>
                        </div>
                        <div className="rounded-[2rem] bg-white border border-slate-100 p-6 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Local Concern Volume
                            </p>
                            <p className="mt-3 text-4xl font-display font-bold text-slate-900">
                                {summaryState.data.summary.pressureCaseCount}
                            </p>
                        </div>
                        <div className="rounded-[2rem] bg-white border border-slate-100 p-6 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Top Local Issue
                            </p>
                            <p className="mt-3 text-xl font-display font-bold text-slate-900">
                                {summaryState.data.summary.topComplaintTopic ??
                                    summaryState.data.summary.topPressureDomain ??
                                    "No data"}
                            </p>
                        </div>
                        <div className="rounded-[2rem] bg-white border border-slate-100 p-6 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Local Pressure Index
                            </p>
                            <p className="mt-3 text-4xl font-display font-bold text-slate-900">
                                {summaryState.data.summary.pressureScore}
                            </p>
                        </div>
                        <div className="rounded-[2rem] bg-white border border-slate-100 p-6 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Escalation Signal
                            </p>
                            <p className="mt-3 text-4xl font-display font-bold text-rose-600">
                                {summaryState.data.summary.escalationScore}
                            </p>
                        </div>
                        <div className="rounded-[2rem] bg-white border border-slate-100 p-6 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Resident Sentiment
                            </p>
                            <p className="mt-3 text-4xl font-display font-bold text-blue-600">
                                {summaryState.data.summary.sentimentScore ?? "N/A"}
                            </p>
                        </div>
                    </div>

                    <DecisionReadinessStrip
                        province={province}
                        municipality={municipality}
                        days={days}
                        evidenceConfidenceScore={summaryState.data.summary.evidenceConfidenceScore}
                        officialEvidenceShare={summaryState.data.summary.officialEvidenceShare}
                    />

                    <GICCard
                        title="Municipality Summary Table"
                        subtitle="Dense local operating snapshot for issue volume, top concern, evidence strength, and ward readiness"
                        icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                    >
                        <MunicipalityOperationalSnapshotPanel
                            summary={summaryState.data}
                            wardCoverage={wardState.status === "loaded" ? wardState.data : null}
                        />
                    </GICCard>

                    {ward ? (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                            <p className="text-sm font-medium text-slate-700">
                                Ward focus is active for <span className="font-bold">{ward}</span>. Ward filtering is applied only to evidence and public-voice layers that already carry governed ward mappings; municipality KPI cards remain municipality-level.
                            </p>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-12 xl:col-span-8">
                            <div id="municipality-pressure">
                            <GICCard
                                premium
                                title="Local Concern Trend"
                                subtitle="How municipality-level issue pressure is changing across the current window"
                                icon={<MapPin className="w-5 h-5 text-gic-blue" />}
                            >
                                <MunicipalityPressureTrendPanel
                                    province={province}
                                    municipality={municipality}
                                    days={days}
                                    serviceDomain={serviceDomain !== "all" ? serviceDomain : null}
                                />
                            </GICCard>
                            </div>
                        </div>
                        <div className="col-span-12 xl:col-span-4">
                            <GICCard
                                title="Hotspot Command"
                                subtitle="Where issue pressure is converging locally and what needs attention first"
                                icon={<MapPin className="w-5 h-5 text-gic-blue" />}
                            >
                                <MunicipalityHotspotSummaryPanel
                                    province={province}
                                    municipality={municipality}
                                    days={days}
                                    pressureScore={summaryState.data.summary.pressureScore}
                                    escalationScore={summaryState.data.summary.escalationScore}
                                    topPressureDomain={summaryState.data.summary.topPressureDomain}
                                    topComplaintTopic={summaryState.data.summary.topComplaintTopic}
                                    selectedIssue={activeIssue}
                                    onSelectIssue={setSelectedIssue}
                                />
                            </GICCard>
                        </div>
                    </div>

                    <div id="municipality-sentiment">
                    <GICCard
                        title="Local Public Mood"
                        subtitle="How the municipality is being experienced in governed public and narrative coverage"
                        icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                    >
                        <MunicipalitySentimentPanel
                            province={province}
                            municipality={municipality}
                            days={days}
                        />
                    </GICCard>
                    </div>

                    <GICCard
                        title="Issue Category Matrix"
                        subtitle="How local issue intensity is distributed across service categories"
                        icon={<MapPin className="w-5 h-5 text-gic-blue" />}
                    >
                        <MunicipalityIssueMatrixPanel
                            province={province}
                            municipality={municipality}
                            days={days}
                            serviceDomain={serviceDomain !== "all" ? serviceDomain : null}
                        />
                    </GICCard>

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            <div id="municipality-public-voice">
                            <GICCard
                                title="Public Voice"
                                subtitle="What ordinary residents and governed public narrative are saying locally"
                                icon={<AlertTriangle className="w-5 h-5 text-gic-gold" />}
                            >
                                <MunicipalityCitizenVoicePanel
                                    province={province}
                                    municipality={municipality}
                                    days={days}
                                    selectedIssue={selectedIssue}
                                    onSelectIssue={setSelectedIssue}
                                />
                            </GICCard>
                            </div>

                            <GICCard
                                title="Imported Community Signals"
                                subtitle="Legacy Firebase community and social signals normalized into the governed local evidence layer"
                                icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                            >
                                <MunicipalityLegacyCommunitySignalsPanel
                                    province={province}
                                    municipality={municipality}
                                    days={days}
                                    selectedIssue={selectedIssue}
                                    onSelectIssue={setSelectedIssue}
                                />
                            </GICCard>
                        </div>

                        <GICCard
                            title="Direct Public Evidence"
                            subtitle="Top governed citizen-facing documents behind the current municipality issue focus"
                            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                        >
                            <MunicipalityPublicVoiceHighlightsPanel
                                province={province}
                                municipality={municipality}
                                ward={ward || null}
                                issueFamily={activeIssue}
                                days={days}
                            />
                        </GICCard>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <GICCard
                            title="Priority Actions"
                            subtitle="Local actions that best match current pressure, resident concerns, and urgency"
                            icon={<AlertTriangle className="w-5 h-5 text-gic-gold" />}
                        >
                                <MunicipalityRecommendationsPanel
                                    province={province}
                                    municipality={municipality}
                                    days={days}
                                    selectedIssue={activeIssue}
                                    onSelectIssue={setSelectedIssue}
                                    onSelectTraceChip={navigateTraceChip}
                                />
                        </GICCard>

                        <GICCard
                            title="Ward Coverage"
                            subtitle="Governed ward-level availability and drilldown readiness"
                            icon={<MapPin className="w-5 h-5 text-gic-blue" />}
                        >
                            <WardCoveragePanel
                                province={province}
                                municipality={municipality}
                                selectedWard={ward || null}
                                onSelectWard={(nextWard) => setWard(nextWard ?? "")}
                            />
                        </GICCard>
                    </div>

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                        <GICCard
                            title="Local Evidence"
                            subtitle="Supporting documents and governed sentiment mentions for the selected municipality issue"
                            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                        >
                            <div className="space-y-5">
                                <EvidenceFocusStrip
                                    label="Local evidence focus"
                                    activeIssue={activeIssue}
                                    options={evidenceOptions}
                                    onSelectIssue={setSelectedIssue}
                                />
                                <MunicipalityEvidencePanel
                                    province={province}
                                    municipality={municipality}
                                    ward={ward || null}
                                    topic={activeIssue}
                                />
                            </div>
                        </GICCard>

                        <GICCard
                            title="Public Voice Evidence"
                            subtitle="Citizen and public narrative evidence behind the selected municipality issue"
                            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                        >
                            <div className="space-y-5">
                                <EvidenceFocusStrip
                                    label="Public voice focus"
                                    activeIssue={activeIssue}
                                    options={evidenceOptions}
                                    onSelectIssue={setSelectedIssue}
                                />
                                <CitizenVoiceEvidencePanel
                                    province={province}
                                    municipality={municipality}
                                    ward={ward || null}
                                    issueFamily={activeIssue}
                                    days={days}
                                />
                            </div>
                        </GICCard>
                    </div>

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                        <div id="municipality-evidence-balance">
                        <GICCard
                            title="Local Alignment Signal"
                            subtitle="How official local attention compares with resident and narrative pressure"
                            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                        >
                            <MunicipalityEvidenceBalancePanel
                                province={province}
                                municipality={municipality}
                                days={days}
                            />
                        </GICCard>
                        </div>
                        <div id="municipality-source-health">
                        <GICCard
                            title="Source Health"
                            subtitle="Connector freshness and run condition behind this municipality view"
                            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                        >
                            <MunicipalitySourceHealthPanel
                                province={province}
                                municipality={municipality}
                            />
                        </GICCard>
                        </div>
                        <div id="municipality-source-coverage">
                        <GICCard
                            title="Source Coverage"
                            subtitle="Verified registry depth backing this municipality"
                            icon={<ShieldCheck className="w-5 h-5 text-gic-blue" />}
                        >
                            <MunicipalitySourceCoveragePanel
                                province={province}
                                municipality={municipality}
                            />
                        </GICCard>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
