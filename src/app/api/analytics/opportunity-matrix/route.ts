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
    const searchQuery = `"${province || "South Africa"}" "${municipality || ""}" ${ward || ""} ${projectType || serviceDomain || "infrastructure"} economic potential high impact underserved areas business activity ROI`;

    const searchRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: searchQuery,
        search_depth: "advanced",
        max_results: 15,
        days: 180
      }),
    });

    if (!searchRes.ok) {
        throw new Error("Tavily OSINT Matrix Extraction Failed");
    }

    const searchData = await searchRes.json();
    const osintContext = (searchData.results || []).map((a: any) => `Title: ${a.title}\nContent: ${a.content}`).join("\n\n---\n\n");

    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        quadrantAnalysis: z.string().describe("2-paragraph overview of where the highest concentration of Social Impact vs Economic ROI currently sits in this region. NO MARKDOWN."),
        matrixNodes: z.array(z.object({
           zoneName: z.string().describe("Specific community, ward, or business node. e.g. 'Diepsloot Phase 2'"),
           socialNeedScore: z.number().min(1).max(100).describe("1-100 indicating socio-economic desperation/need. Higher means more need."),
           economicRoiScore: z.number().min(1).max(100).describe("1-100 indicating pure commercial bankability and expected ROI."),
           strategicProfile: z.string().describe("2-sentence explanation of why this zone sits at these exact coordinates."),
           unlockedBy: z.string().describe("e.g. 'Unlocking Bulk Sanitation limits'")
        })).min(4).max(6)
      }),
      prompt: `You are a Geospatial Economic Analyst for the South African Government mapping: ${targetScope}.
      
      Read the following live OSINT data.
      You must build an "Opportunity Matrix" plotting 4-6 specific local zones or projects based on their absolute Social Need (Y-Axis) versus Economic ROI (X-Axis).
      Provide highly specific, ground-truth locations and devastatingly accurate assessments of their commercial vs social viability.
      
      DO NOT USE ANY MARKDOWN ASTERISKS (** or *) anywhere in the output strings. Keep the text pure.
      
      OSINT CONTEXT:
      ${osintContext}
      `
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Matrix Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
