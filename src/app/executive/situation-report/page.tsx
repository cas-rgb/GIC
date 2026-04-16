import PageHeader from "@/components/ui/PageHeader";
import AISituationReport from "@/components/analytics/AISituationReport";
import { generateProvinceBriefing } from "@/app/actions";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow sufficient routing time for full OSINT payload verification

export default async function SituationReportPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await props.searchParams;
  const province = params.province as string | undefined;
  const days = params.days ? Number(params.days) : 365;
  const serviceDomain = params.serviceDomain || "all";
  const municipality = params.municipality || "All Municipalities";

  const PROVINCES = [
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Limpopo",
    "Mpumalanga",
    "North West",
    "Free State",
    "Northern Cape",
  ];

  if (!province) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="State of the Province"
          subtitle="Select a geographic operating theater to compile the situational report."
          headerImage="/projects/MAJWEMASWEU-X5-1039-1024x683.webp"
        />
        <div className="flex flex-col items-center justify-center p-12 border border-slate-800 bg-slate-950 rounded-3xl mt-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Select Target Province</h2>
          <p className="text-slate-500 text-sm mb-12">No automatic telemetry generated. Please trigger extraction manually.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
            {PROVINCES.map((p) => (
              <a 
                key={p} 
                href={`?province=${encodeURIComponent(p)}`} 
                className="bg-slate-900 border border-slate-700 hover:border-gic-blue hover:bg-slate-800 text-white font-bold py-6 px-4 rounded-xl text-center transition-all shadow-md group"
              >
                <span className="group-hover:text-gic-blue transition-colors">{p}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 1. Generate Province Briefing via Direct Server Action 
  let briefingData = null;
  
  const response = await generateProvinceBriefing(province, serviceDomain);
  
  if (!response.success) {
    return (
      <div className="p-8 mt-16 max-w-4xl mx-auto border-2 border-dashed border-red-500 bg-red-950/20 text-red-500 font-mono rounded-xl">
        <h2 className="text-xl font-bold mb-4">CRITICAL OSINT PIPELINE FAILURE</h2>
        <div className="bg-black/50 p-4 rounded text-xs overflow-auto whitespace-pre-wrap font-mono">
           {response.error}
        </div>
        <p className="mt-4 text-xs opacity-70">Please copy this exact error trace and paste it in the chat!</p>
      </div>
    );
  }

  if (response.success && response.data) {
     briefingData = response.data;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="State of the Province"
        subtitle={`What ${province} is experiencing overall across critical infrastructure sectors.`}
        headerImage="/projects/MAJWEMASWEU-X5-1039-1024x683.webp"
      />
      <div className="space-y-8 mt-6">
        <AISituationReport province={province} days={days} initialData={briefingData} />
      </div>
    </div>
  );
}
