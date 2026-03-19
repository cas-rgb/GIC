"use client";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import MatchmakerDealRoomHeader from "@/components/analytics/MatchmakerDealRoomHeader";
import InvestorProfilingClient from "@/components/analytics/InvestorProfilingClient";

export default function InvestorsPage() {
  const searchParams = useSearchParams();
  const province = searchParams.get("province") || "Gauteng";

  return (
    <div className="space-y-8">
      {" "}
      <PageHeader
        title="Investor Profiling"
        subtitle={`Which economic opportunities and investor matches exist in ${province}.`}
        headerImage="/projects/INTABAZWE-X2-9964-1024x683.webp"
      />{" "}
      <div className="space-y-8 mt-6">
        {" "}
        <MatchmakerDealRoomHeader province={province} />{" "}
        <InvestorProfilingClient />
      </div>{" "}
    </div>
  );
}
