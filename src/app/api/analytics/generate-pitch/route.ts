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
    const { province, municipality, serviceDomain, ward, projectType } = await req.json();

    const targetScope = `Region: ${province || "South Africa"}, Municipality: ${municipality || "All"}, Ward: ${ward || "All"}, Service Domain: ${serviceDomain || "Infrastructure"}, Project Type: ${projectType || "All"}`;
    const searchQuery = `"${province || "South Africa"}" "${municipality || ""}" ${ward || ""} ${projectType || serviceDomain || "infrastructure"} investment readiness socioeconomic gaps community demands infrastructure pitch`;

    const searchRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: searchQuery,
        search_depth: "advanced",
        max_results: 12,
        days: 180
      }),
    });

    if (!searchRes.ok) {
        throw new Error("Tavily OSINT Pitch Search Failed");
    }

    const searchData = await searchRes.json();
    const osintContext = (searchData.results || []).map((a: any) => `Title: ${a.title}\nContent: ${a.content}`).join("\n\n---\n\n");

    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        readinessScore: z.number().min(1).max(100).describe("A 1-100 score indicating how structurally prepared this municipality is for foreign or private capital right now."),
        investmentCase: z.string().describe("A massive, extremely persuasive 3-paragraph executive pitch on exactly 'Why Invest Here?'. Highlight local strengths, verified ground-truth opportunities, and why capital will yield high ROI here. NO MARKDOWN."),
        esgImpact: z.array(z.object({
          pillar: z.string().describe("e.g. 'Social Amplification' or 'Environmental Resilience'"),
          projection: z.string().describe("A deeply analytical 2-sentence breakdown of exactly what will happen to the community if capital is deployed here.")
        })).min(3).max(4),
        criticalGaps: z.array(z.string()).min(3).max(5).describe("List 3-5 brutally honest hurdles or structural gaps that must be mitigated by the investor or government to ensure project success. 2 sentences each. NO MARKDOWN.")
      }),
      prompt: `You are the Lead Investment Pitch Architect for the South African Government targeting the scope: ${targetScope}.
      
      Read the following live infrastructure investment OSINT data.
      You must synthesize a highly persuasive, institutionally rigorous "Pitch Pack" designed to be handed directly to multinational DFIs and Private Equity partners.
      
      DO NOT USE ANY MARKDOWN ASTERISKS (** or *) anywhere in the output strings. Keep the text pure, sophisticated, and visionary.
      
      INVESTMENT CONTEXT:
      ${osintContext}
      `
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Pitch Pack Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
