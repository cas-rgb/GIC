"use client";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import MunicipalityMapPanel from "@/components/analytics/MunicipalityMapPanel";
import PlaceProfilePanel from "@/components/analytics/PlaceProfilePanel";
import PlaceElectionHistoryPanel from "@/components/analytics/PlaceElectionHistoryPanel";
import WardIntelligencePanel from "@/components/analytics/WardIntelligencePanel";
import MunicipalityInfluencerPanel from "@/components/analytics/MunicipalityInfluencerPanel";
import GroundTruthTracker from "@/components/analytics/GroundTruthTracker";

export default function MunicipalitiesPage() {
  const searchParams = useSearchParams();
  const province = searchParams.get("province") || "Gauteng";
  const municipality = searchParams.get("municipality") || "All Municipalities";
  const ward = searchParams.get("ward") || "All Wards";
  const serviceDomain = searchParams.get("serviceDomain") || "all";

  // Build a specific location string for dynamic text
  const locTitle = ward !== "All Wards" ? `${ward}, ${municipality}` 
                   : (municipality !== "All Municipalities" ? municipality : province);

  return (
    <div className="space-y-8">
      <PageHeader
        title="State of the Municipality & Wards"
        subtitle={`Deep ethnographic, electoral, and intelligence briefing for ${locTitle}.`}
        headerImage="/projects/Breipaal-17-1024x683.webp"
      />
      
      {/* 0. INTERACTIVE PERIMETER MAP */}
      <MunicipalityMapPanel municipality={municipality !== "All Municipalities" ? municipality : province} />
      
      {municipality !== "All Municipalities" && (
        <div className="mt-8">
           <WardIntelligencePanel municipality={municipality} />
        </div>
      )}
      
      <div className="space-y-8 mt-8">
        {/* 1. ETHNOGRAPHIC & DEMOGRAPHIC BASELINE */}
        <div className="bg-slate-900 border border-slate-700 shadow-2xl p-6 relative overflow-hidden">
          <h4 className="font-black text-xl text-white uppercase tracking-widest mb-4">
              Demographic & Cultural Profile
          </h4>
          <p className="text-slate-400 text-xs mb-6 uppercase tracking-wider font-bold">
              Live Wikipedia & StatSA Baseline Data
          </p>
          <PlaceProfilePanel province={province} municipality={municipality !== "All Municipalities" ? municipality : null} ward={ward !== "All Wards" ? ward : null} />
        </div>

        {/* 2. OSINT INFLUENCER MATRIX */}
        <div className="pt-4 border-t border-slate-800">
          <MunicipalityInfluencerPanel 
              province={province} 
              municipality={municipality !== "All Municipalities" ? municipality : null} 
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
        <div className="pt-4 border-t border-slate-800">
          <h4 className="font-black text-xl text-white uppercase tracking-widest mb-4">
              Service Delivery Ground Truth
          </h4>
          <GroundTruthTracker municipality={municipality} ward={ward !== "All Wards" ? ward : null} serviceDomain={serviceDomain} />
        </div>
      </div>
    </div>
  );
}
