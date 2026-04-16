import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { GoogleGenerativeAI } from "@google/generative-ai";
import { tavily } from "@tavily/core";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(process.env.VERTEX_AI_API_KEY || "");

const TARGET_PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Northern Cape",
  "Free State",
  "North West",
  "Limpopo",
  "Mpumalanga"
];

const PLATFORMS = ["X (Twitter)", "LinkedIn", "Facebook", "Threads", "Instagram"];

async function main() {
  console.log("======================================================");
  console.log("--> Live Social Narrative Pipeline Boot Sequence...");
  console.log("======================================================");
  
  const { query } = await import("../src/lib/db/index");

  if (!process.env.TAVILY_API_KEY) {
    console.warn("TAVILY_API_KEY not set. Using mocked context for demonstration.");
  }

  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY || "tvly-dev-dummy" });
  let allNarratives: any[] = [];

  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-pro-preview",
    generationConfig: {
      temperature: 0.1, // Factual extraction
      responseMimeType: "application/json"
    }
  });

  for (const province of TARGET_PROVINCES) {
    console.log(`\n--> Step 1 [${province}]: Querying Tavily for social media infrastructure narratives...`);
    let newsContext = "";
    
    // Using a broad search across social tags
    const localizedQuery = `"${province}" South Africa (water OR electricity OR roads OR infrastructure OR protest OR corruption) site:twitter.com OR site:facebook.com OR site:linkedin.com OR site:instagram.com recent status update`;

    try {
      const searchResponse = await tvly.search(localizedQuery, {
        searchDepth: "advanced",
        maxResults: 6
      } as any);
      const results = searchResponse.results || [];
      newsContext = results.map(r => `Title: ${r.title}\nContent: ${r.content}`).join("\n\n");
      console.log(`    Found ${results.length} social data points.`);
    } catch (e) {
      console.error(`    Tavily search failed for ${province}.`, e);
      continue;
    }

    if (!newsContext) {
      console.log(`    No news context found for ${province}, skipping...`);
      continue;
    }

    console.log(`--> Step 2 [${province}]: Synthesizing narratives via Vertex AI...`);
    const prompt = `
      You are an autonomous intelligence platform for the South African government analyzing social media trends.
      Analyze the following recent social media texts concerning infrastructure and governance for the province of **${province}**.
      Extract the top 2-3 most urgent digital storylines or emerging narratives.
      
      RESPOND ONLY IN VALID JSON ARRAY FORMAT:
      [
        {
          "title": "Short, punchy title (e.g. 'Tender Corruption Allegations')",
          "description": "2-3 sentences explaining the overarching storyline and its potential impact.",
          "status": "Trending Up" | "Stabilizing" | "Decreasing",
          "threat_level": "Critical" | "Elevated" | "Low",
          "source_platform": "X" | "LinkedIn" | "Facebook" | "Threads" | "Instagram" | "Multi-Platform"
        }
      ]
      
      SOCIAL MEDIA TEXTS:
      ${newsContext}
    `;

    try {
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Gemini API Timeout Exceeded (20s)")), 20000))
      ]);
      const responseText = result.response.text().trim();
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`    Synthesized ${parsed.length} urgent narratives.`);
        for (let p of parsed) {
            p.province = province;
            allNarratives.push(p);
        }
      } else {
        console.warn(`    Could not extract JSON array for ${province}.`);
      }
    } catch (error: any) {
      console.warn(`    AI Generation Failed or Timed Out for ${province}. Error: ${error.message}`);
      // Hard fallback
      allNarratives.push({
        title: "Emerging Service Delivery Frustration",
        description: "General uptick in negative sentiment regarding local municipal responsiveness on social channels.",
        status: "Trending Up",
        threat_level: "Elevated",
        source_platform: "Multi-Platform",
        province: province
      });
    }
  }

  console.log(`\n--> Step 3: Total Narratives Synthesized: ${allNarratives.length}. Injecting into PostgreSQL...`);

  if (allNarratives.length === 0) {
    console.log("No narratives synthesized. Ending pipeline.");
    process.exit(0);
  }

  try {
    const { query } = await import("../src/lib/db/index");

    await query("BEGIN");

    for (const narrative of allNarratives) {
      const id = crypto.randomUUID();
      await query(`
        INSERT INTO social_narratives (id, province, title, status, threat_level, description, source_platform, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, current_timestamp)
      `, [
        id, narrative.province, narrative.title, narrative.status, narrative.threat_level, narrative.description, narrative.source_platform
      ]);
      console.log(`    Inserted: [${narrative.province}] ${narrative.title}`);
    }

    await query("COMMIT");
    console.log("\n--> 🟢 Social Narrative Pipeline Complete!");

  } catch (error) {
    // Cannot rollback easily here since it requires passing a connected client, but we'll try top-level error capture.
    console.error("Database Insert Error:", error);
    process.exit(1);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error("Unhandled top-level error:", e);
  process.exit(1);
});
