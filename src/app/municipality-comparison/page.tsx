"use client";

import { useEffect, useState } from "react";
import { GitCompare } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import MunicipalityComparisonPanel from "@/components/analytics/MunicipalityComparisonPanel";
import PageHeader from "@/components/ui/PageHeader";
import GICCard from "@/components/ui/GICCard";
import DashboardToolbar from "@/components/ui/DashboardToolbar";

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

export default function MunicipalityComparisonPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryProvince = searchParams.get("province");
  const [province, setProvince] = useState("Gauteng");

  useEffect(() => {
    if (
      queryProvince &&
      PROVINCES.includes(queryProvince) &&
      queryProvince !== province
    ) {
      setProvince(queryProvince);
    }
  }, [province, queryProvince]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("province", province);

    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }
  }, [pathname, province, router, searchParams]);

  return (
    <div className="max-w-[1600px] mx-auto pb-24">
      <PageHeader
        title="Municipality Comparison"
        subtitle="Within-province comparison of municipalities across pressure, sentiment, evidence, and official share"
        breadcrumb={[{ name: "Municipality Comparison" }]}
        guidingQuestion="Which municipalities inside the province need the fastest intervention, and how trustworthy is the local evidence?"
      />

      <div className="space-y-5">
        <DashboardToolbar
          title="Rank municipalities within the province by local pressure, sentiment, and evidence strength"
          description="Use this comparison view to identify which municipalities require the fastest operational intervention and where local evidence remains too weak."
          controls={
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Province
              </span>
              <select
                value={province}
                onChange={(event) => setProvince(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900"
              >
                {PROVINCES.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </label>
          }
        />

        <GICCard
          premium
          title="Within-Province Municipality Comparison"
          subtitle="Governed municipality comparison built from local pressure, sentiment, and evidence summaries"
          icon={<GitCompare className="w-5 h-5 text-gic-blue" />}
        >
          <MunicipalityComparisonPanel province={province} />
        </GICCard>
      </div>
    </div>
  );
}
