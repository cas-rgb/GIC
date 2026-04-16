import PitchGeneratorClient from "@/components/analytics/PitchGeneratorClient";
import OmniFilterToolbar from "@/components/ui/OmniFilterToolbar";
import PageHeader from "@/components/ui/PageHeader";

export default function PitchGeneratorPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Pitch Pack & Readiness Tools"
        subtitle="Instantly generate persuasive 'Why Invest Here' business cases, score structural readiness, and export PDF briefs directly to funders."
        breadcrumb={[{ name: "Executive" }, { name: "Pitch Generator" }]}
        headerImage="/projects/INTABAZWE-X2-0009-1024x683.webp"
      />
      <PitchGeneratorClient />
    </div>
  );
}
