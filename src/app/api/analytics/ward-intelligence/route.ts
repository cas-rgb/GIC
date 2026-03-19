import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

const WARD_NOMS: Record<string, string> = {
  "City of Johannesburg_1": "Orange Farm",
  "City of Johannesburg_2": "Ivory Park",
  "City of Johannesburg_87": "Melville & Auckland Park",
  "City of Johannesburg_88": "Emmarentia & Northcliff",
  "City of Johannesburg_130": "Soweto & Orlando",
  "eThekwini_1": "KwaXimba & Rural",
  "eThekwini_10": "Kloof & Hillcrest",
  "eThekwini_27": "Morningside & Berea",
  "eThekwini_33": "Umbilo & Glenwood",
  "eThekwini_101": "Cato Manor",
  "City of Cape Town_1": "Goodwood",
  "City of Cape Town_54": "Sea Point & Camps Bay",
  "City of Cape Town_76": "Mitchells Plain",
  "City of Cape Town_115": "Green Point & CBD",
  "City of Tshwane_1": "Pretoria North",
  "City of Tshwane_42": "Waterkloof",
  "City of Tshwane_69": "Centurion"
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const municipality = searchParams.get("municipality");

  if (!municipality) {
    return NextResponse.json({ error: "Municipality parameter is required" }, { status: 400 });
  }

  try {
    const wardsRef = collection(db, "wardIntelligence");
    const q = query(wardsRef, where("municipality", "==", municipality));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // PROCEDURAL FALLBACK -> AUTO-SEEDING PIPELINE
      let baseLat = -29.0;
      let baseLng = 24.0;
      const paramStr = municipality.toLowerCase();
      // Master SA GPS Mappings
      if (paramStr.includes("gauteng") || paramStr.includes("johannesburg") || paramStr.includes("tshwane") || paramStr.includes("ekurhuleni")) { baseLat = -26.1; baseLng = 28.1; }
      else if (paramStr.includes("western cape") || paramStr.includes("cape town") || paramStr.includes("stellenbosch")) { baseLat = -33.9; baseLng = 18.4; }
      else if (paramStr.includes("kwazulu-natal") || paramStr.includes("ethekwini") || paramStr.includes("umhlathuze")) { baseLat = -29.5; baseLng = 31.0; }
      else if (paramStr.includes("eastern cape") || paramStr.includes("mandela") || paramStr.includes("buffalo")) { baseLat = -32.5; baseLng = 27.0; }
      else if (paramStr.includes("limpopo") || paramStr.includes("polokwane") || paramStr.includes("thulamela")) { baseLat = -23.9; baseLng = 29.4; }
      else if (paramStr.includes("mpumalanga") || paramStr.includes("mbombela") || paramStr.includes("emalahleni")) { baseLat = -25.5; baseLng = 30.5; }
      else if (paramStr.includes("north west") || paramStr.includes("rustenburg") || paramStr.includes("mahikeng")) { baseLat = -26.0; baseLng = 26.5; }
      else if (paramStr.includes("free state") || paramStr.includes("mangaung") || paramStr.includes("matjhabeng")) { baseLat = -29.1; baseLng = 26.2; }
      else if (paramStr.includes("northern cape") || paramStr.includes("plaatje") || paramStr.includes("kruiper")) { baseLat = -28.7; baseLng = 22.0; }

      try {
        const genAI = new GoogleGenerativeAI(process.env.VERTEX_AI_API_KEY || "");
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3-flash-preview", 
            generationConfig: { responseMimeType: "application/json" } 
        });

        const prompt = `You are an elite geographic OSINT AI acting as an intelligence seeder for a South African municipal platform. 
The user engaged an unseeded region: ${municipality}.
You must synthesize a massive JSON array of exactly 15 rigorous demographic ward profiles (Wards 1 through 15) so they can be permanently saved to the database.

CRITICAL: Never return "Standard municipal aggregation zone" or "Baseline Local". You must hyper-realistically vary the cultural heritage, primary languages, political allegiances (ANC, DA, EFF, IFP, etc.), crime threat profiles (e.g. Copper theft, Construction Mafia, Gang violence), and unemployment severity across each ward reflecting the stark socio-economic divides of ${municipality}.

The output MUST be a strict JSON array of 15 objects following this explicit schema:
[
  {
    "wardId": "${municipality.replace(/ /g, "_")}_Ward_X",
    "municipality": "${municipality}",
    "wardNumber": X,
    "mapParameters": {
      "centerLat": ${baseLat} +/- small random variation,
      "centerLng": ${baseLng} +/- small random variation,
      "radiusMeters": 3500,
      "boundaryType": "Urban Grid"
    },
    "demographics": {
      "populationDensity": "High / Medium / Low",
      "primaryLanguage": "isiZulu / English / etc",
      "secondaryLanguage": "...",
      "medianAge": 28
    },
    "culture": {
      "heritageProfile": "Deep local demographic breakdown...",
      "communityStructures": "e.g. Traditional governance, aggressive civic forums, religious blocks"
    },
    "voting": {
      "dominantParty": "...",
      "voterTurnoutPercent": 55.4,
      "politicalVolatility": "Stable / Contested / Volatile"
    },
    "weather": {
      "climateBaseline": "Subtropical / Semi-arid / etc",
      "primaryClimateRisk": "Flash Flooding / Substation Heat Damage / etc"
    },
    "crime": {
      "safetyIndex": 45,
      "primarySyndicateOrThreat": "..."
    },
    "socioEconomicStats": {
      "unemploymentPercent": 34.2,
      "medianIncomeBracket": "Low Income / Lower-Middle / etc",
      "primaryEconomicDriver": "Logistics / Informal Trading / Tourism / Services"
    }
  }
]
`;
        console.log(`[Ward Intelligence] Firing live Gemini 3 Flash Auto-Seeding for ${municipality} (15 Wards)`);
        const result = await model.generateContent(prompt);
        const dataText = result.response.text();
        const syntheticWards = JSON.parse(dataText);

        // Await full persistence matrix to Firestore
        const batchPromises = syntheticWards.map((w: any) => {
            const docId = `${municipality.replace(/ /g, "_")}_Ward_${w.wardNumber}`;
            w.wardId = docId;
            return setDoc(doc(db, "wardIntelligence", docId), { ...w, lastUpdated: new Date().toISOString() });
        });
        await Promise.all(batchPromises);
        console.log(`[Ward Intelligence] Successfully seeded ${syntheticWards.length} AI-generated wards to Firestore.`);

        // Append explicit display names for immediate frontend render
        const mappedWards = syntheticWards.map((data: any) => {
            const key = `${data.municipality}_${data.wardNumber}`;
            data.wardName = WARD_NOMS[key] || `Ward ${data.wardNumber}`;
            return data;
        });

        return NextResponse.json({ success: true, wards: mappedWards });

      } catch (geminiError) {
         console.warn("[Ward Intelligence] Gemini Auto-Seeding failed. Escalating to static topological fallback array.", geminiError);
         
         const syntheticWards = Array.from({ length: 15 }).map((_, i) => {
            const wNum = i + 1;
            const sLat = baseLat + (Math.sin(wNum) * 0.15);
            const sLng = baseLng + (Math.cos(wNum) * 0.15);
            
            return {
                wardId: `${municipality}_Ward_${wNum}`,
                municipality,
                wardNumber: wNum,
                wardName: `Ward ${wNum} Sector Zone`,
                mapParameters: {
                  centerLat: sLat,
                  centerLng: sLng,
                  radiusMeters: 4000 + (wNum * 100),
                  boundaryType: "Administrative Approximation"
                },
                demographics: {
                  populationDensity: "Medium",
                  primaryLanguage: "Baseline Local",
                  medianAge: 32
                },
                culture: {
                  heritageProfile: "Standard municipal aggregation zone",
                  communityStructures: "Baseline civic footprint"
                },
                voting: {
                  dominantParty: "Contested",
                  voterTurnoutPercent: 55.0,
                  politicalVolatility: "Stable"
                },
                weather: {
                  climateBaseline: "Regional standard",
                  primaryClimateRisk: "Severe Thunderstorms and Grid Vulnerability"
                },
                crime: {
                  safetyIndex: 50,
                  primarySyndicateOrThreat: "Petty theft and Vandalism"
                },
                socioEconomicStats: {
                  unemploymentPercent: 32.0,
                  medianIncomeBracket: "Lower-Middle",
                  primaryEconomicDriver: "Logistics, Retail & Industrial"
                }
            };
          });
          return NextResponse.json({ success: true, wards: syntheticWards });
      }
    }

    const wards = snapshot.docs.map(doc => {
      const data = doc.data();
      const key = `${data.municipality}_${data.wardNumber}`;
      data.wardName = WARD_NOMS[key] || `Ward ${data.wardNumber}`;
      return data;
    });

    // Provide ascending chronological sort
    wards.sort((a, b) => (a.wardNumber || 0) - (b.wardNumber || 0));
    
    return NextResponse.json({ success: true, wards });

  } catch (error) {
    console.error("Ward Intelligence GET error:", error);
    return NextResponse.json({ error: "Failed to fetch deep ward intelligence" }, { status: 500 });
  }
}
