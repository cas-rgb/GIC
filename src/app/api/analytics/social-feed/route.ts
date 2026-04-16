import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const municipality = request.nextUrl.searchParams.get("municipality");
  const province = request.nextUrl.searchParams.get("province") || "Gauteng";
  const domain = request.nextUrl.searchParams.get("serviceDomain") || "infrastructure";
  const days = parseInt(request.nextUrl.searchParams.get("days") || "30", 10);

  try {
    let sqlQuery = `
      select 
        id, 
        what_happened, 
        why_it_happened, 
        when_timeline, 
        source_evidence, 
        service_category,
        confidence_score,
        created_at
      from ai_narrative_synthesis
      where (lens = 'social' or lens = 'municipality' or lens = 'ward')
    `;
    const params: any[] = [];

    if (municipality && municipality !== "All Municipalities") {
      sqlQuery += ` and municipality = $1`;
      params.push(municipality);
    } else {
      sqlQuery += ` and province = $1`;
      params.push(province);
    }

    if (domain && domain !== "all") {
      sqlQuery += ` and service_category = $${params.length + 1}`;
      params.push(domain);
    }

    sqlQuery += ` and created_at >= $${params.length + 1}`;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    params.push(cutoffDate.toISOString());
    sqlQuery += ` order by created_at desc limit 75`;

    const result = await query(sqlQuery, params);

    // Map rows to News/Social format
    const articles = result.rows.map((r: any) => ({
      id: r.id,
      title: r.what_happened.substring(0, 100) + "...",
      description: r.why_it_happened,
      url: "#",
      provider: r.source_evidence ? r.source_evidence.substring(0, 30) : "Social Mining Agent",
      publishedAt: r.created_at,
      score: r.confidence_score,
      category: r.service_category,
    }));

    // Word Cloud extraction from what_happened and why_it_happened
    let textCorpus = result.rows.map((r: any) => r.what_happened + " " + r.why_it_happened).join(" ");
    const stopWords = new Set([
      "the", "and", "a", "to", "of", "some", "what", "how", "has", "have",
      "in", "for", "is", "on", "that", "by", "this", "with", "i", "you",
      "it", "not", "or", "be", "are", "from", "at", "as", "their", "will",
      "would", "can", "they", "we", "but", "an", "all", "so", "our", "no", "he", "she", "was"
    ]);

    const wordCounts: Record<string, number> = {};
    const tokens = textCorpus.toLowerCase().replace(/[^a-z0-9\\s]/g, "").split(/\\s+/);
    tokens.forEach((token: string) => {
      if (token.length > 3 && !stopWords.has(token)) {
        wordCounts[token] = (wordCounts[token] || 0) + 1;
      }
    });

    const wordMap = Object.entries(wordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    // Synthetic Sentiment Velocity based on volume
    const baseScore = result.rows.length > 5 ? 35 : 65; // High volume = Bad sentiment for utility complaints
    const sentiment = Array.from({ length: 7 }).map((_, i) => ({
      date: `Day ${i + 1}`,
      score: Math.max(0, Math.min(100, baseScore + (i % 3 === 0 ? 5 : (i % 2 === 0 ? -2 : 4)))),
    }));

    const narrativeResult = await query(
      `SELECT * FROM social_narratives WHERE province = $1 ORDER BY created_at DESC LIMIT 4`,
      [province]
    );

    const urgentNarratives = narrativeResult.rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      threat: r.threat_level,
      description: r.description,
      platform: r.source_platform
    }));

    return NextResponse.json({
      articles,
      wordMap,
      sentiment,
      isRisk: sentiment[sentiment.length - 1].score < 30,
      urgentNarratives
    });

  } catch (error) {
    console.error("Failed to fetch custom social feed:", error);
    return NextResponse.json({ error: "Failed to fetch social feed." }, { status: 500 });
  }
}


