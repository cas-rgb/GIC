import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.VERTEX_AI_API_KEY || process.env.GEMINI_API_KEY
});

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { province, municipality, serviceDomain } = await req.json();

    const targetScope = `Region: ${province || "South Africa"}, Municipality: ${municipality || "All"}, Service Domain: ${serviceDomain || "Infrastructure"}`;

    const searchQuery = `"${province || "South Africa"}" infrastructure investment funding projects poor communities development capital allocation`;

    const searchRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: searchQuery,
        search_depth: "advanced",
        max_results: 15,
        days: 30
      }),
    });

    if (!searchRes.ok) {
        throw new Error("Tavily Infrastructure API Failure");
    }

    const searchData = await searchRes.json();
    const osintContext = (searchData.results || []).map((a: any) => `Title: ${a.title}\nContent: ${a.content}`).join("\n\n---\n\n");

    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        landscapeSummary: z.string().describe("A 3-paragraph executive summary detailing the macro capital inflows, who is currently dominating the investment landscape, and why. NO MARKDOWN."),
        activeInvestors: z.array(z.object({
          investorName: z.string(),
          strategicFocus: z.string().describe("What they are looking for (e.g. 'Seeking shovel-ready water sanitation projects')"),
          capitalVelocity: z.string().describe("e.g. 'R500M Deployed Quarterly'"),
          activeOperations: z.string().describe("Exactly what they are doing in the specified province, municipality, and ward level.")
        })).min(3).max(4),
        impoverishedTargets: z.array(z.object({
           communityName: z.string(),
           criticalDeficit: z.string().describe("Exactly what they are missing (e.g. 'No bulk water infrastructure since 2014')"),
           requiredCapital: z.string().describe("Estimated capital required (e.g. 'R1.2 Billion')"),
           strategicInvestmentRationale: z.string().describe("Why an investor MUST be involved here from an ESG or strategic standpoint.")
        })).min(3).max(4),
        projectsSeekingFunding: z.array(z.object({
           projectName: z.string(),
           promoter: z.string().describe("The municipality or agency pitching it"),
           investmentType: z.string().describe("e.g. 'Public-Private Partnership (PPP)'"),
           whyGetInvolved: z.string().describe("A brutal factual reason why this project is viable and lucrative.")
        })).min(3).max(4)
      }),
      prompt: `You are an elite Investment Strategist for the South African Government targeting the scope: ${targetScope}.
      
      Read the following live infrastructure investment OSINT data retrieved strictly from the last 30 days.
      Synthesize a highly detailed, extremely institutional "Investor Landscape Profiling" report. 
      Focus heavily on what investors are active, what they are doing at a granular ward/municipality level, and which impoverished communities are the ideal targets for high-impact capital intervention.
      
      DO NOT USE ANY MARKDOWN ASTERISKS (** or *) anywhere in the output strings. Keep the text pure.
      Write with extreme gravitas, using terms like 'capital velocity', 'syndication', 'structural deficiencies', and 'strategic rationale'.
      
      INVESTMENT CONTEXT:
      ${osintContext}
      `
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Landscape Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
