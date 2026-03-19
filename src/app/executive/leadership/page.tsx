"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LeadershipSentimentPanel from "@/components/analytics/LeadershipSentimentPanel";
import LeaderDeepDiveDrawer from "@/components/analytics/LeaderDeepDiveDrawer";
import { LeadershipSentimentLeaderRow } from "@/lib/analytics/types";

export default function LeadershipSentimentPage() {
  const searchParams = useSearchParams();
  const province = searchParams.get("province") || "Gauteng";
  const days = searchParams.get("days") ? Number(searchParams.get("days")) : 30;
  const municipality = searchParams.get("municipality");
  const ward = searchParams.get("ward");
  const serviceDomain = searchParams.get("serviceDomain");
  const [selectedLeader, setSelectedLeader] = useState<LeadershipSentimentLeaderRow | null>(null);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leadership Sentiment"
        subtitle={`How leaders and public offices are being perceived across ${province}.`}
        headerImage="/projects/INTABAZWE-X2-9906-1024x683.webp"
      />
      <div className="space-y-8 mt-6">
        <LeadershipSentimentPanel
          province={province}
          municipality={municipality}
          serviceDomain={serviceDomain}
          ward={ward}
          days={days}
          onSelectLeader={setSelectedLeader}
        />
      </div>

      <LeaderDeepDiveDrawer
        leader={selectedLeader}
        isOpen={!!selectedLeader}
        onClose={() => setSelectedLeader(null)}
        days={days}
        province={province}
      />
    </div>
  );
}
