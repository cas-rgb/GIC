import { NextResponse } from "next/server";
import { validateRateLimit } from "@/lib/rate-limit";
import { fetchRecentSocialDocuments } from "@/data-layer/social-repository";
import { processSocialMetrics } from "@/analytics-layer/social-analytics";
import { generateExecutiveBriefing } from "@/ai-layer/executive-briefing";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Grant extended execution time for generative synthesis

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous_ip";
  const rateLimit = validateRateLimit(ip, 15, 60000); // 15 requests per minute
  if (!rateLimit.success) {
    return NextResponse.json({ error: rateLimit.message }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const province = searchParams.get("province") || "All Provinces";

  try {
    // 1. DATA LAYER: Pure retrieval
    const rawDocuments = await fetchRecentSocialDocuments(15);

    // 2. ANALYTICS LAYER: Mathematical extraction and formatting
    const metrics = processSocialMetrics(rawDocuments as any);

    // 3. AI LAYER: Generative Synthesis
    const executiveSummary = await generateExecutiveBriefing(
      province, 
      metrics.youtubeDocs, 
      metrics.articleDocs, 
      metrics.velocityDocs
    );

    return NextResponse.json({
      province,
      lastUpdated: new Date().toISOString(),
      executiveSummary,
      youtubeTrends: metrics.youtubeTrends,
      trendingArticles: metrics.trendingArticles,
      platformVelocity: metrics.platformVelocity
    });

  } catch (error) {
    console.error("Deep Social GET error:", error);
    return NextResponse.json({ error: "Failed to fetch deep social analytics" }, { status: 500 });
  }
}

