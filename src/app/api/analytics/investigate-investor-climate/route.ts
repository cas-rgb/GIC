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
    const { province, municipality, serviceDomain, ward, projectType, investorName } = await req.json();

    const targetScope = `Investor: ${investorName}, Region: ${province || "South Africa"}, Municipality: ${municipality || "All"}, Ward: ${ward || "All"}, Project Type: ${projectType || serviceDomain || "Infrastructure"}`;
    const searchQuery = `"${investorName}" investment mandate strategy policy ${province || "South Africa"} ${municipality || ""} ${projectType || serviceDomain || "infrastructure"}`;

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
        throw new Error("Tavily OSINT Investor Climate Extraction Failed");
    }

    const searchData = await searchRes.json();
    const osintContext = (searchData.results || []).map((a: any) => `Title: ${a.title}\nContent: ${a.content}`).join("\n\n---\n\n");

    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        mandateCheck: z.string().describe("A devastatingly detailed 2-paragraph analysis of this investor's actual ground-truth funding mandate right now in this specific scope. Are they actually funding this? What are their strict requirements?"),
        sentimentScore: z.number().min(1).max(100).describe("1-100 score indicating their favorable sentiment toward deploying capital in this target right now."),
        recentActivity: z.array(z.string()).min(2).max(4).describe("List 2-4 verified recent actions, statements, or closed deals by this investor in this sector.")
      }),
      prompt: `You are a Senior Political Risk & Capital Analyst for the South African Government interrogating the following target: ${targetScope}.
      
      Read the following live OSINT data.
      You must build an absolute, hyper-accurate "Investor Climate Interrogation".
      We need to know explicitly whether this investor actually has the mandate and the appetite to fund this specific type of project in this specific geographic node right now.
      
      DO NOT USE ANY MARKDOWN ASTERISKS (** or *) anywhere in the output strings. Keep the text pure, sophisticated, and heavily institutional.
      
      OSINT CONTEXT:
      ${osintContext}
      `
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Investor Climate Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
