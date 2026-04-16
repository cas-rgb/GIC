import ImpactSimulatorClient from "@/components/analytics/ImpactSimulatorClient";
import OmniFilterToolbar from "@/components/ui/OmniFilterToolbar";
import PageHeader from "@/components/ui/PageHeader";

export default function ImpactSimulatorPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Predictive Impact Simulator"
        subtitle="Advanced AI modeling engine forecasting the 5-year socio-economic ripple effects of hypothetical infrastructure capital injections."
        breadcrumb={[{ name: "Executive" }, { name: "Impact Simulator" }]}
        headerImage="/projects/Section-C-Image-2.webp"
      />
      <ImpactSimulatorClient />
    </div>
  );
}
