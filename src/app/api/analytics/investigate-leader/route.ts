import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.VERTEX_AI_API_KEY || process.env.GEMINI_API_KEY
});
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60; // Allow Vercel to run this AI job
export const dynamic = "force-dynamic";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export async function POST(req: Request) {
  try {
    const { leaderName, province } = await req.json();

    if (!leaderName) {
      return NextResponse.json({ error: "Missing leaderName" }, { status: 400 });
    }

    // 1. Scraping Live Data
    const searchRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `"${leaderName}" ${province || "South Africa"} politics recent news controversy public statements actions`,
        search_depth: "advanced",
        include_answers: false,
        include_raw_content: false,
        max_results: 12,
      }),
    });

    if (!searchRes.ok) {
        throw new Error("Tavily API Failure");
    }

    const searchData = await searchRes.json();
    const articles = searchData.results || [];
    const contextText = articles.map((a: any) => `Source: ${a.url}\nTitle: ${a.title}\nContent: ${a.content}`).join("\n\n---\n\n");

    // 2. Synthesize Deep Report
    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        netTrustScore: z.number().describe("Score from -100 to 100 based on recent press sentiment"),
        prPressureVolume: z.number().describe("Estimated total public/media mentions currently active"),
        scoreCalculationBreakdown: z.string().describe("A granular breakdown of exactly how the netTrustScore and prPressureVolume were derived. Explain the mathematical or thematic weighting based on recent sources."),
        coreKineticRiskVector: z.string().describe("The biggest current threat, crisis, or challenge facing the leader (2-4 words)"),
        strategicSummary: z.string().describe("A massive, highly detailed 3-paragraph executive summary focusing hyper-specifically on *THIS LEADER'S* recent actions, statements, scandals, and public perception. DO NOT write about general provincial issues unless directly caused by or linked to this leader. You MUST cite sources (e.g., 'Source: URL') directly in the text."),
        temporalAnalysis: z.object({
          last30DaysActivity: z.string().describe("Highly specific analysis of THIS LEADER'S actions and controversies within the last 30 days. If exact dates are missing, infer recent vs old. DO NOT return 'insufficient data' fallbacks. Force an analysis."),
          historicIssues: z.string().describe("Analysis of THIS LEADER'S long-standing baggage and legacy issues. DO NOT return 'insufficient data' fallbacks.")
        }).describe("A temporal breakdown of perception: Last 30 days vs 30+ days historic momentum"),
        infrastructureOpportunities: z.array(z.object({
          projectFocus: z.string().describe("e.g. 'Bulk Water Upgrades in Township X' or 'Pothole eradication on Route Y'"),
          prBenefit: z.string().describe("Exactly how championing this will immediately shift public sentiment and re-build political capital"),
          urgency: z.enum(["High", "Medium", "Low"])
        })).min(2).max(4).describe("2-4 specific infrastructure projects or service delivery initiatives this leader MUST champion immediately to fix their public image."),
        recentDevelopments: z.array(z.object({
          headline: z.string(),
          impact: z.string().describe("1 sentence detailing institutional impact"),
          sentiment: z.enum(["positive", "negative", "neutral"])
        })).describe("Top 3-4 actual developments extracted from the sources"),
        mediaLinks: z.array(z.object({
          title: z.string(),
          url: z.string(),
          source: z.string()
        })).describe("5 valid articles linked as sources for this dossier")
      }),
      prompt: `You are a GIC Intelligence Analyst compiling a massive, highly detailed dossier on the South African leader/politician: ${leaderName} (${province || "South Africa"}).
      
      CRITICAL INSTRUCTION: You must forcefully constrain your analysis entirely to the targeted leader (${leaderName}). Do NOT write generalized blurbs about "systemic failures in ${province}" or "general economic despair" unless you are explicitly detailing how the targeted leader is personally responsible for, or publicly responding to, those failures.
      Your insights must be hyper-recent and deeply grounded in how citizens feel about *THIS SPECIFIC LEADER* right now.
      You MUST provide a strategic temporal analysis comparing the last 30 days tightly against long-standing historic issues (30+ days). If sources lack timestamps, infer the timeframe based on context, but absolutely DO NOT return fallback "insufficient data" strings. Produce an analytical deduction.
      You MUST provide a clear explanation/breakdown of how the 'netTrustScore' and 'prPressureVolume' metrics were formed/calculated based on the provided data.
      You MUST refer to specific sources explicitly within your text (e.g., "According to [URL]...") to ensure the report is verifiably grounded.
      Additionally, you MUST provide a strategic 'Infrastructure Opportunities' section detailing exactly what *THIS LEADER* should champion directly to boost their personal image.
      
      Read the following live OSINT data retrieved today, and synthesize a comprehensive intelligence report. Do not hallucinate URLs! Only use the URLs explicitly provided in the source text. Do not generate generic slop—provide deep, specific, actionable insights based EXCLUSIVELY on the text.
      
      OSINT DATA:
      ${contextText}
      `
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Investigation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
