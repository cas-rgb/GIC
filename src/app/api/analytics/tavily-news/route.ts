import { NextRequest, NextResponse } from "next/server";
import { deepResearch } from "@/services/tavily-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || "Gauteng";

    /* Broadened query designed to pull macro-political, trending, and social conversations rather than granular service issues */
    const query = `Trending political, social, and major service delivery conversations in ${location} province South Africa. Macro trends, municipal updates, public sentiment, and governance.`;
    const searchData = await deepResearch(query);

    /* Map Tavily response to the structure expected by StrategicNews */
    const articles = searchData?.results?.map((res: any) => ({
      title: res.title,
      description: res.content || res.snippet || "",
      url: res.url,
      publishedAt: new Date().toISOString(),
      source: { name: new URL(res.url).hostname.replace('www.', '') }
    })) || [];

    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load Tavily macro trends" },
      { status: 500 }
    );
  }
}



