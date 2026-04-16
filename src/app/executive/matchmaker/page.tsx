import MatchmakerClient from "@/components/analytics/MatchmakerClient";
import OmniFilterToolbar from "@/components/ui/OmniFilterToolbar";
import PageHeader from "@/components/ui/PageHeader";

export default function MatchmakerPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Automated Deal Room"
        subtitle="Proprietary AI index aligning specific Development Finance Institutions, NGOs, and Private Equity with localized infrastructure deficits."
        breadcrumb={[{ name: "Executive" }, { name: "Deal Room Matchmaker" }]}
        headerImage="/projects/INTABAZWE-X2-9900-683x1024.webp"
      />
      <MatchmakerClient />
    </div>
  );
}
