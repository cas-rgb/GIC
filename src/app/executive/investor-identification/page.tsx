import PageHeader from "@/components/ui/PageHeader";
import InvestorIdentificationClient from "@/components/analytics/InvestorIdentificationClient";

export default function InvestorIdentificationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Investor Identification Tool"
        subtitle="Search, filter, and permanently save targeted investor profiles aligned to GIC development mandates."
        headerImage="/projects/INTABAZWE-X2-9964-1024x683.webp"
      />
      <div className="space-y-8 mt-6">
        <InvestorIdentificationClient />
      </div>
    </div>
  );
}
