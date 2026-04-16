import { NextResponse } from "next/server";
import { rankDocumentsByRelevance } from "@/ai-layer/vector-rag-service";
import { query as pgQuery } from "@/lib/db";
import { validateRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous_ip";
  const rateLimit = validateRateLimit(ip, 20, 60000); // 20 requests per minute
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const { searchQuery } = await req.json();

    if (!searchQuery) {
      return NextResponse.json({ documents: [] });
    }

    // Since this is the RAG endpoint, we fetch the 100 most recent documents from Postgres as our context window
    // (If pgvector was fully implemented, the spatial threshold logic would go here)
    const docsRes = await pgQuery(`
      SELECT d.id, d.title, d.content_text, d.url, d.published_at, s.name as source_name 
      FROM documents d 
      LEFT JOIN sources s ON d.source_id = s.id 
      ORDER BY d.published_at DESC 
      LIMIT 100
    `);

    const rawDocuments = docsRes.rows || [];

    // Route the raw documents and the user's query into the AI Layer for Vector Embedding Comparison
    const rankedDocuments = await rankDocumentsByRelevance(searchQuery, rawDocuments);

    // Return only the top 5 most relevant documents globally
    const topContext = rankedDocuments.slice(0, 5);

    return NextResponse.json({
      status: "success",
      query: searchQuery,
      documents: topContext,
    });

  } catch (error: any) {
    console.error("Vault Search Route Error:", error);
    return NextResponse.json({ error: "Failed to execute Vault RAG engine" }, { status: 500 });
  }
}
