import { NextResponse, NextRequest } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.VERTEX_AI_API_KEY || process.env.GEMINI_API_KEY
});
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60; // Allow 1 minute for Just-In-Time OSINT Scraping on free/pro tier
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const municipality = searchParams.get("municipality");

  if (!municipality || municipality === "All Municipalities") {
    // Return empty wards array if no specific municipality is selected
    return NextResponse.json({ wards: [] });
  }

  try {
    // 1. Ask the LLM to synthesize the real wards and ethnographic data for the municipality
    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        wards: z.array(z.object({
          wardNumber: z.string().describe("e.g. '12', '45' or a specific area identifier"),
          wardName: z.string().describe("The actual real-world name of this town, suburb, or township within the municipality (e.g. 'Mbekweni', 'Soweto', 'Atteridgeville')"),
          mapParameters: z.object({
            centerLat: z.number().describe("Approximate latitude, e.g. -33.7 for Paarl"),
            centerLng: z.number().describe("Approximate longitude, e.g. 18.9 for Paarl")
          }),
          demographics: z.object({
            primaryLanguage: z.string(),
            populationDensity: z.string().describe("e.g. 'High Urban Density', 'Peri-Urban', 'Rural'")
          }),
          culture: z.object({
            heritageProfile: z.string().describe("1 sentence describing historical or cultural significance"),
            communityStructures: z.string().describe("e.g. 'Strong civic structures', 'Volatile youth leagues'")
          }),
          voting: z.object({
            dominantParty: z.string().describe("e.g. 'ANC', 'DA', 'EFF', 'PA'"),
            politicalVolatility: z.string().describe("e.g. 'Stable', 'Highly Contested', 'Shifting'"),
            voterTurnoutPercent: z.number().min(0).max(100)
          }),
          socioEconomicStats: z.object({
            primaryEconomicDriver: z.string().describe("e.g. 'Agriculture', 'Informal Trading', 'Manufacturing'"),
            medianIncomeBracket: z.string().describe("e.g. 'Low Income', 'Lower-Middle', 'Affluent'"),
            unemploymentPercent: z.number().min(0).max(100)
          }),
          crime: z.object({
            safetyIndex: z.number().min(0).max(100).describe("0 = Extremely Dangerous, 100 = Extremely Safe"),
            primarySyndicateOrThreat: z.string().describe("e.g. 'Extortion syndicates', 'Copper theft', 'Gang violence'")
          }),
          incidentCount: z.number().describe("Estimated open service delivery or political incidents"),
          primaryIssue: z.string().describe("The biggest current infrastructure or social crisis (e.g. 'Water Shedding', 'Potholes', 'Housing')"),
          severity: z.enum(["critical", "high", "moderate", "low"])
        })).min(4).max(6).describe("Generate 4 to 6 of the most prominent, real-world wards/townships in this specific municipality")
      }),
      prompt: `You are a South African Tier-1 Intelligence Ethnographer and Spatial Analyst.
      We need live, highly accurate ward-level granular intelligence for the following South African Municipality: ${municipality}.
      
      Using your deep pre-trained knowledge of South African geography, politics, and socio-economics, identify 4 to 6 of the most critical or well-known actual suburbs, towns, or townships within this municipality.
      You MUST provide real names, real political dynamics (dominant parties per the last elections), realistic crime vectors, and the most pressing structural issues (service delivery crises) facing those specific areas.
      
      DO NOT HALLUCINATE MUNICIPALITIES. If I say "Drakenstein", you focus on Paarl, Wellington, Mbekweni, Gouda, Saron, etc. 
      If I say "Tshwane", focus on Mamelodi, Soshanguve, Centurion, Pretoria East, etc.
      
      Output strictly in accordance with the provided JSON schema. No Markdown. No filler.`
    });

    // Map municipality across all generating wards to ensure consistency
    const formattedWards = object.wards.map(w => ({
      ...w,
      municipality: municipality
    }));

    return NextResponse.json({ wards: formattedWards });

  } catch (error: any) {
    console.error("Ward Intelligence LLM Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
