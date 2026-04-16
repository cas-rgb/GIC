
import PageHeader from "@/components/ui/PageHeader";
import MunicipalityMapPanel from "@/components/analytics/MunicipalityMapPanel";
import PlaceProfilePanel from "@/components/analytics/PlaceProfilePanel";
import PlaceElectionHistoryPanel from "@/components/analytics/PlaceElectionHistoryPanel";
import WardIntelligencePanel from "@/components/analytics/WardIntelligencePanel";
import MunicipalityInfluencerPanel from "@/components/analytics/MunicipalityInfluencerPanel";
import GroundTruthTracker from "@/components/analytics/GroundTruthTracker";

export const dynamic = "force-dynamic";

export default async function MunicipalitiesPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await props.searchParams;
  const province = params.province || "Gauteng";
  const municipality = params.municipality || "All Municipalities";
  const ward = params.ward || "All Wards";
  const serviceDomain = params.serviceDomain || "all";

  // Build a specific location string for dynamic text
  const locTitle = ward !== "All Wards" ? `${ward}, ${municipality}` 
                   : (municipality !== "All Municipalities" ? municipality : province);

  const targetMuni = municipality !== "All Municipalities" ? municipality : province;
  let wards: any[] = [];
  try {
     const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
     const res = await fetch(`${baseUrl}/api/analytics/ward-intelligence?municipality=${encodeURIComponent(targetMuni)}`, { cache: "no-store" });
     if (res.ok) {
       const json = await res.json();
       wards = json.wards || [];
     }
  } catch (e) {
     console.error("Failed to fetch wards server-side:", e);
  }

  const loadingWards = false;

  return (
    <div className="space-y-8">
      <PageHeader
        title="State of the Municipality & Wards"
        subtitle={`Deep ethnographic, electoral, and intelligence briefing for ${locTitle}.`}
        headerImage="/projects/Breipaal-17-1024x683.webp"
      />
      
      {/* 0. INTERACTIVE PERIMETER MAP */}
      <MunicipalityMapPanel municipality={municipality !== "All Municipalities" ? municipality : province} wardsData={wards} isLoading={loadingWards} />
      
      {municipality !== "All Municipalities" && (
        <div className="mt-8">
           <WardIntelligencePanel municipality={municipality} wardsData={wards} isLoading={loadingWards} />
        </div>
      )}
      
      <div className="space-y-8 mt-8">
        {/* 1. ETHNOGRAPHIC & DEMOGRAPHIC BASELINE */}
        <div className="bg-slate-900 border border-slate-700 shadow-2xl p-6 relative overflow-hidden">
          <h4 className="font-black text-xl text-white uppercase tracking-widest mb-4">
              Demographic & Cultural Profile
          </h4>
          <PlaceProfilePanel province={province} municipality={municipality !== "All Municipalities" ? municipality : null} ward={ward !== "All Wards" ? ward : null} />
        </div>

        {/* 2. OSINT INFLUENCER MATRIX */}
        <div className="bg-slate-900 border border-slate-700 shadow-2xl p-6 relative overflow-hidden">
          <h4 className="font-black text-xl text-white uppercase tracking-widest mb-4">
              Community Sentiment & Public Coverage
          </h4>
          <MunicipalityInfluencerPanel 
              province={province} 
              municipality={municipality !== "All Municipalities" ? municipality : null} 
              serviceDomain={serviceDomain}
          />
        </div>

        {/* 3. ELECTORAL & VOTING HISTORY */}
        <div className="bg-slate-900 border border-slate-700 shadow-2xl p-6 relative overflow-hidden">
          <h4 className="font-black text-xl text-white uppercase tracking-widest mb-4">
              Electoral Intelligence & Voting History
          </h4>
          <p className="text-slate-400 text-xs mb-6 uppercase tracking-wider font-bold">
              Historical Ward Turnout and Shifting Party Dynamics
          </p>
          <div className="bg-slate-950/50 p-4 border border-slate-800 overflow-x-auto rounded-xl">
            <PlaceElectionHistoryPanel 
              province={province} 
              municipality={municipality !== "All Municipalities" ? municipality : null} 
              ward={ward !== "All Wards" ? ward : null} 
            />
          </div>
        </div>

        {/* 4. GROUND TRUTH INFRASTRUCTURE ISSUES */}
        <div className="bg-slate-900 border border-slate-700 shadow-2xl p-6 relative overflow-hidden">
          <h4 className="font-black text-xl text-white uppercase tracking-widest mb-4">
              Service Delivery Ground Truth
          </h4>
          <GroundTruthTracker municipality={municipality} ward={ward !== "All Wards" ? ward : null} serviceDomain={serviceDomain} />
        </div>
      </div>
    </div>
  );
}
