import PageHeader from "@/components/ui/PageHeader";
import LeadershipDashboardClient from "./LeadershipDashboardClient";

export const dynamic = "force-dynamic";
export const maxDuration = 60; 

export default async function LeadershipSentimentPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.searchParams;
  const province = (params?.province as string) || "Gauteng";
  const days = params?.days ? Number(params.days) : 30;
  const municipality = params?.municipality as string | undefined;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Leadership Intelligence"
        subtitle="Search any political figure or municipal official to synthesize a real-time, exhaustive AI strategic dossier on their current institutional exposure."
        headerImage="/projects/INTABAZWE-X2-9964-1024x683.webp"
      />
      <LeadershipDashboardClient 
        province={province} 
        municipality={municipality}
        days={days}
      />
    </div>
  );
}
