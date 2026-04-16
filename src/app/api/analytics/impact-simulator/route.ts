import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.VERTEX_AI_API_KEY || process.env.GEMINI_API_KEY || "dummy"
});

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { province, simulationPrompt } = await req.json();

    const targetScope = `Region: ${province || "South Africa"}. User Hypothesis: "${simulationPrompt}"`;
    const searchQuery = `impact of ${simulationPrompt} infrastructure case study similar project research GIC`;

    let searchData: any = { results: [] };
    let evidenceLinks: any[] = [];
    
    // Attempt Tavily OSINT Search
    const searchRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: searchQuery,
        search_depth: "basic",
        max_results: 5
      }),
    });

    if (!searchRes.ok) {
       throw new Error(`Tavily OSINT Search Failed: ${searchRes.statusText}`);
    }

    searchData = await searchRes.json();
    evidenceLinks = (searchData.results || []).slice(0, 3).map((a: any) => ({
      title: a.title,
      content: a.content.length > 200 ? a.content.substring(0, 200) + "..." : a.content,
      url: a.url
    }));

    const osintContext = (searchData.results || []).map((a: any) => `Title: ${a.title}\nContent: ${a.content}`).join("\n\n---\n\n");

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"), // Bypassing 1.5 which is unrecognized in your specific SDK version, using the flash variant of 2.5 for massive concurrency capacity
      maxRetries: 5, // Increased from the default 2 retries to 5 retries with exponential backoff
      schema: z.object({
        executiveSummary: z.string().describe("A 2-sentence prediction of the macro outcome of this exact capital injection hypothesis."),
        timeline: z.array(z.object({
           horizon: z.string().describe("e.g. 'Year 1: Groundbreak', 'Year 3: Stabilization', 'Year 5: Maturity'"),
           eventPrediction: z.string().describe("Specific milestone or structural shift that occurs at this phase."),
           sentimentScore: z.number().describe("Public sentiment score as an integer (0-100) at this phase.")
        })).describe("An array of 3 to 5 timeline events representing the project trajectory."),
        macroMetrics: z.array(z.object({
           label: z.string().describe("e.g. 'Direct Jobs Created' or 'Regional GDP Bump'"),
           projectedValue: z.string().describe("Quantifiable estimated value based on similar historical injections. e.g. '+4,500' or 'R1.2Bn'")
        })).describe("An array of 3 to 4 macro economic metrics.")
      }),
      prompt: `You are an Elite Economic Modeler for the South African Government analyzing the scope: ${targetScope}.
      
      Read the OSINT context regarding similar infrastructure injections. Simulate the 5-year downstream impact if the user's hypothetical investment (${simulationPrompt}) is executed perfectly.
      Generate a devastatingly realistic timeline of events, tracing how public sentiment evolves from skepticism to adoption, and projecting massive macro-economic shifts.
      
      DO NOT USE ANY MARKDOWN ASTERISKS (** or *) anywhere. Keep it highly institutional.
      
      CONTEXT:
      ${osintContext}
      `
    });

    return NextResponse.json({
      ...object,
      evidence: evidenceLinks
    });
  } catch (error: any) {
    console.error("Simulation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
