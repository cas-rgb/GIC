"use client";

import PageHeader from "@/components/ui/PageHeader";
import MunicipalitiesWardsDashboardClient from "@/components/analytics/MunicipalitiesWardsDashboardClient";

export default function MunicipalitiesWardsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Wards and Municipalities: The Outsider's Report"
        subtitle="Search any ward or community to synthesize a real-time AI strategic dossier on its infrastructure exposure, electoral volatility, and neglect status."
        headerImage="/projects/INTABAZWE-X2-0009-1024x683.webp"
      />
      
      <div className="mt-8">
        <MunicipalitiesWardsDashboardClient />
      </div>
    </div>
  );
}
