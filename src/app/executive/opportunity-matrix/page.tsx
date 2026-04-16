import OpportunityMatrixClient from "@/components/analytics/OpportunityMatrixClient";
import OmniFilterToolbar from "@/components/ui/OmniFilterToolbar";
import PageHeader from "@/components/ui/PageHeader";

export default function OpportunityMatrixPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Geospatial Opportunity Matrix"
        subtitle="AI-driven quadrant mapping isolating wards and local nodes based on maximum Commercial ROI versus Urgent Socioeconomic Demand."
        breadcrumb={[{ name: "Executive" }, { name: "Opportunity Matrix" }]}
        headerImage="/projects/Section-I-Image-1.webp"
      />
      <OpportunityMatrixClient />
    </div>
  );
}
