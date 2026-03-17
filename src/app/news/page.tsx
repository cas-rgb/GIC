import SocialTrendsDashboardClient from "@/components/analytics/SocialTrendsDashboardClient";
import PageHeader from "@/components/ui/PageHeader";

export default function NewsAndSignals() {
  return (
    <div className="mx-auto max-w-[1600px] pb-24">
      <PageHeader
        title="Social Media, News & Other Trends"
        subtitle="Real-time signal dashboard for trending topics, rising narratives, source mix, and geographic spread across social and news channels."
        breadcrumb={[{ name: "Social Media, News & Other Trends" }]}
        headerImage="/projects/Breipaal-17-1024x683.webp"
        guidingQuestion="What are people, communities, media, and online conversations saying right now, which issues are rising fastest, and what narratives are spreading?"
      />

      <SocialTrendsDashboardClient />
    </div>
  );
}
