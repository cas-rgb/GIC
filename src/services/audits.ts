"use server";

import { deepResearch, extractData } from "./tavily-service";
import { geminiPro, extractJsonObject } from "./ai-service";
import { DeepDossier } from "@/types";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function generateDeepAuditDossier(
  community: string,
): Promise<DeepDossier | null> {
  console.log(`Initializing Deep Audit Dossier for: ${community}...`);

  try {
    // 1. Recursive Research Depth
    const searchQuery = `detailed infrastructure status of ${community} South Africa news protests water roads council plans 2024 2025`;
    const searchResults = await deepResearch(searchQuery);

    if (!searchResults || !searchResults.results) return null;

    // 2. Multi-Context Synthesis
    const rawContext = searchResults.results
      .map((r) => `SOURCE: ${r.title}\nCONTENT: ${r.content}`)
      .join("\n\n---\n\n");

    const prompt = `
      You are a Senior Infrastructure Architect at GIC. 
      Generate a STAKEHOLDER DOSSIER for the community of ${community} based on the provided intelligence.
      
      Focus on:
      1. Structural integrity of Civil (Water/Sewage) and Roads.
      2. Sociopolitical volatility (Protests/Labor issues).
      3. Strategic growth potential for GIC projects.
      4. A 36-month predictive forecast.

      Intelligence Context:
      ${rawContext}

      Format as JSON:
      {
        "community": "${community}",
        "summary": "High-level overview",
        "strategicRisks": ["Risk 1", "Risk 2"],
        "growthOpportunities": ["Opp 1", "Opp 2"],
        "influentialNarratives": ["What people are saying"],
        "forecast36m": "Detailed prediction",
        "sources": ["URLs used"]
      }
    `;

    const aiResponse = await geminiPro.generateContent(prompt);
    const dossier: DeepDossier | null = extractJsonObject(
      aiResponse.response.text(),
    );

    if (!dossier) return null;

    // 3. Persist Audit
    await addDoc(collection(db, "deep_audits"), {
      ...dossier,
      timestamp: serverTimestamp(),
      type: "recursive_audit",
    });

    return dossier;
  } catch (error) {
    console.error("Deep Audit Error:", error);
    return null;
  }
}
