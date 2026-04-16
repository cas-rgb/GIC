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
    const { province, municipality, serviceDomain, targetAudience, ward, projectType } = await req.json();

    const targetScope = `Region: ${province || "South Africa"}, Municipality: ${municipality || "All"}, Ward: ${ward || "All"}, Service Domain: ${serviceDomain || "Infrastructure"}, Project Type: ${projectType || "All"}, Target Audience: ${targetAudience || "Any"}`;
    const searchQuery = `"${province || "South Africa"}" infrastructure investment "dfi" OR "ngo" OR "private equity" active funders ${projectType || serviceDomain || "projects"} ${ward || ""} ${municipality || ""}`;

    const searchRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: searchQuery,
        search_depth: "advanced",
        max_results: 15,
        days: 90
      }),
    });

    if (!searchRes.ok) {
        throw new Error("Tavily OSINT Search Failed");
    }

    const searchData = await searchRes.json();
    const osintContext = (searchData.results || []).map((a: any) => `Title: ${a.title}\nContent: ${a.content}`).join("\n\n---\n\n");

    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        matches: z.array(z.object({
          investorName: z.string().describe("Name of the DFI, NGO, or PE firm."),
          investorType: z.string().describe("e.g. 'Development Finance Institution' or 'Private Equity'"),
          matchScore: z.number().min(1).max(100).describe("1-100 Alliance Target Score based on recent operational overlap."),
          alignmentRationale: z.string().describe("A devastatingly detailed 2-sentence rationale outlining why this investor is the highest probability match for this region/sector based on recent actions."),
          capitalThreshold: z.string().describe("e.g. 'Over R500M'"),
          lastKnownActivity: z.string().describe("Recent project or fund they closed.")
        })).min(3).max(5),
        marketSentiment: z.string().describe("A 3-sentence macro summary of the overall lending/funding environment toward this exact municipality/sector right now.")
      }),
      prompt: `You are an elite Investment Strategist for the South African Government targeting the scope: ${targetScope}.
      
      Read the following live infrastructure investment OSINT data retrieved strictly from the last 90 days.
      Identify the absolute best "Investor to Project Matches" based on genuine recent web activity. Provide real organizations who are actively looking to fund these exact kinds of projects in this region.
      
      DO NOT USE ANY MARKDOWN ASTERISKS (** or *) anywhere in the output strings. Keep the text pure, aggressive, and highly institutional.
      
      INVESTMENT CONTEXT:
      ${osintContext}
      `
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Matchmaker Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
