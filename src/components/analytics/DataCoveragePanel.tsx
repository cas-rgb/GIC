"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Database, ShieldCheck, Users } from "lucide-react";

import {
  SourceHealthSummaryResponse,
  SourceRegistrySummaryResponse,
} from "@/lib/source-registry/types";
import { SocialCoverageResponse } from "@/lib/source-registry/social-queries";

type RegistryState =
  | { status: "loading" }
  | { status: "loaded"; data: SourceRegistrySummaryResponse }
  | { status: "error"; message: string };

type SocialState =
  | { status: "loading" }
  | { status: "loaded"; data: SocialCoverageResponse }
  | { status: "error"; message: string };

type HealthState =
  | { status: "loading" }
  | { status: "loaded"; data: SourceHealthSummaryResponse }
  | { status: "error"; message: string };

export default function DataCoveragePanel() {
  const [registryState, setRegistryState] = useState<RegistryState>({
    status: "loading",
  });
  const [socialState, setSocialState] = useState<SocialState>({
    status: "loading",
  });
  const [healthState, setHealthState] = useState<HealthState>({
    status: "loading",
  });

  useEffect(() => {
    async function parseError(response: Response, fallback: string) {
      try {
        const body = (await response.json()) as { error?: string };
        return body.error || fallback;
      } catch {
        return fallback;
      }
    }

    async function load(): Promise<void> {
      try {
        const [registryResponse, socialResponse, healthResponse] =
          await Promise.all([
            fetch("/api/analytics/source-registry-summary", {
              cache: "no-store",
            }),
            fetch("/api/analytics/social-coverage-summary", {
              cache: "no-store",
            }),
            fetch("/api/analytics/source-health-summary", {
              cache: "no-store",
            }),
          ]);

        if (!registryResponse.ok) {
          throw new Error(
            await parseError(
              registryResponse,
              `source registry failed with status ${registryResponse.status}`,
            ),
          );
        }

        if (!socialResponse.ok) {
          throw new Error(
            await parseError(
              socialResponse,
              `social coverage failed with status ${socialResponse.status}`,
            ),
          );
        }

        if (!healthResponse.ok) {
          throw new Error(
            await parseError(
              healthResponse,
              `source health failed with status ${healthResponse.status}`,
            ),
          );
        }

        const [registryData, socialData, healthData] = (await Promise.all([
          registryResponse.json(),
          socialResponse.json(),
          healthResponse.json(),
        ])) as [
          SourceRegistrySummaryResponse,
          SocialCoverageResponse,
          SourceHealthSummaryResponse,
        ];

        setRegistryState({ status: "loaded", data: registryData });
        setSocialState({ status: "loaded", data: socialData });
        setHealthState({ status: "loaded", data: healthData });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load data coverage";
        setRegistryState({ status: "error", message });
        setSocialState({ status: "error", message });
        setHealthState({ status: "error", message });
      }
    }

    void load();
  }, []);

  const provinceRows = useMemo(() => {
    if (
      registryState.status !== "loaded" ||
      socialState.status !== "loaded" ||
      healthState.status !== "loaded"
    ) {
      return [];
    }

    const socialMap = new Map(
      (socialState.data.byProvince || []).map((row) => [
        row.province ?? "__national__",
        row.accountCount,
      ]),
    );
    const healthMap = new Map(
      (healthState.data.byProvince || []).map((row) => [
        row.province ?? "__national__",
        row,
      ]),
    );

    return registryState.data.byProvince
      .filter((row) => row.province)
      .map((row) => ({
        province: row.province ?? "National",
        sourceCount: row.sourceCount,
        officialCount: row.officialCount,
        kpiTruthCount: row.kpiTruthCount,
        socialCount: socialMap.get(row.province ?? "__national__") ?? 0,
        health: healthMap.get(row.province ?? "__national__") ?? null,
      }));
  }, [healthState, registryState, socialState]);

  if (
    registryState.status === "loading" ||
    socialState.status === "loading" ||
    healthState.status === "loading"
  ) {
    return (
      <div className="flex min-h-[480px] items-center justify-center text-sm font-bold text-slate-400">
        Loading governed data coverage...
      </div>
    );
  }

  if (
    registryState.status === "error" ||
    socialState.status === "error" ||
    healthState.status === "error"
  ) {
    const message =
      registryState.status === "error"
        ? registryState.message
        : socialState.status === "error"
          ? socialState.message
          : healthState.status === "error"
            ? healthState.message
            : "Failed to load data coverage";

    return (
      <div className="flex min-h-[480px] items-center justify-center text-center">
        <p className="text-sm font-medium text-slate-500">{message}</p>
      </div>
    );
  }

  const registry = registryState.data;
  const social = socialState.data;
  const health = healthState.data;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Verified Sources
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-slate-900">
            {registry.totals.sourceCount}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            KPI Truth Sources
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-blue-600">
            {registry.totals.officialKpiTruthCount}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Verified Social Accounts
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-emerald-600">
            {social.totals.verifiedCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Source Classes
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-amber-600">
            {registry.byType.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
            Healthy Connectors
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-emerald-600">
            {health.totals.healthyCount}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
            Stale Connectors
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-amber-600">
            {health.totals.staleCount}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            Failing Connectors
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-rose-600">
            {health.totals.failingCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Refreshed 24h
          </p>
          <p className="mt-2 text-3xl font-display font-bold text-slate-900">
            {health.totals.refreshedLast24hCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900">
                Province Coverage
              </h4>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Official, KPI, and social depth by province
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Database className="h-3.5 w-3.5" />
              {registry.trace.table}
            </div>
          </div>

          <div className="space-y-3">
            {provinceRows.map((row) => (
              <div
                key={row.province}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900">
                    {row.province}
                  </p>
                  <p className="text-lg font-display font-bold text-slate-900">
                    {row.sourceCount}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-3 text-center">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm font-bold text-slate-900">
                      {row.sourceCount}
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Total
                    </p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-sm font-bold text-blue-600">
                      {row.officialCount}
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">
                      Official
                    </p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3">
                    <p className="text-sm font-bold text-amber-600">
                      {row.kpiTruthCount}
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-400">
                      KPI
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <p className="text-sm font-bold text-emerald-600">
                      {row.socialCount}
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400">
                      Social
                    </p>
                  </div>
                </div>

                {row.health ? (
                  <div className="mt-4 grid grid-cols-4 gap-3 text-center">
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-sm font-bold text-emerald-600">
                        {row.health.healthyCount}
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400">
                        Healthy
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3">
                      <p className="text-sm font-bold text-amber-600">
                        {row.health.staleCount}
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-400">
                        Stale
                      </p>
                    </div>
                    <div className="rounded-xl bg-rose-50 p-3">
                      <p className="text-sm font-bold text-rose-600">
                        {row.health.failingCount}
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-rose-400">
                        Failing
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-sm font-bold text-slate-900">
                        {row.health.refreshedLast24hCount}
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                        24h
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-rose-600" />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                  Connector Health
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Active operational sources ordered by failure risk
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {health.bySource.slice(0, 6).map((row) => (
                <div
                  key={row.sourceId}
                  className="rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {row.sourceName}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {row.province ?? "National"} · {row.sourceType}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] ${
                        row.healthStatus === "healthy"
                          ? "bg-emerald-50 text-emerald-600"
                          : row.healthStatus === "stale"
                            ? "bg-amber-50 text-amber-600"
                            : row.healthStatus === "failing"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {row.healthStatus.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                  Source Type Mix
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Registry-wide verified source classes
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {registry.byType.map((row) => (
                <div
                  key={row.sourceType}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm font-bold text-slate-900">
                    {row.sourceType}
                  </span>
                  <span className="text-sm font-display font-bold text-slate-900">
                    {row.sourceCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                  Social Platform Mix
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Verified whitelist accounts only
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {social.byPlatform.map((row) => (
                <div
                  key={row.platform}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm font-bold text-slate-900">
                    {row.platform}
                  </span>
                  <span className="text-sm font-display font-bold text-slate-900">
                    {row.accountCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                  Governance Rule
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Official sources drive KPI truth. Media, civic, research, and
                  social sources expand evidence and improve intervention
                  context.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
