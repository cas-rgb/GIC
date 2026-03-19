import { createRequire } from "module";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const { searchCommunityData } = require("../src/services/tavily-service");

// Initialise Gemini
const apiKey = process.env.VERTEX_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const geminiFlash = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// Initialise Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const PROVINCES = [
  "All Provinces",
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
];

const PROMPT_TEMPLATE = `
You are an expert digital intelligence analyst for the South African Government.
Analyze the following deep web search data retrieved for: {PROVINCE}. Date Context: {DATE}
Extract and synthesize the data into a strictly formatted JSON object capturing macro-level trends.

CRITICAL INSTRUCTION: DO NOT HALLUCINATE OR INVENT ANY URLS.

Return ONLY a raw JSON object (no markdown, no backticks). The JSON must perfectly match this schema:

{
  "executiveSummary": "Write a highly detailed intelligence briefing defining the media/social media landscape right now. If {PROVINCE} is 'All Provinces', write a general National overview followed by a province-by-province breakdown of what is going on today. If {PROVINCE} is a specific province, focus entirely on that province alone. Base this heavily on the REAL context extracted.",
  "youtubeTrends": [
    {
      "title": "Exact title of a highly relevant political/infrastructure video",
      "channel": "Name of the channel (e.g., SABC News, eNCA)",
      "views": 154000,
      "publishedAt": "ISO date string or '2 days ago'",
      "url": "Extract the exact YouTube URL from the RAW WEB DATA. If none exists, output: 'https://www.youtube.com/results?search_query=INSERT_URL_ENCODED_TITLE'"
    }
  ],
  "trendingArticles": [
    {
      "headline": "High-traction article headline",
      "source": "News outlet name",
      "url": "EXTRACT THE EXACT URL FROM THE RAW WEB DATA. DO NOT INVENT THIS.",
      "engagement": 1200
    }
  ],
  "platformVelocity": [
    {
      "platform": "X",
      "trendingTopic": "The #1 topic on this platform for this province",
      "sentiment": "Bearish",
      "tractionScore": 85,
      "url": "https://x.com/search?q=INSERT_URL_ENCODED_TOPIC"
    },
    { "platform": "LinkedIn", "trendingTopic": "...", "sentiment": "Bullish", "tractionScore": 75, "url": "https://www.linkedin.com/search/results/all/?keywords=INSERT_URL_ENCODED_TOPIC" },
    { "platform": "Facebook", "trendingTopic": "...", "sentiment": "Volatile", "tractionScore": 60, "url": "https://www.facebook.com/search/top?q=INSERT_URL_ENCODED_TOPIC" }
  ]
}

RAW WEB DATA:
{SEARCH_CONTENT}
`;

function extractJson(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.warn("Failed to parse JSON:", error);
    return null;
  }
}

async function mineProvince(province: string) {
  const currentDate = new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  console.log("--- Mining Deep Social Insights for: " + province + " on " + currentDate + " ---");

  // Build strategic search queries
  const scope = province === "All Provinces" ? "South Africa National" : province + " Province South Africa";
  const queries = [
    '"' + scope + '" trending YouTube news politics infrastructure service delivery',
    '"' + scope + '" trending Twitter X Facebook social media complaints issues',
    '"' + scope + '" most shared articles government protests economy'
  ];

  let combinedContent = "";
  for (const q of queries) {
    try {
      console.log("  🔍 Tavily Search: " + q);
      const searchData = await searchCommunityData(q);
      if (searchData && searchData.results) {
        combinedContent += searchData.results.map((r: any) => "Title: " + r.title + "\nURL: " + r.url + "\nContent: " + (r.content || r.snippet) + "\n\n").join("");
      }
    } catch (e) {
      console.error("  ❌ Tavily failed for " + q, e);
    }
  }

  // Cap content
  const maxContent = combinedContent.substring(0, 30000);
  console.log("  🧠 Synthesizing " + maxContent.length + " chars via Gemini...");
  
  const prompt = PROMPT_TEMPLATE
    .replace(/{PROVINCE}/g, province)
    .replace(/{DATE}/g, currentDate)
    .replace("{SEARCH_CONTENT}", maxContent);

  try {
    const result = await geminiFlash.generateContent(prompt);
    const data = extractJson(result.response.text());

    if (!data || !data.platformVelocity) {
      throw new Error("Invalid or empty JSON generated.");
    }

    console.log("  ✅ Synthesis Complete. Found " + (data.youtubeTrends?.length || 0) + " YT videos.");

    // Write to Firestore
    await setDoc(doc(db, "deepSocialInsights", province), {
      ...data,
      lastUpdated: new Date().toISOString(),
      province
    });

    console.log("  💾 Saved deep insights for " + province + " to Firestore.");

  } catch (e) {
    console.error("  ❌ Synthesis/Save failed for " + province, e);
  }
}

async function runMiner() {
  console.log("🚀 Starting Deep Social & Media Miner");
  
  for (const province of PROVINCES) {
    await mineProvince(province);
    // Rate limit delay
    await new Promise(r => setTimeout(r, 3000));
  }
  
  console.log("✅ Deep Social Miner execution completed effectively.");
  process.exit(0);
}

runMiner().catch((e) => {
  console.error("Fatal Error:", e);
  process.exit(1);
});
