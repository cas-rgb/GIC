"use server";

import { searchCommunityData, deepResearch } from "@/services/tavily-service";
import {
  AISignal,
  PredictionData,
  EngagementStrategy,
  NarrativeDriver,
  RiskIndicator,
  StrategicRecommendation,
  AdvancedInsights,
} from "@/types";
import {
  analyzeCommunitySentiment,
  forecastInfraDemand,
  generateEngagementStrategy,
  analyzeNarrativeAmplification,
  getPredictiveRiskScore,
  generateStrategicRecommendations,
} from "@/services/ai-service";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

// ... existing actions ...

// Server Action for Narrative Analysis
export async function getNarrativeAnalysis(content: string) {
  "use server";
  try {
    const drivers = await analyzeNarrativeAmplification(content);
    return { success: true, data: drivers };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action for Predictive Risk
export async function getPredictiveRisk(signals: AISignal[]) {
  "use server";
  try {
    const risks = await getPredictiveRiskScore(signals);
    return { success: true, data: risks };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action for Strategic Recommendations
export async function getStrategicRecommendationsAction(
  risks: RiskIndicator[],
  province: string,
) {
  "use server";
  try {
    const recommendation = await generateStrategicRecommendations(
      risks,
      province,
    );
    return { success: true, data: recommendation };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action to trigger deep research and save to Firestore
export async function performDeepResearchAction(
  communityId: string,
  communityName: string,
) {
  "use server";

  try {
    // 1. Tavily Search
    const searchResults = await searchCommunityData(
      `${communityName} infrastructure news sentiment 2024`,
    );
    const context = JSON.stringify(searchResults).slice(0, 30000);

    // 2. Vertex AI Analysis
    const signals = await analyzeCommunitySentiment(context);

    // 3. Save to Firestore
    const signalsRef = collection(db, "community_signals");
    for (const signal of signals) {
      await addDoc(signalsRef, {
        ...signal,
        communityId,
        timestamp: serverTimestamp(),
      });
    }

    return { success: true, count: signals.length };
  } catch (error) {
    console.error("Action Error:", error);
    return { success: false, error: String(error) };
  }
}

// Server Action for Demand Forecasting
export async function triggerForecastingAction(
  communityId: string,
  communityName: string,
  category: string,
) {
  "use server";

  try {
    // Fetch recent signals for context
    const q = query(
      collection(db, "community_signals"),
      where("communityId", "==", communityId),
    );
    const snapshot = await getDocs(q);
    const history = snapshot.docs.map((d) => d.data().content).join("\n");

    const forecast = await forecastInfraDemand(
      communityName,
      category,
      history,
    );

    // Update predictions collection
    const predRef = collection(db, "infrastructure_predictions");
    await addDoc(predRef, {
      ...forecast,
      communityId,
      category,
      timestamp: serverTimestamp(),
    });

    return { success: true, forecast };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action for Executive Briefing (Regional Synthesis)
export async function getExecutiveBriefing() {
  "use server";
  try {
    const q = query(
      collection(db, "community_signals"),
      orderBy("timestamp", "desc"),
      limit(20),
    );
    const snapshot = await getDocs(q);
    const signals = snapshot.docs.map((doc) => doc.data().issue).join(". ");

    // This would call Vertex AI to synthesize in a real scenario
    return {
      success: true,
      briefing: `Strategic priority: ${signals.slice(0, 150)}... Infrastructure resilience remains the primary goal across target provinces.`,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action for Advanced Executive Insights (Velocity, Proportionality, Matrix)
export async function getAdvancedInsights() {
  "use server";
  try {
    const q = query(
      collection(db, "community_signals"),
      orderBy("timestamp", "desc"),
    );
    const snapshot = await getDocs(q);
    const signals = snapshot.docs.map((doc) => doc.data());

    if (signals.length === 0) {
      return {
        success: true,
        data: {
          proportionality: [],
          velocity: 0,
          reliability: 85,
          totalSignals: 0,
        },
      };
    }

    // 1. Category Proportionality
    const sectors = ["Civil", "Roads", "Health", "Planning", "Structural"];
    const proportionality = sectors.map((sector) => ({
      name: sector,
      value: signals.filter((s) => s.category === sector).length,
    }));

    // 2. Sentiment Velocity (Simplified acceleration over last 100 signals)
    const recent = signals.slice(0, 100);
    const older = signals.slice(100, 200);

    const getAvgSentiment = (arr: AISignal[]) => {
      if (arr.length === 0) return 50;
      const scores = arr.map((s) =>
        s.sentiment === "positive" ? 90 : s.sentiment === "negative" ? 10 : 50,
      );
      return scores.reduce((a, b) => a + b, 0) / arr.length;
    };

    const velocity =
      getAvgSentiment(recent as AISignal[]) -
      getAvgSentiment(older as AISignal[]);

    // 3. Influencer/Source Reliability (Signals grounded in News vs Social)
    const newsGrounded = signals.filter(
      (s: any) =>
        s.source &&
        (s.source.includes("gov.za") || s.source.includes("news24")),
    ).length;
    const socialGrounded = signals.filter((s: any) => s.platform).length;

    const data: AdvancedInsights = {
      proportionality,
      velocity: Math.round(velocity),
      reliability: Math.round((newsGrounded / signals.length) * 100) || 85,
      totalSignals: signals.length,
    };

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Advanced Insights Error:", error);
    return { success: false, error: String(error) };
  }
}

// Server Action for Strategic Intelligence (Silent Demand, Lookalikes)
export async function getStrategicInsights(serviceId: string = "apex") {
  "use server";
  try {
    const docRef = doc(db, "service_strategic_insights", serviceId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return {
      success: false,
      error: `No strategic insights found for ${serviceId}`,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action to fetch grounded project vulnerability scores
export async function getProjectVulnerability(projectId: string) {
  "use server";
  try {
    const docRef = doc(db, "project_vulnerability_ledger", projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: "No vulnerability data found" };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action to fetch high-volume visual analytics
export async function getVisualAnalytics(serviceId: string = "apex") {
  "use server";
  try {
    const docRef = doc(db, "service_visual_analytics", serviceId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return {
      success: false,
      error: `No visual analytics found for ${serviceId}`,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action to fetch hierarchical logical intelligence
export async function getLogicalIntelligence(
  serviceId: string,
  province: string,
  municipality: string,
) {
  "use server";
  try {
    const docId = `${serviceId}_${province}_${municipality}`.replace(
      /\s+/g,
      "_",
    );
    const docRef = doc(db, "gic_logical_intelligence", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }

    // Fallback to Province 'All' if specific municipality fails
    const fallbackId = `${serviceId}_${province}_All`.replace(/\s+/g, "_");
    const fallbackRef = doc(db, "gic_logical_intelligence", fallbackId);
    const fallbackSnap = await getDoc(fallbackRef);

    if (fallbackSnap.exists()) {
      return { success: true, data: fallbackSnap.data() };
    }

    return {
      success: false,
      error: `No logical intelligence found for ${docId}`,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action to fetch live strategic news
export async function getStrategicNews(query: string, timeframe: "recent" | "historical" = "recent", limit: number = 5) {
  "use server";
  try {
    const { fetchStrategicNews } = await import("@/services/news-service");
    const news = await fetchStrategicNews(query, timeframe, limit);
    return { success: true, data: news };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
// Server Action to fetch grounded signals for a specific community/service
export async function getGroundedSignals(
  communityId: string,
  category: string,
  timeframe: "recent" | "historical" = "recent"
) {
  "use server";
  try {
    const signalsRef = collection(db, "community_signals");
    
    let conditions: any[] = [
      where("communityId", "==", communityId),
      where("category", "==", category)
    ];

    if (timeframe === "recent") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      conditions.push(where("timestamp", ">=", Timestamp.fromDate(thirtyDaysAgo)));
    }

    const q = query(
      signalsRef,
      ...conditions,
      orderBy("timestamp", "desc"),
      limit(10),
    );
    const snapshot = await getDocs(q);
    return {
      success: true,
      data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  } catch (error) {
    console.error("Grounded Signals Error:", error);
    // Fallback to searching if no seeded data exists
    return { success: false, error: String(error) };
  }
}

// Server Action to fetch all signals for a province/service (Apex)
export async function getRegionalPulse(province: string, serviceId: string) {
  "use server";
  try {
    const signalsRef = collection(db, "community_signals");
    const q = query(
      signalsRef,
      where("category", "==", serviceId === "apex" ? "Apex" : serviceId),
      orderBy("timestamp", "desc"),
      limit(20),
    );
    const snapshot = await getDocs(q);
    return {
      success: true,
      data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action to generate Province Briefing (Migrated from Route Loopback)
export async function generateProvinceBriefing(province: string, serviceDomain: string = "all") {
  "use server";
  try {
    const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
    const { generateObject } = await import("ai");
    const { z } = await import("zod");

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.VERTEX_AI_API_KEY || process.env.GEMINI_API_KEY
    });

    const targetRegion = province && province !== "All Provinces" ? province : "South Africa";

    // Grab 7 days of live intel
    const searchRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `"${targetRegion}" ${serviceDomain !== "all" ? serviceDomain : "infrastructure"} South Africa premier executive council politics local government service delivery crisis issues news`,
        search_depth: "advanced", 
        max_results: 10,
        days: 7
      }),
    });

    if (!searchRes.ok) {
        throw new Error("Tavily OSINT API Failed during extraction.");
    }
    
    const searchData = await searchRes.json();
    
    // TRUNCATE contexts heavily to prevent token bleeding
    const osintContext = (searchData.results || []).map((a: any) => `Title: ${a.title}\nContent: ${(a.content || "").slice(0, 1000)}`).join("\n\n---\n\n");

    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        alignments: z.string().describe("A deeply analytical 2-sentence breakdown of the current stability and friction points within the ruling party or coalition. Do NOT use markdown asterisks. Use a highly institutional, strategic tone."),
        primaryLeader: z.string().describe("The name and title of the presiding leader or Premier. E.g. 'Premier Panyaza Lesufi'. No markdown."),
        blindspots: z.array(z.string()).describe("Provide 3-4 highly detailed, 2-sentence strategic blindspots the government structure is facing. Describe the exact failure, the location, and the consequence. No markdown."),
        citizenPriorities: z.array(z.string()).describe("Provide 3-4 highly detailed, 2-sentence infrastructure or service delivery grievances currently affecting communities. Name specific projects or communities. No markdown."),
        status: z.string().describe("E.g. 'Critical Monitoring', 'Heightened Scrutiny', 'Baseline Stability', 'Systemic Failure Warning'. No markdown."),
        atRiskExecutives: z.array(z.object({ 
            name: z.string().describe("Name and title of the executive or department head. No markdown."), 
            reason: z.string().describe("A devastatingly detailed 2-sentence intelligence briefing on exactly why their portfolio is failing and what specific project or tender they bungled. No markdown.") 
        })).describe("Identify 2-3 specific political figures or officials under fire."),
        upcomingFlashpoints: z.array(z.string()).describe("Provide 3-4 highly detailed, 2-sentence intelligence reports on impending protests, strikes, or crises related to current events. No markdown.")
      }),
      prompt: `You are a Tier-1 Intelligence Analyst for the South African Government.
      
      Read the following live OSINT data retrieved strictly from the last 7 days regarding the executive leadership, ${serviceDomain !== "all" ? serviceDomain : "infrastructure"}, and socio-political stability of: ${targetRegion}.
      
      CRITICAL INSTRUCTION: Your output must NOT be "generic, boring, or brief." You must provide extremely detailed, deeply analytical, and highly dramatic intelligence-grade paragraphs. Write in the exact tone of a high-stakes government intelligence briefing.
      Do not invent scenarios; focus strictly on genuine events from the search context. Every array item MUST be at least 2 full, complex sentences.
      
      DO NOT USE ANY MARKDOWN ASTERISKS (** or *) anywhere in the output strings. Keep the text pure.
      
      OSINT DATA:
      ${osintContext}
      `
    });

    // Strip out markdown asterisks safely just in case the model hallucinates them
    const safeObject = JSON.parse(JSON.stringify(object).replace(/\*/g, ""));

    return { success: true, data: safeObject };
  } catch (error) {
    console.error("[generateProvinceBriefing] Error:", error);
    return { success: false, error: String(error) };
  }
}

// Server Action to generate a deeply researched Ward/Community Dossier
export async function generateCommunityDossier(province: string, municipality: string, ward: string) {
  "use server";
  try {
    const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
    const { generateObject } = await import("ai");
    const { z } = await import("zod");

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.VERTEX_AI_API_KEY || process.env.GEMINI_API_KEY
    });

    const locationString = `${ward}, ${municipality}, ${province}, South Africa`;

    // 1. Tavily Search for latest contextual data
    const searchRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `"${locationString}" OR "${ward}" "${municipality}" demographics, socio-economic issues, politics, infrastructure problems, crime, disasters, weather, culture history`,
        search_depth: "advanced", 
        max_results: 15,
        include_images: true,
        days: 30
      }),
    });

    if (!searchRes.ok) {
        throw new Error("Tavily OSINT API Failed during deep community extraction.");
    }
    
    const searchData = await searchRes.json();
    const osintContext = (searchData.results || []).map((a: any) => `Title: ${a.title}\nContent: ${(a.content || "").slice(0, 1500)}`).join("\n\n---\n\n");
    const extractedImages = searchData.images || [];

    const { object } = await generateObject({
      model: google("gemini-2.5-pro"),
      schema: z.object({
        demographics: z.string().describe("2-3 sentences on the population, demographics, and key demographic markers."),
        socioEconomics: z.string().describe("2-3 sentences discussing poverty, employment, and the general socio-economic reality."),
        politicalLandscape: z.string().describe("2-3 sentences on the political leaning, recent elections, or political volatility/tensions."),
        infrastructureIssues: z.string().describe("3-4 sentences detailing explicit infrastructure failures, needs, or ongoing crises (water, electricity, roads)."),
        crimeAndSafety: z.string().describe("1-2 sentences on crime levels or safety concerns."),
        weatherAndEnvironment: z.string().describe("1-2 sentences on local climate challenges or natural disaster risks (flooding, droughts, etc)."),
        cultureAndHistory: z.string().describe("2-3 sentences on the heritage, culture, or historical significance of the area."),
        recentMedia: z.string().describe("2-3 sentences summarizing what local news or social media is currently saying about the area."),
        mainConcerns: z.string().describe("2-3 sentences on the absolute primary pressure point worrying this community right now."),
        engagementStrategy: z.array(z.object({
           action: z.string().describe("A specific action to take."),
           rationale: z.string().describe("Why this action will engage the community, make a difference, or make them happy.")
        })).describe("3 strategic tactics for an outsider/investor/GIC to engage, support, and assist the community meaningfully.")
      }),
      prompt: `You are a Tier-1 Community Intelligence Analyst for the South African Government.
      
      Read the following live OSINT data retrieved strictly from the last 30 days regarding the ward/community of: ${locationString}.
      
      CRITICAL INSTRUCTION: Your goal is to highlight what an outsider (developer, investor, or NGO) would need to know to engage, support, and make a difference in this community.
      Write in the exact tone of a high-stakes government intelligence briefing, yet deeply empathetic to the community's realities.
      
      DO NOT USE ANY MARKDOWN ASTERISKS (** or *) anywhere in the output strings. Keep the text pure.
      If information is missing from the context, infer based on regional knowledge of South Africa, but prioritize the OSINT data.
      
      OSINT DATA:
      ${osintContext}
      `
    });

    const safeObject = JSON.parse(JSON.stringify(object).replace(/\*/g, ""));
    safeObject.images = extractedImages;

    return { success: true, data: safeObject };
  } catch (error) {
    console.error("[generateCommunityDossier] Error:", error);
    return { success: false, error: String(error) };
  }
}
