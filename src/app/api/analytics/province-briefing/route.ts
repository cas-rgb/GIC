import { NextResponse, NextRequest } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.VERTEX_AI_API_KEY || process.env.GEMINI_API_KEY
});

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const province = searchParams.get("province");

  if (!province) {
    return NextResponse.json({ error: "Province parameter is required" }, { status: 400 });
  }

  try {
    const targetRegion = province !== "All Provinces" ? province : "South Africa";

    // Grab 7 days of live intel regarding the local provincial infrastructure, politics, and service delivery
    const searchRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `"${targetRegion}" South Africa premier executive council politics local government infrastructure service delivery crisis issues news`,
        search_depth: "advanced", 
        max_results: 15, 
        days: 7
      }),
    });

    if (!searchRes.ok) {
        throw new Error("Tavily OSINT API Failed during extraction.");
    }
    
    const searchData = await searchRes.json();
    const osintContext = (searchData.results || []).map((a: any) => `Title: ${a.title}\nContent: ${a.content}`).join("\n\n---\n\n");

    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        alignments: z.string().describe("A deeply analytical 2-sentence breakdown of the current stability and friction points within the ruling party or coalition. Do NOT use markdown asterisks. Use a highly institutional, strategic tone."),
        primaryLeader: z.string().describe("The name and title of the presiding leader or Premier. E.g. 'Premier Panyaza Lesufi'. No markdown."),
        blindspots: z.array(z.string()).min(3).max(4).describe("3-4 highly detailed, 2-sentence strategic blindspots the government structure is facing. Describe the exact failure, the location, and the consequence. No markdown."),
        citizenPriorities: z.array(z.string()).min(3).max(4).describe("3-4 highly detailed, 2-sentence infrastructure or service delivery grievances currently affecting communities. Name specific projects or communities. No markdown."),
        status: z.string().describe("E.g. 'Critical Monitoring', 'Heightened Scrutiny', 'Baseline Stability', 'Systemic Failure Warning'. No markdown."),
        atRiskExecutives: z.array(z.object({ 
            name: z.string().describe("Name and title of the executive or department head. No markdown."), 
            reason: z.string().describe("A devastatingly detailed 2-sentence intelligence briefing on exactly why their portfolio is failing and what specific project or tender they bungled. No markdown.") 
        })).min(2).max(3).describe("Specific political figures or officials under fire."),
        upcomingFlashpoints: z.array(z.string()).min(3).max(4).describe("3-4 highly detailed, 2-sentence intelligence reports on impending protests, strikes, or crises related to current events. No markdown.")
      }),
      prompt: `You are a Tier-1 Intelligence Analyst for the South African Government.
      
      Read the following live OSINT data retrieved strictly from the last 7 days regarding the executive leadership, infrastructure, and socio-political stability of: ${targetRegion}.
      
      CRITICAL INSTRUCTION: Your output must NOT be "generic, boring, or brief." You must provide extremely detailed, deeply analytical, and highly dramatic intelligence-grade paragraphs. Write in the exact tone of a high-stakes government intelligence briefing (e.g., use phrases like 'structural contradictions', 'bifurcated narratives', 'cascading infrastructure failures'). 
      Do not invent scenarios; focus strictly on genuine events from the search context, but explain them with ruthless strategic depth. Every array item MUST be at least 2 full, complex sentences.
      
      DO NOT USE ANY MARKDOWN ASTERISKS (** or *) anywhere in the output strings. Keep the text pure.
      
      OSINT DATA:
      ${osintContext}
      `
    });

    return NextResponse.json(object);
     
  } catch (error) {
    console.error("[ProvinceBriefingError] Failed to generate strategic intelligence:", error);
    return NextResponse.json({ error: "Failed to generate dynamic intelligence." }, { status: 500 });
  }
}
