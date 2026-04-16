"use client";
import PageHeader from "@/components/ui/PageHeader";
import UnderservedCommunitiesDashboard from "@/components/analytics/UnderservedCommunitiesDashboard";

export default function UnderservedCommunitiesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Underserved Communities"
        subtitle="Focusing strictly on historically poor, priority regions and internal GIC interventions."
        headerImage="/projects/PRIESKA-3-1024x512.webp"
      />
      
      <div className="space-y-8 mt-6">
        <UnderservedCommunitiesDashboard />
      </div>
    </div>
  );
}
