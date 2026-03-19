import { NextResponse } from "next/server";
import { searchCommunityData } from "@/services/tavily-service";
import { geminiPro, extractJsonArray } from "@/services/ai-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const province = searchParams.get("province") || "Gauteng";
  const municipality = searchParams.get("municipality") || "All Municipalities";
  const ward = searchParams.get("ward") || "All Wards";

  const locationTarget = municipality !== "All Municipalities" ? `${municipality}, ${province}` : province;
  const specificLoc = ward && ward !== "All Wards" ? `${ward}, ${locationTarget}` : locationTarget;

  try {
    const searchQuery = `Find current political leaders, powerful business forum figures, outspoken community activists, civil society, municipal managers, and union influencers active in ${specificLoc}, South Africa. Identify who holds power and why explicitly. Find their current agendas or grievances.`;
    
    const tavilyResults = await searchCommunityData(searchQuery);
    
    if (!tavilyResults || !tavilyResults.results) {
      throw new Error("Tavily API returned null context.");
    }
    
    const searchContext = tavilyResults.results.map((r: any) => `${r.title}\n${r.content}`).join("\n\n");

    const prompt = `
      You are an elite political and social intelligence analyst for the South African government.
      Analyze the following live web search results regarding key influencers and power brokers in ${specificLoc}.
      
      SEARCH CONTEXT:
      ${searchContext}

      Create a structured JSON array of 3 to 6 highly relevant local influencers (politicians, business forums, union leaders, chiefs, or activists).
      
      You MUST strictly return ONLY a JSON array matching this exact TypeScript interface:
      [{
        "name": "Exact Name of Person or Group",
        "platform": "Political Party, Union, Business Forum, or Civic Group",
        "focus": "Brief role (e.g. 'Local Ward Councillor', 'Business Forum Leader', 'Municipal Manager')",
        "impact": "A number between 50 and 99 reflecting their leverage/power",
        "why": "A 2-sentence explanation of EXACTLY why they hold influence, what their current leverage is, and what they are demanding or doing in ${municipality}."
      }]
      
      Only output valid JSON format. Do not use block quote markers outside of the array.
      Synthesize the reality on the ground accurately using the context. If context is sparse, deduce the most statistically likely power players for that municipality (e.g., the Mayor, Regional ANC/DA/EFF chairs, SANCO representatives).
    `;

    const aiResponse = await geminiPro.generateContent(prompt);
    const parsedText = aiResponse.response.text();
    const influencers = extractJsonArray(parsedText);

    if (!influencers || influencers.length === 0) {
      // Fallback mock if completely blocked
      return NextResponse.json({
        influencers: [{
          name: "Local Civic Coalitions (Data Unavailable)",
          platform: "Civic Society",
          focus: "Resident Associations",
          impact: 75,
          why: "Due to a lack of immediate live OSINT data, assume local rate-payer associations and ward councillors hold primary baseline leverage regarding service delivery."
        }]
      });
    }

    return NextResponse.json({ influencers });

  } catch (error) {
    console.error("Influencer OSINT Pipeline Error:", error);
    return NextResponse.json({
      influencers: [{
        name: "OSINT Pipeline Temporarily Disconnected",
        platform: "System",
        focus: "Intelligence Gateway",
        impact: 0,
        why: "Tavily/Gemini connection failed to resolve the local power structure."
      }]
    }, { status: 500 });
  }
}
