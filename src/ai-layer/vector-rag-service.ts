import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.VERTEX_AI_API_KEY || "");
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function generateEmbeddingVector(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.error("Embedding Generation Error:", error);
    throw new Error("Failed to generate embedding vector");
  }
}

// In-Memory Cosine Similarity Fallback for when PgVector isn't installed natively
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function rankDocumentsByRelevance(query: string, rawDocuments: any[]): Promise<any[]> {
    if(!rawDocuments || rawDocuments.length === 0) return [];
    
    // 1. Convert user query to Vector
    const queryVector = await generateEmbeddingVector(query);
    
    // 2. Map docs to scored objects
    const scoredDocs = await Promise.all(rawDocuments.map(async (doc) => {
        // Mocking document embedding for demo if missing
        const docVector = doc.content_vector || await generateEmbeddingVector(doc.content_text || doc.title);
        const score = calculateCosineSimilarity(queryVector, docVector);
        return { ...doc, rag_score: score };
    }));

    // 3. Sort by highest relevance first
    return scoredDocs.sort((a, b) => b.rag_score - a.rag_score);
}
