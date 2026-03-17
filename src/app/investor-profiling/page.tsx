import InvestorProfilingClient from "@/components/analytics/InvestorProfilingClient";
import PageHeader from "@/components/ui/PageHeader";

export default function InvestorProfilingPage() {
    return (
        <div className="max-w-[1600px] mx-auto pb-24">
            <PageHeader
                title="Investor Profiling"
                subtitle="Directional economic opportunity dashboard for province or municipality needs, sector relevance, and likely investor fit."
                breadcrumb={[{ name: "Investor Profiling" }]}
                headerImage="/projects/MAJWEMASWEU-X5-1165-1024x683.webp"
                guidingQuestion="What does this province or municipality need most, which sectors are relevant, and which companies or investor types are most likely to align with those opportunities?"
            />

            <InvestorProfilingClient />
        </div>
    );
}
