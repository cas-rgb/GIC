import PageHeader from "@/components/ui/PageHeader";
import SocialTrendsDashboardClient from "@/components/analytics/SocialTrendsDashboardClient";

export const dynamic = "force-dynamic";

export default async function SocialTrendsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await props.searchParams;
  const province = params.province || "All Provinces";

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Social Media, News & Other Trends"
        subtitle="Track breaking infrastructure sentiment, protest signaling, and localized news anomalies."
        headerImage="/projects/MAJWEMASWEU-X5-0309-1024x575.webp"
      />
      <SocialTrendsDashboardClient />
    </div>
  );
}
