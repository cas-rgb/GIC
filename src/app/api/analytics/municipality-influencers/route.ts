import { NextResponse } from "next/server";
import { searchCommunityData } from "@/services/tavily-service";
import { geminiPro, extractJsonArray } from "@/services/ai-service";
import { validateRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous_ip";
  const rateLimit = validateRateLimit(ip, 12, 60000); // 12 requests per minute due to high Tavily costs
  if (!rateLimit.success) {
    return NextResponse.json({ error: rateLimit.message }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const province = searchParams.get("province") || "Gauteng";
  const municipality = searchParams.get("municipality") || "All Municipalities";
  const ward = searchParams.get("ward") || "All Wards";
  const serviceDomain = searchParams.get("serviceDomain") || "all";

  const locationTarget = municipality !== "All Municipalities" ? `${municipality}, ${province}` : province;
  const specificLoc = ward && ward !== "All Wards" ? `${ward}, ${locationTarget}` : locationTarget;
  const domainContext = serviceDomain !== "all" ? ` Focus exclusively on influencers, corruption vectors, and activists operating within the ${serviceDomain} sector.` : "";

  try {
    const searchQuery = `Find current political leaders, powerful business forum figures, outspoken community activists, civil society, municipal managers, and union influencers active in ${specificLoc}, South Africa.${domainContext} Identify who holds power and why explicitly. Find their current agendas or grievances.`;
    
    const tavilyResults = await searchCommunityData(searchQuery);
    
    if (!tavilyResults || !tavilyResults.results || tavilyResults.results.length === 0) {
      // LEVEL 2/3 FALLBACK: Roll up to Municipality/Province and use Tier 1 Predictive Inference
      const rollupTarget = ward && ward !== "All Wards" ? municipality : province;
      
      console.warn(`No OSINT for ${specificLoc}. Rolling up to baseline inference for ${rollupTarget}`);
      
      const fallbackPrompt = `
        You are an elite political analyst for South Africa.
        Live social data for "${specificLoc}" is currently barren.
        Instead, perform a structural baseline assessment for the parent region: ${rollupTarget}.
        Determine 3 highly statistical baseline influencers based on historical Tier 1 context (e.g. The Regional Mayor, The leading opposition chairperson, or a prominent Ratepayers Association).${domainContext}
        
        Return ONLY a JSON array matching this exact interface:
        [{
          "name": "Exact Name of Title/Person",
          "platform": "Political Party or Civic Group",
          "focus": "Baseline Structural Role",
          "impact": "75",
          "why": "A 2-sentence explanation of why they hold structural baseline power here."
        }]
      `;
      
      const fallbackResponse = await geminiPro.generateContent(fallbackPrompt);
      const fallbackText = fallbackResponse.response.text();
      const fallbackInfluencers = extractJsonArray(fallbackText);

      return NextResponse.json({ 
        influencers: fallbackInfluencers || [{
          name: "Regional Civic Coalitions (Static Inference)",
          platform: "Civic Society",
          focus: "Resident Associations",
          impact: 75,
          why: `Due to a persistent lack of live data for ${specificLoc}, baseline models assume local ratepayers and regional party chairs hold primary leverage.`
        }]
      });
    }
    
    const searchContext = tavilyResults.results.map((r: any) => `${r.title}\n${r.content}`).join("\n\n");

    const prompt = `
      You are an elite political and social intelligence analyst for the South African government.
      Analyze the following live web search results regarding key influencers and power brokers in ${specificLoc}.${domainContext}
      
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
      throw new Error("Invalid AI Synthesis resulting in empty array.");
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
