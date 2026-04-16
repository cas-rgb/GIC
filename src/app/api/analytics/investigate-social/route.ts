import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.VERTEX_AI_API_KEY || process.env.GEMINI_API_KEY
});
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60; 
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { province, municipality, timeframe } = await req.json();

    const regionStr = [
      province !== "All Provinces" && province ? province : "South Africa",
      municipality !== "All Municipalities" && municipality ? municipality : ""
    ].filter(Boolean).join(" ");

    const targetRegion = regionStr || "South Africa";
    
    // Aggressive Time Filter: Default to 7 days if not provided
    const isGeneral = timeframe === "all";
    const daysLimit = isGeneral ? 365 * 10 : (timeframe ? parseInt(timeframe) : 7); 
    const timeLabel = isGeneral ? "All Time" : `Last ${daysLimit} Days`;
    
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();

    const searchSocialOptions: any = {
      api_key: process.env.TAVILY_API_KEY,
      query: `(site:twitter.com OR site:x.com OR site:facebook.com OR site:tiktok.com OR site:linkedin.com OR site:instagram.com OR site:threads.net) "${targetRegion}" "South Africa" community ordinary people concerned complaining issues protests ${currentMonth} ${currentYear}`,
      search_depth: "advanced", max_results: 50
    };
    if (!isGeneral) searchSocialOptions.days = daysLimit;

    const searchYoutubeOptions: any = {
      api_key: process.env.TAVILY_API_KEY,
      query: `site:youtube.com "${targetRegion}" "South Africa" community residents problems issues ${currentYear}`,
      search_depth: "advanced", max_results: 50
    };
    if (!isGeneral) searchYoutubeOptions.days = daysLimit;

    const searchLocalNewsOptions: any = {
      api_key: process.env.TAVILY_API_KEY,
      query: `(site:caxton.co.za OR site:news24.com OR site:iol.co.za OR site:citizen.co.za OR "local newspaper" OR "community") "${targetRegion}" "South Africa" community residents municipal issues`,
      search_depth: "advanced", max_results: 50
    };
    if (!isGeneral) searchLocalNewsOptions.days = daysLimit;

    // 1. Scraping Live Data - Injecting absolute date strings to combat search engine caching of vintage videos
    const searchSocial = fetch("https://api.tavily.com/search", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchSocialOptions),
    });

    const searchYoutube = fetch("https://api.tavily.com/search", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchYoutubeOptions),
    });

    const searchLocalNews = fetch("https://api.tavily.com/search", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchLocalNewsOptions),
    });

    const [resSocial, resYoutube, resNews] = await Promise.all([searchSocial, searchYoutube, searchLocalNews]);

    if (!resSocial.ok || !resYoutube.ok || !resNews.ok) {
        throw new Error("Tavily API Failure during multi-platform extraction");
    }

    const [dataSocial, dataYoutube, dataNews] = await Promise.all([resSocial.json(), resYoutube.json(), resNews.json()]);

    const contextSocial = (dataSocial.results || []).map((a: any) => `[Social Data] Title: ${a.title}\nURL: ${a.url}\nContent: ${a.content}`).join("\n\n");
    const contextYoutube = (dataYoutube.results || []).map((a: any) => `[YouTube/Video] Title: ${a.title}\nURL: ${a.url}\nContent: ${a.content}`).join("\n\n");
    const contextNews = (dataNews.results || []).map((a: any) => `[Local/Civic News] Title: ${a.title}\nURL: ${a.url}\nContent: ${a.content}`).join("\n\n");

    const fullContext = `${contextSocial}\n\n---\n\n${contextYoutube}\n\n---\n\n${contextNews}`;

    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // 2. Synthesize Deep Report
    const TopicSchema = z.object({
      topicHeadline: z.string().describe("Raw, direct quote native to the people (e.g. 'Potholes destroying cars on Main St'). NO MARKDOWN."),
      context: z.string().describe("2-sentence explanation of what the ordinary man of the street is specifically thinking, saying, or protesting. NO OFFICIAL JARGON. NO MARKDOWN."),
      sentiment: z.enum(["positive", "negative", "volatile"]),
      reliability: z.enum(["Formal/Reliable", "Informal/Unverified"]).describe("If it is from an everyday person, tweet, or social comment it is 'Informal/Unverified'. If it is from a well-known newspaper, verified journalist, or official local outlet it is 'Formal/Reliable'."),
      sourceUrl: z.string().optional().describe("CRITICAL: The exact URL to the video, news article, or social post.")
    });

    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        executiveSummary: z.string().describe(`A paragraph summarizing the core community heartbeat. MUST start exactly with: 'As of ${today}, the latest trends show...' and then summarize what the ordinary man on the street actually cares about today. CRITICAL INSTRUCTION: You MUST use markdown links directly inside this summary text whenever you make a specific claim, e.g., 'according to [local residents](https://example.com)'. Embed the original context links inline to ground the claims. Do NOT use markdown asterisks.`),
        platforms: z.array(z.object({
          platformName: z.enum(["Social Media Networks", "Video Intelligence", "Hyper-Local News"]),
          trends: z.array(TopicSchema).max(25).describe(`Between 0 and 25 verified trends. CRITICAL RULE: If you cannot find REAL data within the last ${timeLabel}, leave this array completely empty. DO NOT HALLUCINATE OR PULL OLD DATA. Sort the trends from newest/most-urgent at the top, down to historic ones at the bottom.`)
        })).min(3).max(3).describe("Exactly 3 strictly named super-platforms merging the raw data effectively.")
      }),
      prompt: `You are a Grassroots Community Listener embedding yourself in the local ecosystem of: ${targetRegion}.
      
      Read the following live intelligence data retrieved strictly for: ${timeLabel} across Social Networks, YouTube, and Civic News.
      Cluster the intelligence into EXACTLY 3 platforms ("Social Media Networks", "Video Intelligence", "Hyper-Local News").
      
      YOUR DIRECTIVE: Give me the street-level truth. What is the ordinary man on the street saying right now? What are they worried about? 
      
      ABSOLUTE HARD RULES:
      0. EXTREME GEOLOCATION STRICTNESS: If a news article, video, or post DOES NOT EXPLICITLY specify the target location (${targetRegion}) or is obviously from a different country (like Indian news instead of South African), DISCARD IT IMMEDIATELY. DO NOT GUESS.
      1. THE TEMPORAL FIREWALL: Sort all identified trends chronologically! Put the absolute latest, breaking, or newest items first in the arrays, then trail off into older/historic issues at the bottom. ${!isGeneral ? `If an item is clearly older than ${daysLimit} days, DO NOT INCLUDE IT.` : ""}
      2. ZERO CORPORATE JARGON: Say exactly what they say: "Residents furious after 3 days without water". Use their voice.
      3. For the Executive Summary, you MUST cite sources inline via Markdown links.
      
      INTELLIGENCE DATA (${targetRegion} - ${timeLabel}):
      ${fullContext}
      `
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("Social Investigation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
